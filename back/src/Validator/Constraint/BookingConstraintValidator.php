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
        $dateStart = $booking->getDateStart();
        $dateEnd = $booking->getDateEnd();

        // Ignorer la validation si les dates ne sont pas définies
        if (!$coach || !$dateStart || !$dateEnd) {
            return;
        }

        // Exclure la réservation actuelle si elle a déjà un ID (cas d'une mise à jour)
        $existingId = $booking->getId();

        // Rechercher les réservations du coach qui pourraient chevaucher
        $overlappingBookings = $this->findOverlappingBookings($coach->getId(), $dateStart, $dateEnd, $existingId);

        if (count($overlappingBookings) > 0) {
            $this->context->buildViolation($constraint->messageOverlap)
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
}
