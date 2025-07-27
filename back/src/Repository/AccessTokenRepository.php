<?php

namespace App\Repository;

use App\Entity\AccessToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AccessToken>
 */
class AccessTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AccessToken::class);
    }

    /**
     * Trouve tous les tokens pour un email donné
     */
    public function findByUserEmail(string $email): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.userEmail = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getResult();
    }

    /**
     * Met à jour l'email pour tous les tokens d'un utilisateur
     */
    public function updateUserEmailForTokens(string $oldEmail, string $newEmail): int
    {
        return $this->createQueryBuilder('a')
            ->update()
            ->set('a.userEmail', ':newEmail')
            ->andWhere('a.userEmail = :oldEmail')
            ->setParameter('newEmail', $newEmail)
            ->setParameter('oldEmail', $oldEmail)
            ->getQuery()
            ->execute();
    }

    /**
     * Supprime tous les tokens pour un email donné
     */
    public function deleteByUserEmail(string $email): int
    {
        return $this->createQueryBuilder('a')
            ->delete()
            ->andWhere('a.userEmail = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->execute();
    }
}
