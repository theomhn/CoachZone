<?php

namespace App\Repository;

use App\Entity\EmailChangeRequest;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EmailChangeRequest>
 */
class EmailChangeRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmailChangeRequest::class);
    }

    public function findValidRequestByUserAndCode(User $user, string $code): ?EmailChangeRequest
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.user = :user')
            ->andWhere('e.verificationCode = :code')
            ->andWhere('e.isUsed = false')
            ->andWhere('e.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('code', $code)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findLatestRequestByUser(User $user): ?EmailChangeRequest
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.user = :user')
            ->orderBy('e.createdAt', 'DESC')
            ->setParameter('user', $user)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function invalidateOldRequests(User $user): void
    {
        $this->createQueryBuilder('e')
            ->update()
            ->set('e.isUsed', 'true')
            ->andWhere('e.user = :user')
            ->andWhere('e.isUsed = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}