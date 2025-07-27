<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Twig\Environment;

class PasswordChangeService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private MailerInterface $mailer,
        private Environment $twig,
        private string $fromEmail = 'webmaster@coachzone.fr'
    ) {
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        // Vérifier que le mot de passe actuel est correct
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return false;
        }

        // Hasher le nouveau mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        
        // Mettre à jour le mot de passe
        $user->setPassword($hashedPassword);
        
        $this->entityManager->flush();

        // Envoyer l'email de confirmation
        $this->sendPasswordChangeConfirmationEmail($user);

        return true;
    }

    private function sendPasswordChangeConfirmationEmail(User $user): void
    {
        $email = (new Email())
            ->from($this->fromEmail)
            ->to($user->getEmail())
            ->subject('🔐 Confirmation de changement de mot de passe - CoachZone')
            ->html($this->twig->render('emails/password_change_confirmation.html.twig', [
                'user' => $user,
                'changeDate' => new \DateTime('now', new \DateTimeZone('Europe/Paris')),
                'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Inconnu',
                'ipAddress' => $this->getClientIpAddress()
            ]));

        $this->mailer->send($email);
    }

    private function getClientIpAddress(): string
    {
        // Vérifier différentes sources d'IP en cas de proxy/load balancer
        $ipKeys = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        ];

        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Si c'est une liste d'IPs séparées par des virgules, prendre la première
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                // Valider que c'est une IP valide
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? 'Inconnue';
    }

    public function validatePasswordStrength(string $password): array
    {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Le mot de passe doit contenir au moins 8 caractères';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Le mot de passe doit contenir au moins une lettre minuscule';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Le mot de passe doit contenir au moins une lettre majuscule';
        }
        
        if (!preg_match('/\d/', $password)) {
            $errors[] = 'Le mot de passe doit contenir au moins un chiffre';
        }

        return $errors;
    }

    public function calculatePasswordStrength(string $password): array
    {
        $score = 0;
        $feedback = [];

        // Longueur
        if (strlen($password) >= 8) {
            $score += 25;
        } else {
            $feedback[] = 'Utilisez au moins 8 caractères';
        }

        // Minuscules
        if (preg_match('/[a-z]/', $password)) {
            $score += 25;
        } else {
            $feedback[] = 'Ajoutez des lettres minuscules';
        }

        // Majuscules
        if (preg_match('/[A-Z]/', $password)) {
            $score += 25;
        } else {
            $feedback[] = 'Ajoutez des lettres majuscules';
        }

        // Chiffres
        if (preg_match('/\d/', $password)) {
            $score += 25;
        } else {
            $feedback[] = 'Ajoutez des chiffres';
        }

        // Bonus pour caractères spéciaux
        if (preg_match('/[^a-zA-Z\d]/', $password)) {
            $score += 10;
        }

        // Bonus pour longueur supérieure
        if (strlen($password) >= 12) {
            $score += 10;
        }

        $strength = 'faible';
        if ($score >= 60) $strength = 'moyen';
        if ($score >= 80) $strength = 'fort';
        if ($score >= 100) $strength = 'très fort';

        return [
            'score' => min($score, 100),
            'strength' => $strength,
            'feedback' => $feedback
        ];
    }
}