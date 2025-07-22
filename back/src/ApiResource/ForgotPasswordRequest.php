<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;

/**
 * DTO pour la demande de réinitialisation de mot de passe
 */
#[ApiResource(
    operations: [],
    shortName: 'ForgotPasswordRequest'
)]
class ForgotPasswordRequest
{
    /**
     * @var string Adresse email de l'utilisateur
     * @example "coach@example.com"
     */
    public string $email;
}