<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Controller\ForgotPasswordController;
use App\Controller\LoginController;
use App\Controller\LogoutController;
use App\Controller\RegistrationController;
use App\Controller\ResetPasswordController;
use App\Controller\VerifyResetTokenController;

#[ApiResource(
    operations: [
        new Post(
            name: 'login',
            uriTemplate: '/login',
            controller: LoginController::class,
            description: 'Authentifie un utilisateur et retourne un token d\'accès',
            security: 'true' // Route publique
        ),
        new Post(
            name: 'logout',
            uriTemplate: '/logout',
            controller: LogoutController::class,
            description: 'Déconnecte un utilisateur en invalidant son token',
            security: 'true' // Route publique
        ),
        new Post(
            name: 'register',
            uriTemplate: '/register',
            controller: RegistrationController::class,
            description: 'Crée un nouveau compte utilisateur (Coach ou Institution)',
            security: 'true' // Route publique
        ),
        new Post(
            name: 'forgot_password',
            uriTemplate: '/password/forgot',
            controller: ForgotPasswordController::class,
            input: \App\ApiResource\ForgotPasswordRequest::class,
            description: 'Demande la réinitialisation de mot de passe par email',
            security: 'true' // Route publique
        ),
        new Post(
            name: 'reset_password',
            uriTemplate: '/password/reset',
            controller: ResetPasswordController::class,
            input: \App\ApiResource\ResetPasswordRequest::class,
            description: 'Réinitialise le mot de passe avec un token valide',
            security: 'true' // Route publique
        ),
        new Post(
            name: 'verify_reset_token',
            uriTemplate: '/password/verify-token',
            controller: VerifyResetTokenController::class,
            input: \App\ApiResource\VerifyTokenRequest::class,
            description: 'Vérifie la validité d\'un token de réinitialisation',
            security: 'true' // Route publique
        )
    ]
)]
class Auth
{
    // Cette classe sert uniquement à documenter les endpoints d'authentification dans Swagger
    // La documentation des schémas est gérée par OpenApiSchemaDecorator
}
