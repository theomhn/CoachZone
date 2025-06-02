<?php

namespace App\DataProvider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Coach;
use App\Repository\InstitutionRepository;
use App\Service\InstitutionEnrichmentService;
use Symfony\Bundle\SecurityBundle\Security;

class InstitutionCollectionDataProvider implements ProviderInterface
{
    public function __construct(
        private InstitutionRepository $institutionRepository,
        private InstitutionEnrichmentService $institutionEnrichmentService,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // Récupérer toutes les institutions
        $institutions = $this->institutionRepository->findAll();

        // Enrichir chaque institution avec les données des places
        $enrichedInstitutions = $this->institutionEnrichmentService->enrichInstitutions($institutions);

        // Récupérer le coach connecté pour marquer les favoris
        $user = $this->security->getUser();

        if ($user instanceof Coach) {
            // Récupérer les IDs des institutions favorites du coach
            $favoriteInstitutionIds = [];
            foreach ($user->getFavoriteInstitutions() as $favoriteInstitution) {
                $favoriteInstitutionIds[] = $favoriteInstitution->getId();
            }

            // Marquer les institutions favorites
            foreach ($enrichedInstitutions as $institution) {
                $institution->isFavorite = in_array($institution->getId(), $favoriteInstitutionIds);
            }
        }

        return $enrichedInstitutions;
    }
}
