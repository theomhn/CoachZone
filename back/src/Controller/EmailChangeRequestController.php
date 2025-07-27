<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\EmailChangeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class EmailChangeRequestController extends AbstractController
{
    public function __construct(
        private EmailChangeService $emailChangeService,
        private ValidatorInterface $validator
    ) {}

    #[IsGranted('ROLE_USER')]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['newEmail'])) {
            return new JsonResponse([
                'error' => 'Le champ newEmail est requis'
            ], 400);
        }

        $newEmail = $data['newEmail'];

        // Validation de l'email
        $violations = $this->validator->validate($newEmail, [
            new Assert\NotBlank(message: "L'email est requis"),
            new Assert\Email(message: "L'email doit avoir un format valide"),
        ]);

        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[] = $violation->getMessage();
            }
            return new JsonResponse(['errors' => $errors], 400);
        }

        /** @var User $user */
        $user = $this->getUser();

        // Vérifier si l'email est déjà utilisé (même par l'utilisateur actuel)
        if ($user->getEmail() === $newEmail) {
            return new JsonResponse([
                'error' => 'Cette adresse email est déjà votre adresse actuelle'
            ], 400);
        }

        // Vérifier si l'utilisateur peut initier un changement
        if (!$this->emailChangeService->canInitiateEmailChange($user)) {
            $timeLeft = $this->emailChangeService->getTimeUntilNextRequest($user);
            return new JsonResponse([
                'error' => 'Une demande de changement est déjà en cours',
                'timeUntilNextRequest' => $timeLeft
            ], 429);
        }

        try {
            $emailChangeRequest = $this->emailChangeService->initiateEmailChange($user, $newEmail);

            return new JsonResponse([
                'message' => 'Un code de vérification a été envoyé à votre adresse email actuelle',
                'expiresAt' => $emailChangeRequest->getExpiresAt()->format('Y-m-d H:i:s'),
                'currentEmail' => $user->getEmail()
            ]);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse([
                'error' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            // Log l'erreur pour diagnostic
            error_log('Erreur envoi email changement: ' . $e->getMessage());
            return new JsonResponse([
                'error' => 'Erreur lors de l\'envoi de l\'email de vérification'
            ], 500);
        }
    }
}
