<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use App\Controller\EmailChangeRequestController;
use App\Controller\EmailChangeConfirmController;
use App\Controller\EmailChangeStatusController;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/users/me/email/status',
            controller: EmailChangeStatusController::class,
            read: false,
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être authentifié pour accéder au statut d'email."
        ),
        new Post(
            uriTemplate: '/users/me/email/request-change',
            controller: EmailChangeRequestController::class,
            read: false,
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être authentifié pour demander un changement d'email."
        ),
        new Post(
            uriTemplate: '/users/me/email/confirm-change',
            controller: EmailChangeConfirmController::class,
            read: false,
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être authentifié pour confirmer un changement d'email."
        )
    ]
)]
class EmailManagement
{
    // Entité fictive pour exposer les routes d'email
}
