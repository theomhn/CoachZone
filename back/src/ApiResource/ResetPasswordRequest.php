<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;

/**
 * DTO pour la réinitialisation de mot de passe
 */
#[ApiResource(
    operations: [],
    shortName: 'ResetPasswordRequest'
)]
class ResetPasswordRequest
{
    /**
     * @var string Token de réinitialisation reçu par email
     * @example "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
     */
    public string $token;

    /**
     * @var string Nouveau mot de passe (minimum 8 caractères, avec majuscule, minuscule et chiffre)
     * @example "MonNouveauMotDePasse123"
     */
    public string $password;

    /**
     * @var string|null Confirmation du nouveau mot de passe (optionnel)
     * @example "MonNouveauMotDePasse123"
     */
    public ?string $confirmPassword = null;
}