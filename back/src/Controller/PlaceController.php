<?php

namespace App\Controller;

use App\Repository\PlaceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PlaceController extends AbstractController
{
    #[Route('/api/places', name: 'api_places_list', methods: ['GET'])]
    public function listPlaces(PlaceRepository $placeRepository): Response
    {
        $places = $placeRepository->findAllWithInstitution();

        return $this->json($places);
    }
}
