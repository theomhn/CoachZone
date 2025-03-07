<?php

namespace App\Service;

use App\Entity\Place;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PlaceSyncService
{
    private const LIMIT_PER_PAGE = 100;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly EntityManagerInterface $entityManager
    ) {}

    public function synchronizePlaces(): void
    {
        $offset = 0;
        $totalProcessed = 0;

        do {
            $response = $this->httpClient->request('GET', 'https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records', [
                'query' => [
                    'where' => 'inst_com_nom LIKE "montpellier"',
                    'limit' => self::LIMIT_PER_PAGE,
                    'offset' => $offset,
                    'refine' => 'dep_code_filled:"34"'
                ]
            ]);

            $jsonData = $response->toArray();

            if (!isset($jsonData['results'])) {
                throw new \RuntimeException('Invalid API response structure');
            }

            $totalCount = $jsonData['total_count'];
            $results = $jsonData['results'];

            foreach ($results as $placeData) {
                foreach ($placeData as $key => $value) {
                    if (is_string($value)) {
                        try {
                            $decoded = json_decode($value, true);
                            if (json_last_error() === JSON_ERROR_NONE) {
                                $placeData[$key] = $decoded;
                            }
                        } catch (\Exception $err) {
                            // Ignorer les erreurs de parsing
                        }
                    }
                }

                $place = $this->entityManager->getRepository(Place::class)
                    ->find($placeData['equip_numero']);

                if (!$place) {
                    $place = new Place();
                    $place->setId($placeData['equip_numero']);
                }

                $place->setInstitutionNumero($placeData['inst_numero']);
                $place->setInstitutionName($placeData['inst_nom']);
                $place->setData($placeData);
                $place->setLastUpdate(new \DateTimeImmutable());

                $this->entityManager->persist($place);
                $totalProcessed++;
            }

            $this->entityManager->flush();
            $offset += self::LIMIT_PER_PAGE;
        } while ($offset < $totalCount);

        echo "Processed $totalProcessed places out of $totalCount total\n";
    }
}
