<?php

namespace App\DataProvider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Coach;
use App\Repository\InstitutionRepository;
use Symfony\Bundle\SecurityBundle\Security;

class InstitutionCollectionDataProvider implements ProviderInterface
{
    public function __construct(
        private InstitutionRepository $institutionRepository,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // Récupérer toutes les institutions
        $institutions = $this->institutionRepository->findAll();

        // Récupérer le coach connecté pour marquer les favoris
        $user = $this->security->getUser();

        if ($user instanceof Coach) {
            // Récupérer les IDs des institutions favorites du coach
            $favoriteInstitutionIds = [];
            foreach ($user->getFavoriteInstitutions() as $favoriteInstitution) {
                $favoriteInstitutionIds[] = $favoriteInstitution->getId();
            }

            // Marquer les institutions favorites
            foreach ($institutions as $institution) {
                $institution->isFavorite = in_array($institution->getId(), $favoriteInstitutionIds);
            }
        }

        return $institutions;
    }
}
