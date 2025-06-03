<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Controller\LoginController;
use App\Controller\LogoutController;
use App\Controller\RegistrationController;

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
        )
    ]
)]
class Auth
{
    // Cette classe ne contient pas de propriétés car elle sert uniquement 
    // à documenter les endpoints d'authentification dans Swagger
}
