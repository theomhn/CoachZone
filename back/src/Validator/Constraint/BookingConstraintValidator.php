<?php

namespace App\Validator\Constraint;

use App\Entity\Booking;
use App\Entity\Coach;
use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class BookingConstraintValidator extends ConstraintValidator
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private Security $security,
        private EntityManagerInterface $entityManager,
    ) {}

    public function validate($booking, Constraint $constraint)
    {
        if (!$constraint instanceof BookingConstraint) {
            throw new UnexpectedTypeException($constraint, BookingConstraint::class);
        }

        if (!$booking instanceof Booking) {
            throw new UnexpectedTypeException($booking, Booking::class);
        }

        // Vérifier que l'utilisateur est un coach
        $user = $this->security->getUser();
        if (!$user instanceof Coach) {
            $this->context->buildViolation($constraint->messageRole)
                ->addViolation();
            return;
        }

        // Vérifier que l'utilisateur a le rôle ROLE_COACH
        if (!$this->security->isGranted('ROLE_COACH')) {
            $this->context->buildViolation($constraint->messageRole)
                ->addViolation();
            return;
        }

        // Vérifier que le coach n'a pas déjà une réservation qui chevauche cette période
        $coach = $booking->getCoach();
        $place = $booking->getPlace();
        $dateStart = $booking->getDateStart();
        $dateEnd = $booking->getDateEnd();

        // Ignorer la validation si les données nécessaires ne sont pas définies
        if (!$coach || !$place || !$dateStart || !$dateEnd) {
            return;
        }

        // Exclure la réservation actuelle si elle a déjà un ID (cas d'une mise à jour)
        $existingId = $booking->getId();

        // 1. Rechercher les réservations du même coach qui pourraient chevaucher
        $overlappingBookings = $this->findOverlappingBookings($coach->getId(), $dateStart, $dateEnd, $existingId);

        if (count($overlappingBookings) > 0) {
            $this->context->buildViolation($constraint->messageOverlap)
                ->addViolation();
        }

        // 2. Rechercher les réservations d'autres coachs sur la même place qui pourraient chevaucher
        $conflictingBookings = $this->findConflictingBookingsForPlace($place->getId(), $dateStart, $dateEnd, $existingId, $coach->getId());

        if (count($conflictingBookings) > 0) {
            $this->context->buildViolation($constraint->messagePlaceConflict)
                ->addViolation();
        }
    }

    /**
     * Trouve les réservations qui chevauchent la période donnée pour un coach
     */
    private function findOverlappingBookings(int $coachId, \DateTimeInterface $dateStart, \DateTimeInterface $dateEnd, ?int $excludeId = null): array
    {
        $qb = $this->entityManager->createQueryBuilder()
            ->select('b')
            ->from(Booking::class, 'b')
            ->where('b.coach = :coachId')
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
            ->setParameter('dateStart', $dateStart)
            ->setParameter('dateEnd', $dateEnd);

        if ($excludeId) {
            $qb->andWhere('b.id != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Trouve les réservations qui entrent en conflit avec la période donnée pour une place donnée
     * (toutes les réservations, peu importe le coach)
     */
    private function findConflictingBookingsForPlace(string|int $placeId, \DateTimeInterface $dateStart, \DateTimeInterface $dateEnd, ?int $excludeId = null, ?int $excludeCoachId = null): array
    {
        $qb = $this->entityManager->createQueryBuilder()
            ->select('b')
            ->from(Booking::class, 'b')
            ->where('b.place = :placeId')
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
            ->setParameter('dateStart', $dateStart)
            ->setParameter('dateEnd', $dateEnd);

        if ($excludeId) {
            $qb->andWhere('b.id != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        // Exclure les réservations du coach actuel
        if ($excludeCoachId) {
            $qb->andWhere('b.coach != :excludeCoachId')
                ->setParameter('excludeCoachId', $excludeCoachId);
        }

        return $qb->getQuery()->getResult();
    }
}
