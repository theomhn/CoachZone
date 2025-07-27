<?php

namespace App\Service;

use App\Entity\EmailChangeRequest;
use App\Entity\User;
use App\Repository\EmailChangeRequestRepository;
use App\Repository\UserRepository;
use App\Repository\AccessTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class EmailChangeService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private EmailChangeRequestRepository $emailChangeRequestRepository,
        private UserRepository $userRepository,
        private AccessTokenRepository $accessTokenRepository,
        private MailerInterface $mailer,
        private Environment $twig,
        private string $fromEmail = 'webmaster@coachzone.fr'
    ) {
    }

    public function initiateEmailChange(User $user, string $newEmail): EmailChangeRequest
    {
        // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
        $existingUser = $this->userRepository->findOneBy(['email' => $newEmail]);
        if ($existingUser && $existingUser->getId() !== $user->getId()) {
            throw new \InvalidArgumentException('Cette adresse email est déjà utilisée par un autre compte');
        }

        // Invalider les anciennes demandes
        $this->emailChangeRequestRepository->invalidateOldRequests($user);

        // Créer une nouvelle demande
        $emailChangeRequest = new EmailChangeRequest();
        $emailChangeRequest->setUser($user);
        $emailChangeRequest->setCurrentEmail($user->getEmail());
        $emailChangeRequest->setNewEmail($newEmail);

        $this->entityManager->persist($emailChangeRequest);
        $this->entityManager->flush();

        // Envoyer l'email avec le code
        $this->sendVerificationEmail($emailChangeRequest);

        return $emailChangeRequest;
    }

    public function confirmEmailChange(User $user, string $code): bool
    {
        $request = $this->emailChangeRequestRepository->findValidRequestByUserAndCode($user, $code);

        if (!$request || !$request->isValid()) {
            return false;
        }

        $oldEmail = $request->getCurrentEmail();
        $newEmail = $request->getNewEmail();
        
        // Mettre à jour l'email de l'utilisateur
        $user->setEmail($newEmail);
        
        // Marquer la demande comme utilisée
        $request->setIsUsed(true);

        // Mettre à jour les tokens d'accès avec le nouvel email
        $this->accessTokenRepository->updateUserEmailForTokens($oldEmail, $newEmail);

        $this->entityManager->flush();

        // Envoyer un email de confirmation à la nouvelle adresse
        $this->sendConfirmationEmail($user, $oldEmail);

        return true;
    }

    private function sendVerificationEmail(EmailChangeRequest $request): void
    {
        try {
            $email = (new Email())
                ->from($this->fromEmail)
                ->to($request->getCurrentEmail())
                ->subject('🔐 Code de vérification pour changement d\'email - CoachZone')
                ->html($this->twig->render('emails/email_change_verification.html.twig', [
                    'user' => $request->getUser(),
                    'newEmail' => $request->getNewEmail(),
                    'code' => $request->getVerificationCode(),
                    'expiresAt' => $request->getExpiresAt()
                ]));

            error_log('Envoi email changement à: ' . $request->getCurrentEmail() . ' code: ' . $request->getVerificationCode());
            $this->mailer->send($email);
            error_log('Email changement envoyé avec succès');
        } catch (\Exception $e) {
            error_log('Erreur envoi email changement: ' . $e->getMessage());
            throw $e;
        }
    }

    private function sendConfirmationEmail(User $user, string $oldEmail): void
    {
        // Email de confirmation à la nouvelle adresse
        $email = (new Email())
            ->from($this->fromEmail)
            ->to($user->getEmail())
            ->subject('✅ Changement d\'email confirmé - CoachZone')
            ->html($this->twig->render('emails/email_change_confirmed.html.twig', [
                'user' => $user,
                'oldEmail' => $oldEmail
            ]));

        $this->mailer->send($email);
    }

    public function canInitiateEmailChange(User $user): bool
    {
        $latestRequest = $this->emailChangeRequestRepository->findLatestRequestByUser($user);
        
        if (!$latestRequest) {
            return true;
        }

        // Permettre une nouvelle demande seulement si la dernière a expiré ou a été utilisée
        return !$latestRequest->isValid();
    }

    public function getTimeUntilNextRequest(User $user): ?int
    {
        $latestRequest = $this->emailChangeRequestRepository->findLatestRequestByUser($user);
        
        if (!$latestRequest || !$latestRequest->isValid()) {
            return null;
        }

        $now = new \DateTime();
        $expiresAt = $latestRequest->getExpiresAt();
        
        return max(0, $expiresAt->getTimestamp() - $now->getTimestamp());
    }

    /**
     * Alternative : invalider tous les tokens et forcer une reconnexion
     */
    public function confirmEmailChangeWithTokenInvalidation(User $user, string $code): bool
    {
        $request = $this->emailChangeRequestRepository->findValidRequestByUserAndCode($user, $code);

        if (!$request || !$request->isValid()) {
            return false;
        }

        $oldEmail = $request->getCurrentEmail();
        $newEmail = $request->getNewEmail();
        
        // Mettre à jour l'email de l'utilisateur
        $user->setEmail($newEmail);
        
        // Marquer la demande comme utilisée
        $request->setIsUsed(true);

        // INVALIDER tous les tokens existants (force la reconnexion)
        $this->accessTokenRepository->deleteByUserEmail($oldEmail);

        $this->entityManager->flush();

        // Envoyer un email de confirmation à la nouvelle adresse
        $this->sendConfirmationEmail($user, $oldEmail);

        return true;
    }
}