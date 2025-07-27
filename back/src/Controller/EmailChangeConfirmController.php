<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\EmailChangeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class EmailChangeConfirmController extends AbstractController
{
    public function __construct(
        private EmailChangeService $emailChangeService
    ) {
    }

    #[IsGranted('ROLE_USER')]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['code'])) {
            return new JsonResponse([
                'error' => 'Le code de vérification est requis'
            ], 400);
        }

        $code = trim($data['code']);
        
        // Validation du code
        if (strlen($code) !== 6 || !ctype_digit($code)) {
            return new JsonResponse([
                'error' => 'Le code doit contenir exactement 6 chiffres'
            ], 400);
        }

        /** @var User $user */
        $user = $this->getUser();
        
        try {
            $success = $this->emailChangeService->confirmEmailChange($user, $code);
            
            if ($success) {
                return new JsonResponse([
                    'message' => 'Votre adresse email a été mise à jour avec succès',
                    'newEmail' => $user->getEmail(),
                    'info' => 'Vos sessions restent actives avec la nouvelle adresse'
                ]);
            } else {
                return new JsonResponse([
                    'error' => 'Code de vérification invalide ou expiré'
                ], 400);
            }
        } catch (\Exception) {
            return new JsonResponse([
                'error' => 'Erreur lors de la confirmation du changement d\'email'
            ], 500);
        }
    }
}