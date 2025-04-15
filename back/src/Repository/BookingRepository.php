<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\Coach;
use App\Entity\Institution;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    /**
     * Recherche les réservations d'un coach avec filtres optionnels
     */
    public function findByCoachWithFilters(Coach $coach, ?string $dateStart = null, ?string $dateEnd = null): array
    {
        $qb = $this->createQueryBuilder('b')
            ->andWhere('b.coach = :coach')
            ->setParameter('coach', $coach)
            ->orderBy('b.dateStart', 'ASC');

        // Filtrer par date de début si fournie
        if ($dateStart) {
            $qb->andWhere('b.dateStart >= :dateStart')
                ->setParameter('dateStart', new \DateTime($dateStart));
        }

        // Filtrer par date de fin si fournie
        if ($dateEnd) {
            $qb->andWhere('b.dateEnd <= :dateEnd')
                ->setParameter('dateEnd', new \DateTime($dateEnd));
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Recherche les réservations liées à une institution avec filtres optionnels
     * Cette méthode utilise une jointure sur inst_numero
     */
    public function findByInstitutionWithFilters(Institution $institution, ?string $dateStart = null, ?string $dateEnd = null): array
    {
        $qb = $this->createQueryBuilder('b')
            ->join('b.place', 'p')
            ->join('App\Entity\Institution', 'i', 'WITH', 'p.inst_numero = i.inst_numero')
            ->andWhere('i.id = :institutionId')
            ->setParameter('institutionId', $institution->getId())
            ->orderBy('b.dateStart', 'ASC');

        // Filtrer par date de début si fournie
        if ($dateStart) {
            $qb->andWhere('b.dateStart >= :dateStart')
                ->setParameter('dateStart', new \DateTime($dateStart));
        }

        // Filtrer par date de fin si fournie
        if ($dateEnd) {
            $qb->andWhere('b.dateEnd <= :dateEnd')
                ->setParameter('dateEnd', new \DateTime($dateEnd));
        }

        return $qb->getQuery()->getResult();
    }
}
