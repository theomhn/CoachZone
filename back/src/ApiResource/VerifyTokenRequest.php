<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;

/**
 * DTO pour la vérification de token de réinitialisation
 */
#[ApiResource(
    operations: [],
    shortName: 'VerifyTokenRequest'
)]
class VerifyTokenRequest
{
    /**
     * @var string Token de réinitialisation à vérifier
     * @example "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
     */
    public string $token;
}