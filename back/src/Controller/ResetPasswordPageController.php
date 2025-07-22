<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

/**
 * Contrôleur pour la page d'information et formulaire de réinitialisation de mot de passe
 */
class ResetPasswordPageController extends AbstractController
{
    #[Route('/api/password/reset', name: 'app_reset_password_page', methods: ['GET'])]
    public function resetPasswordPage(Request $request, ResetPasswordHelperInterface $resetPasswordHelper): Response
    {
        $token = $request->query->get('token');
        $info = $request->query->get('info');
        
        if (!$token) {
            return new Response('Token manquant', 400);
        }
        
        if ($info) {
            // Page d'information pour les tests
            try {
                $user = $resetPasswordHelper->validateTokenAndFetchUser($token);
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
}