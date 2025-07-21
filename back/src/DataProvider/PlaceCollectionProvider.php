<?php

namespace App\DataProvider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Place;
use App\Repository\PlaceRepository;
use Symfony\Component\HttpFoundation\RequestStack;

class PlaceCollectionProvider implements ProviderInterface
{
    public function __construct(
        private PlaceRepository $placeRepository,
        private RequestStack $requestStack
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $request = $this->requestStack->getCurrentRequest();
        $instNumero = $request->query->get('inst_numero');

        if ($instNumero !== null) {
            // Si un inst_numero est fourni, on trouve les places de cette institution
            return $this->placeRepository->findByInstitutionNumero($instNumero);
        } else {
            // Retourner toutes les places
            return $this->placeRepository->findAll();
        }
    }
}
