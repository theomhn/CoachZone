<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

/**
 * Contrôleur pour la vérification de token de réinitialisation
 * 
 * Vérifie si un token de réinitialisation est valide et non expiré.
 */
#[AsController]
class VerifyResetTokenController extends AbstractController
{
    public function __invoke(
        Request $request,
        ResetPasswordHelperInterface $resetPasswordHelper
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['token'])) {
            return $this->json([
                'error' => 'Token requis'
            ], 400);
        }

        $token = $data['token'];

        try {
            $resetPasswordHelper->validateTokenAndFetchUser($token);
            return $this->json([
                'valid' => true,
                'message' => 'Token valide'
            ]);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json([
                'valid' => false,
                'message' => 'Token invalide ou expiré'
            ], 400);
        }
    }
}