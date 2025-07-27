<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\PasswordChangeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class PasswordChangeController extends AbstractController
{
    public function __construct(
        private PasswordChangeService $passwordChangeService,
        private ValidatorInterface $validator
    ) {
    }

    #[IsGranted('ROLE_USER')]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Vérification des champs requis
        $requiredFields = ['currentPassword', 'newPassword', 'confirmPassword'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                return new JsonResponse([
                    'error' => "Le champ {$field} est requis"
                ], 400);
            }
        }

        $currentPassword = trim($data['currentPassword']);
        $newPassword = trim($data['newPassword']);
        $confirmPassword = trim($data['confirmPassword']);

        // Validation du nouveau mot de passe
        $violations = $this->validator->validate($newPassword, [
            new Assert\NotBlank(message: "Le nouveau mot de passe est requis"),
            new Assert\Length(
                min: 8, 
                minMessage: "Le mot de passe doit contenir au moins {{ limit }} caractères"
            ),
            new Assert\Regex(
                pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
                message: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
            )
        ]);

        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[] = $violation->getMessage();
            }
            return new JsonResponse(['errors' => $errors], 400);
        }

        // Vérification que les nouveaux mots de passe correspondent
        if ($newPassword !== $confirmPassword) {
            return new JsonResponse([
                'error' => 'La confirmation du mot de passe ne correspond pas'
            ], 400);
        }

        // Vérification que le nouveau mot de passe est différent de l'ancien
        if ($currentPassword === $newPassword) {
            return new JsonResponse([
                'error' => 'Le nouveau mot de passe doit être différent de l\'ancien'
            ], 400);
        }

        /** @var User $user */
        $user = $this->getUser();

        try {
            $success = $this->passwordChangeService->changePassword(
                $user, 
                $currentPassword, 
                $newPassword
            );

            if ($success) {
                return new JsonResponse([
                    'message' => 'Votre mot de passe a été mis à jour avec succès',
                    'timestamp' => (new \DateTime('now', new \DateTimeZone('Europe/Paris')))->format('Y-m-d H:i:s')
                ]);
            } else {
                return new JsonResponse([
                    'error' => 'Le mot de passe actuel est incorrect'
                ], 400);
            }
        } catch (\Exception) {
            return new JsonResponse([
                'error' => 'Erreur lors de la mise à jour du mot de passe'
            ], 500);
        }
    }

}