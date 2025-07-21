<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Place;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class PlacePriceUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Place) {
            return $data;
        }

        // Sauvegarder les modifications
        $this->entityManager->flush();

        // Retourner une réponse JSON avec message de confirmation
        return new JsonResponse([
            'message' => 'Prix mis à jour avec succès',
            'place_id' => $data->getId(),
            'new_price' => $data->getPrice()
        ], Response::HTTP_OK);
    }
}
