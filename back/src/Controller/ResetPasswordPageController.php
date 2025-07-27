<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Twig\Environment;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

/**
 * Contrôleur pour la page d'information et formulaire de réinitialisation de mot de passe
 */
class ResetPasswordPageController extends AbstractController
{
    #[Route('/api/password/reset', name: 'app_reset_password_page', methods: ['GET'])]
    public function resetPasswordPage(Request $request, ResetPasswordHelperInterface $resetPasswordHelper, Environment $twig): Response
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
                
                $html = $twig->render('password/reset_form.html.twig', [
                    'user' => $user,
                    'token' => $token
                ]);
                
                return new Response($html);
            } catch (ResetPasswordExceptionInterface $e) {
                return new Response('Token invalide ou expiré: ' . $e->getReason(), 400);
            }
        }
        
        return new Response('Utilisez le paramètre ?info=1 pour voir les détails du token', 400);
    }
}