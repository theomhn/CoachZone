<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

/**
 * Contrôleur pour la demande de réinitialisation de mot de passe
 * 
 * Gère l'envoi d'emails de réinitialisation de mot de passe.
 */
#[AsController]
class ForgotPasswordController extends AbstractController
{
    public function __invoke(
        Request $request,
        ResetPasswordHelperInterface $resetPasswordHelper,
        UserRepository $userRepository,
        EmailService $emailService,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'])) {
            return $this->json([
                'error' => 'Email requis'
            ], 400);
        }

        $email = $data['email'];

        // Validation de l'email
        $violations = $validator->validate($email, [
            new Assert\NotBlank(message: 'L\'email ne peut pas être vide'),
            new Assert\Email(message: 'Format d\'email invalide')
        ]);

        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[] = $violation->getMessage();
            }
            return $this->json(['errors' => $errors], 400);
        }

        return $this->processSendingPasswordResetEmail(
            $email,
            $resetPasswordHelper,
            $userRepository,
            $emailService
        );
    }

    private function processSendingPasswordResetEmail(
        string $emailFormData,
        ResetPasswordHelperInterface $resetPasswordHelper,
        UserRepository $userRepository,
        EmailService $emailService
    ): JsonResponse {
        $user = $userRepository->findOneBy(['email' => $emailFormData]);

        // Ne pas révéler si l'utilisateur existe ou non
        if (!$user) {
            return $this->json([
                'message' => 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation.',
                'success' => true
            ]);
        }

        try {
            $resetToken = $resetPasswordHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json([
                'error' => 'Problème lors de la génération du token: ' . $e->getReason()
            ], 400);
        }

        // Envoyer l'email avec notre service d'email personnalisé
        try {
            $emailService->sendPasswordResetEmailWithBundle($user, $resetToken->getToken());
        } catch (\Exception $e) {
            error_log('Erreur lors de l\'envoi d\'email de reset: ' . $e->getMessage());
            return $this->json([
                'error' => 'Une erreur est survenue lors de l\'envoi de l\'email.'
            ], 500);
        }

        return $this->json([
            'message' => 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation.',
            'success' => true
        ]);
    }
}