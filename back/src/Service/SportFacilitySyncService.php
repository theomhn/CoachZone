<?php

namespace App\Service;

use App\Entity\PublicSportFacility;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SportFacilitySyncService
{
    private const LIMIT_PER_PAGE = 100;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly EntityManagerInterface $entityManager
    ) {}

    public function synchronizeFacilities(): void
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

            foreach ($results as $facilityData) {
                // Traiter les champs JSON dans les données
                foreach ($facilityData as $key => $value) {
                    if (is_string($value)) {
                        try {
                            $decoded = json_decode($value, true);
                            if (json_last_error() === JSON_ERROR_NONE) {
                                $facilityData[$key] = $decoded;
                            }
                        } catch (\Exception $err) {
                            // Ignorer les erreurs de parsing
                        }
                    }
                }

                // Récupérer ou créer l'entité
                $facility = $this->entityManager->getRepository(PublicSportFacility::class)
                    ->find($facilityData['equip_numero']);

                if (!$facility) {
                    $facility = new PublicSportFacility();
                    $facility->setId($facilityData['equip_numero']);
                }

                $facility->setData($facilityData);
                $facility->setLastUpdate(new \DateTimeImmutable());

                $this->entityManager->persist($facility);
                $totalProcessed++;
            }

            $this->entityManager->flush();
            $offset += self::LIMIT_PER_PAGE;
        } while ($offset < $totalCount);

        echo "Processed $totalProcessed facilities out of $totalCount total\n";
    }
}
