<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class PasswordRequirementsController extends AbstractController
{
    #[IsGranted('ROLE_USER')]
    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            'requirements' => [
                'minLength' => 8,
                'requireUppercase' => true,
                'requireLowercase' => true,
                'requireNumber' => true,
                'description' => 'Le mot de passe doit contenir au moins 8 caractères avec au moins une majuscule, une minuscule et un chiffre'
            ]
        ]);
    }
}