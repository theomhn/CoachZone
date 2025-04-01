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
        $id = $request->query->get('id');
        $instNumero = $request->query->get('inst_numero');

        if ($id !== null) {
            // Si un id est fourni, on filtre par id
            return $this->placeRepository->findBy(['id' => $id]);
        } else {
            // Pour tous les autres cas, on utilise notre méthode combinée
            return $this->placeRepository->findPlacesWithInstitution($instNumero);
        }
    }
}
