<?php

namespace App\Security;

use App\Repository\AccessTokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(
        private AccessTokenRepository $repository
    ) {}

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        $tokenEntity = $this->repository->findOneByToken($accessToken);

        // Vérifier si le token existe
        if (null === $tokenEntity) {
            throw new BadCredentialsException('Invalid token.');
        }

        // Optionnellement, vous pourriez ajouter des vérifications supplémentaires
        // Par exemple, vérifier si le token n'est pas expiré
        /*
        if ($tokenEntity->getExpiresAt() < new \DateTime()) {
            throw new BadCredentialsException('Token has expired.');
        }
        */

        return new UserBadge($tokenEntity->getUserEmail());
    }
}
