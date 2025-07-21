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
        private string $fromEmail = 'webmaster@theomenchon.fr'
    ) {
    }

    /**
     * Envoie un email de reset de mot de passe avec le bundle Symfony
     */
    public function sendPasswordResetEmailWithBundle(object $user, string $resetToken): void
    {
        $resetUrl = $this->generateResetUrl($resetToken);
        $expiresAt = new \DateTime('+1 hour'); // Bundle utilise 1 heure par défaut

        $email = (new Email())
            ->from($this->fromEmail)
            ->to($user->getEmail())
            ->subject('CoachZone - Réinitialisation de votre mot de passe')
            ->html($this->renderPasswordResetTemplate($user->getEmail(), $resetUrl, $expiresAt));

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

    /**
     * Génère le template HTML de l'email
     */
    private function renderPasswordResetTemplate(string $email, string $resetUrl, \DateTimeInterface $expiresAt): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f8f9fa; }
                .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
                .footer { padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏆 CoachZone</h1>
                </div>
                
                <div class="content">
                    <h2>Réinitialisation de votre mot de passe</h2>
                    
                    <p>Bonjour,</p>
                    
                    <p>Vous avez demandé la réinitialisation du mot de passe pour votre compte <strong>' . htmlspecialchars($email) . '</strong>.</p>
                    
                    <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
                    
                    <p style="text-align: center;">
                        <a href="' . htmlspecialchars($resetUrl) . '" class="button">Réinitialiser mon mot de passe</a>
                    </p>
                    
                    <div class="warning">
                        ⚠️ <strong>Important :</strong> Ce lien est valide jusqu\'au <strong>' . $expiresAt->format('d/m/Y à H:i') . '</strong> (dans 1 heure).
                    </div>
                    
                    <p>Si vous n\'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
                    
                    <hr>
                    
                    <p><small>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br>
                    <a href="' . htmlspecialchars($resetUrl) . '">' . htmlspecialchars($resetUrl) . '</a></small></p>
                </div>
                
                <div class="footer">
                    <p>© 2025 CoachZone - Plateforme dédiée aux professionnels du sport</p>
                    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                </div>
            </div>
        </body>
        </html>';
    }
}