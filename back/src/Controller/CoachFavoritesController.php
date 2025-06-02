<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Service\InstitutionEnrichmentService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[AsController]
class CoachFavoritesController extends AbstractController
{
    public function __construct(
        private InstitutionEnrichmentService $institutionEnrichmentService
    ) {}

    #[IsGranted('ROLE_COACH')]
    public function __invoke(#[CurrentUser] Coach $coach): JsonResponse
    {
        $favorites = [];

        foreach ($coach->getFavoriteInstitutions() as $institution) {
            // Enrichir l'institution avec les données des places
            $enrichedInstitution = $this->institutionEnrichmentService->enrichInstitution($institution);

            $favorites[] = [
                'id' => $enrichedInstitution->getId(),
                'inst_numero' => $enrichedInstitution->getInstNumero(),
                'inst_name' => $enrichedInstitution->getInstName(),
                'adresse' => $enrichedInstitution->adresse,
                'coordonnees' => $enrichedInstitution->coordonnees,
                'activites' => $enrichedInstitution->activites,
                'equipements' => $enrichedInstitution->equipements,
            ];
        }

        return new JsonResponse([
            'favoriteInstitutions' => $favorites
        ]);
    }
}
