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
            $favorites[] = [
                'id' => $institution->getId(),
                'inst_numero' => $institution->getInstNumero(),
                'inst_name' => $institution->getInstName(),
                'adresse' => $institution->adresse,
                'coordonnees' => $institution->coordonnees,
                'activites' => $institution->activites,
                'equipements' => $institution->equipements,
            ];
        }

        return new JsonResponse([
            'favoriteInstitutions' => $favorites
        ]);
    }
}
