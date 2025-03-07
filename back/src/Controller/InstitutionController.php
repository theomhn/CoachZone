<?php

namespace App\Controller;

use App\Repository\PlaceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class InstitutionController extends AbstractController
{
    #[Route('/api/opendata/institutions', name: 'api_institutions_list', methods: ['GET'])]
    public function listInstitutions(PlaceRepository $placeRepository): Response
    {
        $institutions = $placeRepository->findDistinctInstitutions();

        return $this->json($institutions);
    }
}
