<?php

namespace App\Controller;

use App\Repository\PlaceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class InstitutionController extends AbstractController
{
    public function __invoke(PlaceRepository $placeRepository): Response
    {
        $institutions = $placeRepository->findDistinctInstitutions();

        return $this->json($institutions);
    }
}
