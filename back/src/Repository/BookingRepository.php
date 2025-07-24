<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\Coach;
use App\Entity\Institution;
use App\Entity\Place;
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

    /**
     * Trouve les réservations qui chevauchent la période donnée pour un coach
     */
    public function findOverlappingBookings(int $coachId, \DateTimeInterface $dateStart, \DateTimeInterface $dateEnd, ?int $excludeId = null): array
    {
        $qb = $this->createQueryBuilder('b')
            ->where('b.coach = :coachId')
            ->andWhere('b.status = :status')
            ->andWhere(
                // Vérifie si la nouvelle réservation chevauche une réservation existante
                // Cas 1: La nouvelle réservation commence pendant une réservation existante
                '(:dateStart >= b.dateStart AND :dateStart < b.dateEnd) OR ' .
                    // Cas 2: La nouvelle réservation se termine pendant une réservation existante
                    '(:dateEnd > b.dateStart AND :dateEnd <= b.dateEnd) OR ' .
                    // Cas 3: La nouvelle réservation contient entièrement une réservation existante
                    '(:dateStart <= b.dateStart AND :dateEnd >= b.dateEnd)'
            )
            ->setParameter('coachId', $coachId)
            ->setParameter('status', 'confirmed')
            ->setParameter('dateStart', $dateStart)
            ->setParameter('dateEnd', $dateEnd);

        if ($excludeId) {
            $qb->andWhere('b.id != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Trouve les réservations qui chevauchent la période donnée pour une place donnée
     * (peu importe le coach)
     */
    public function findOverlappingBookingsForPlace(string|int $placeId, \DateTimeInterface $dateStart, \DateTimeInterface $dateEnd, ?int $excludeId = null, ?int $excludeCoachId = null): array
    {
        $qb = $this->createQueryBuilder('b')
            ->where('b.place = :placeId')
            ->andWhere('b.status = :status')
            ->andWhere(
                // Vérifie si la nouvelle réservation chevauche une réservation existante
                // Cas 1: La nouvelle réservation commence pendant une réservation existante
                '(:dateStart >= b.dateStart AND :dateStart < b.dateEnd) OR ' .
                    // Cas 2: La nouvelle réservation se termine pendant une réservation existante
                    '(:dateEnd > b.dateStart AND :dateEnd <= b.dateEnd) OR ' .
                    // Cas 3: La nouvelle réservation contient entièrement une réservation existante
                    '(:dateStart <= b.dateStart AND :dateEnd >= b.dateEnd)'
            )
            ->setParameter('placeId', $placeId)
            ->setParameter('status', 'confirmed')
            ->setParameter('dateStart', $dateStart)
            ->setParameter('dateEnd', $dateEnd);

        if ($excludeId) {
            $qb->andWhere('b.id != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        // Exclure les réservations du coach spécifié
        if ($excludeCoachId) {
            $qb->andWhere('b.coach != :excludeCoachId')
                ->setParameter('excludeCoachId', $excludeCoachId);
        }

        return $qb->getQuery()->getResult();
    }
}
