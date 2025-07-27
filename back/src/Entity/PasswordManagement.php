<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use App\Controller\PasswordChangeController;
use App\Controller\PasswordRequirementsController;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/users/me/password/requirements',
            controller: PasswordRequirementsController::class,
            read: false,
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être authentifié pour accéder aux exigences de mot de passe."
        ),
        new Post(
            uriTemplate: '/users/me/password/change',
            controller: PasswordChangeController::class,
            read: false,
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être authentifié pour changer votre mot de passe."
        )
    ]
)]
class PasswordManagement
{
    // Entité fictive pour exposer les routes de mot de passe
}
