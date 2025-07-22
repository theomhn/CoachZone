<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

/**
 * Contrôleur pour la réinitialisation effective du mot de passe
 * 
 * Réinitialise le mot de passe d'un utilisateur avec un token valide.
 */
#[AsController]
class ResetPasswordController extends AbstractController
{
    public function __invoke(
        Request $request,
        ResetPasswordHelperInterface $resetPasswordHelper,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['token']) || !isset($data['password'])) {
            return $this->json([
                'error' => 'Token et mot de passe requis'
            ], 400);
        }

        $token = $data['token'];
        $plainPassword = $data['password'];
        $confirmPassword = $data['confirmPassword'] ?? null;

        // Validation du mot de passe
        $violations = $validator->validate($plainPassword, [
            new Assert\NotBlank(message: 'Le mot de passe ne peut pas être vide'),
            new Assert\Length(
                min: 8,
                minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caractères'
            ),
            new Assert\Regex(
                pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/',
                message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
            )
        ]);

        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[] = $violation->getMessage();
            }
            return $this->json(['errors' => $errors], 400);
        }

        // Vérification de la confirmation de mot de passe (si fournie)
        if ($confirmPassword !== null && $plainPassword !== $confirmPassword) {
            return $this->json([
                'error' => 'Les mots de passe ne correspondent pas'
            ], 400);
        }

        try {
            $user = $resetPasswordHelper->validateTokenAndFetchUser($token);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json([
                'error' => 'Token invalide ou expiré: ' . $e->getReason()
            ], 400);
        }

        // Le token est valide, réinitialiser le mot de passe
        $resetPasswordHelper->removeResetRequest($token);

        // Encoder le nouveau mot de passe
        $encodedPassword = $passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($encodedPassword);

        $userRepository->save($user, true);

        return $this->json([
            'message' => 'Mot de passe réinitialisé avec succès',
            'success' => true
        ]);
    }
}