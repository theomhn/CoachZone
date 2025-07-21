<?php

namespace App\Controller;

use App\Entity\Coach;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[AsController]
class CoachFavoritesController extends AbstractController
{
    #[IsGranted('ROLE_COACH')]
    public function __invoke(#[CurrentUser] Coach $coach): JsonResponse
    {
        $favorites = [];

        foreach ($coach->getFavoriteInstitutions() as $institution) {
            // Utiliser directement les données de l'institution (pas d'enrichissement)
            $favorites[] = [
                'id' => $institution->getId(),
                'inst_numero' => $institution->getInstNumero(),
                'inst_name' => $institution->getInstName(),
                'adresse' => $institution->getAdresse(),
                'ville' => $institution->getVille(),
                'coordonnees' => $institution->getCoordonnees(),
                'activites' => $institution->getActivites(),
                'equipements' => $institution->getEquipements(),
            ];
        }

        return new JsonResponse([
            'favoriteInstitutions' => $favorites
        ]);
    }
}
