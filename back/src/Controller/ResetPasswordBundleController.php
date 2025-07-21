<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;
use SymfonyCasts\Bundle\ResetPassword\Controller\ResetPasswordControllerTrait;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

#[Route('/api/password')]
class ResetPasswordBundleController extends AbstractController
{
    use ResetPasswordControllerTrait;

    public function __construct(
        private ResetPasswordHelperInterface $resetPasswordHelper,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private EmailService $emailService,
        private ValidatorInterface $validator
    ) {}

    /**
     * Demande de réinitialisation de mot de passe avec le bundle
     */
    #[Route('/forgot', name: 'app_forgot_password_request', methods: ['POST'])]
    public function request(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'])) {
            return $this->json([
                'error' => 'Email requis'
            ], 400);
        }

        $email = $data['email'];

        // Validation de l'email
        $violations = $this->validator->validate($email, [
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

        return $this->processSendingPasswordResetEmail($email);
    }

    /**
     * Page d'information pour le reset de mot de passe (pour les tests)
     */
    #[Route('/reset', name: 'app_reset_password_info', methods: ['GET'])]
    public function resetInfo(Request $request): Response
    {
        $token = $request->query->get('token');
        $info = $request->query->get('info');
        
        if (!$token) {
            return new Response('Token manquant', 400);
        }
        
        if ($info) {
            // Page d'information pour les tests
            try {
                $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);
                $html = '
                <html>
                <head>
                    <title>Reset Password - CoachZone</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f8f9fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; width: 100%; }
                        .form-group { margin-bottom: 20px; position: relative; }
                        label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
                        input[type="password"], input[type="text"] { width: 100%; padding: 12px 50px 12px 12px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box; }
                        input[type="password"]:focus, input[type="text"]:focus { border-color: #007bff; outline: none; }
                        .password-toggle { position: absolute; right: 15px; top: 40px; cursor: pointer; color: #666; font-size: 16px; user-select: none; transition: color 0.2s; }
                        .password-toggle:hover { color: #007bff; }
                        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; }
                        button:hover { background: #0056b3; }
                        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-top: 20px; }
                        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-top: 20px; }
                        .requirements { background: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; margin-bottom: 20px; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🔐 Réinitialisation de mot de passe</h1>
                        <p><strong>Token valide !</strong></p>
                        <p>Utilisateur: <strong>' . htmlspecialchars($user->getEmail()) . '</strong></p>
                        
                        <div class="requirements">
                            <strong>Exigences du mot de passe :</strong><br>
                            • Minimum 8 caractères<br>
                            • Au moins une majuscule, une minuscule et un chiffre
                        </div>
                        
                        <form id="resetForm">
                            <input type="hidden" id="token" value="' . htmlspecialchars($token) . '">
                            
                            <div class="form-group">
                                <label for="password">Nouveau mot de passe</label>
                                <input type="password" id="password" placeholder="Entrez votre nouveau mot de passe" required>
                                <i class="fas fa-eye password-toggle" onclick="togglePassword(\'password\')" id="toggle-password"></i>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">Confirmer le mot de passe</label>
                                <input type="password" id="confirmPassword" placeholder="Confirmez votre nouveau mot de passe" required>
                                <i class="fas fa-eye password-toggle" onclick="togglePassword(\'confirmPassword\')" id="toggle-confirmPassword"></i>
                            </div>
                            
                            <button type="submit">Réinitialiser le mot de passe</button>
                        </form>
                        
                        <div id="message"></div>
                    </div>
                    
                    <script>
                        function togglePassword(fieldId) {
                            const field = document.getElementById(fieldId);
                            const toggle = document.getElementById("toggle-" + fieldId);
                            
                            if (field.type === "password") {
                                field.type = "text";
                                toggle.classList.remove("fa-eye");
                                toggle.classList.add("fa-eye-slash");
                            } else {
                                field.type = "password";
                                toggle.classList.remove("fa-eye-slash");
                                toggle.classList.add("fa-eye");
                            }
                        }
                        
                        document.getElementById("resetForm").addEventListener("submit", function(e) {
                            e.preventDefault();
                            
                            const token = document.getElementById("token").value;
                            const password = document.getElementById("password").value;
                            const confirmPassword = document.getElementById("confirmPassword").value;
                            const messageDiv = document.getElementById("message");
                            
                            // Validation côté client
                            if (password !== confirmPassword) {
                                messageDiv.innerHTML = "<div class=\"error\">Les mots de passe ne correspondent pas</div>";
                                return;
                            }
                            
                            if (password.length < 8) {
                                messageDiv.innerHTML = "<div class=\"error\">Le mot de passe doit contenir au moins 8 caractères</div>";
                                return;
                            }
                            
                            // Envoi de la requête
                            fetch("/api/password/reset", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    token: token,
                                    password: password,
                                    confirmPassword: confirmPassword
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    messageDiv.innerHTML = "<div class=\"success\">" + data.message + "</div>";
                                    document.getElementById("resetForm").style.display = "none";
                                } else {
                                    messageDiv.innerHTML = "<div class=\"error\">" + (data.error || "Erreur inconnue") + "</div>";
                                }
                            })
                            .catch(error => {
                                messageDiv.innerHTML = "<div class=\"error\">Erreur de connexion: " + error.message + "</div>";
                            });
                        });
                    </script>
                </body>
                </html>';
                return new Response($html);
            } catch (ResetPasswordExceptionInterface $e) {
                return new Response('Token invalide ou expiré: ' . $e->getReason(), 400);
            }
        }
        
        return new Response('Utilisez le paramètre ?info=1 pour voir les détails du token', 400);
    }

    /**
     * Réinitialisation effective du mot de passe avec le bundle
     */
    #[Route('/reset', name: 'app_reset_password', methods: ['POST'])]
    public function reset(Request $request): JsonResponse
    {
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
        $violations = $this->validator->validate($plainPassword, [
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
            $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json([
                'error' => 'Token invalide ou expiré: ' . $e->getReason()
            ], 400);
        }

        // Le token est valide, réinitialiser le mot de passe
        $this->resetPasswordHelper->removeResetRequest($token);

        // Encoder le nouveau mot de passe
        $encodedPassword = $this->passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($encodedPassword);

        $this->userRepository->save($user, true);

        return $this->json([
            'message' => 'Mot de passe réinitialisé avec succès',
            'success' => true
        ]);
    }

    /**
     * Vérification de la validité d'un token
     */
    #[Route('/verify-token', name: 'app_verify_reset_token', methods: ['POST'])]
    public function verifyToken(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['token'])) {
            return $this->json([
                'error' => 'Token requis'
            ], 400);
        }

        $token = $data['token'];

        try {
            $this->resetPasswordHelper->validateTokenAndFetchUser($token);
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

    private function processSendingPasswordResetEmail(string $emailFormData): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['email' => $emailFormData]);

        // Ne pas révéler si l'utilisateur existe ou non
        if (!$user) {
            return $this->json([
                'message' => 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation.',
                'success' => true
            ]);
        }

        try {
            $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json([
                'error' => 'Problème lors de la génération du token: ' . $e->getReason()
            ], 400);
        }

        // Envoyer l'email avec notre service d'email personnalisé
        try {
            $this->sendResetEmail($user, $resetToken->getToken());
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

    private function sendResetEmail(User $user, string $resetToken): void
    {
        $this->emailService->sendPasswordResetEmailWithBundle($user, $resetToken);
    }
}
