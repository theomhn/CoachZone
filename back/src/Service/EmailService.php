<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class EmailService
{
    public function __construct(
        private MailerInterface $mailer,
        private Environment $twig,
        private string $fromEmail = 'webmaster@coachzone.fr'
    ) {
    }

    /**
     * Envoie un email de reset de mot de passe avec le bundle Symfony
     */
    public function sendPasswordResetEmailWithBundle(object $user, string $resetToken): void
    {
        $resetUrl = $this->generateResetUrl($resetToken);
        $expiresAt = new \DateTime('+1 hour', new \DateTimeZone('Europe/Paris')); // Bundle utilise 1 heure par défaut

        $email = (new Email())
            ->from($this->fromEmail)
            ->to($user->getEmail())
            ->subject('🔐 Réinitialisation de votre mot de passe - CoachZone')
            ->html($this->twig->render('emails/password_reset.html.twig', [
                'user' => $user,
                'email' => $user->getEmail(),
                'resetUrl' => $resetUrl,
                'expiresAt' => $expiresAt
            ]));

        $this->mailer->send($email);
    }

    /**
     * Génère l'URL de reset (à adapter selon votre frontend)
     */
    private function generateResetUrl(string $token): string
    {
        // Pour les tests backend uniquement - pointer vers l'API de reset
        $backendUrl = 'http://127.0.0.1:8000'; 
        return $backendUrl . '/api/password/reset?token=' . $token . '&info=1';
    }

}