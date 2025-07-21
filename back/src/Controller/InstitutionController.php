<?php

namespace App\Controller;

use App\Repository\OpenDataRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class InstitutionController extends AbstractController
{
    public function __invoke(OpenDataRepository $openDataRepository): Response
    {
        $institutions = $openDataRepository->findDistinctInstitutions();

        return $this->json($institutions);
    }
}
