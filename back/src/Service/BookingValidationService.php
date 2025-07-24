<?php

namespace App\Service;

use App\Entity\Booking;
use App\Entity\Coach;
use App\Repository\BookingRepository;
use Symfony\Bundle\SecurityBundle\Security;

class BookingValidationService
{
    private BookingRepository $bookingRepository;
    private Security $security;

    public function __construct(
        BookingRepository $bookingRepository,
        Security $security
    ) {
        $this->bookingRepository = $bookingRepository;
        $this->security = $security;
    }

    /**
     * Vérifie si un utilisateur est autorisé à créer une réservation
     */
    public function canCreateBooking(): bool
    {
        $user = $this->security->getUser();
        return $user instanceof Coach && $this->security->isGranted('ROLE_COACH');
    }

    /**
     * Vérifie si une réservation a des chevauchements avec d'autres réservations du coach
     * 
     * @return bool true si aucun chevauchement n'est trouvé, false sinon
     */
    public function hasNoOverlappingBookings(Booking $booking): bool
    {
        $coach = $booking->getCoach();
        $dateStart = $booking->getDateStart();
        $dateEnd = $booking->getDateEnd();

        if (!$coach || !$dateStart || !$dateEnd) {
            return false;
        }

        $existingId = $booking->getId();
        $overlappingBookings = $this->bookingRepository->findOverlappingBookings(
            $coach->getId(),
            $dateStart,
            $dateEnd,
            $existingId
        );

        return count($overlappingBookings) === 0;
    }

    /**
     * Vérifie si la place est disponible (aucun autre coach n'a réservé)
     * 
     * @return bool true si la place est disponible, false sinon
     */
    public function isPlaceAvailable(Booking $booking): bool
    {
        $place = $booking->getPlace();
        $coach = $booking->getCoach();
        $dateStart = $booking->getDateStart();
        $dateEnd = $booking->getDateEnd();

        if (!$place || !$coach || !$dateStart || !$dateEnd) {
            return false;
        }

        $existingId = $booking->getId();
        $conflictingBookings = $this->bookingRepository->findOverlappingBookingsForPlace(
            $place->getId(),
            $dateStart,
            $dateEnd,
            $existingId,
            $coach->getId() // Exclure les réservations du coach actuel
        );

        return count($conflictingBookings) === 0;
    }

    /**
     * Vérifie si une réservation peut être modifiée
     */
    public function canModifyBooking(Booking $booking): bool
    {
        if (!$booking->canBeModified()) {
            return false;
        }

        $user = $this->security->getUser();
        return $user instanceof Coach && 
               $user === $booking->getCoach() && 
               $this->security->isGranted('ROLE_COACH');
    }

    /**
     * Vérifie si une réservation peut être annulée
     */
    public function canCancelBooking(Booking $booking): bool
    {
        if (!$booking->canBeCancelled()) {
            return false;
        }

        $user = $this->security->getUser();
        return $user instanceof Coach && 
               $user === $booking->getCoach() && 
               $this->security->isGranted('ROLE_COACH');
    }

    /**
     * Valide complètement une réservation
     * 
     * @return array Liste des erreurs, tableau vide si aucune erreur
     */
    public function validateBooking(Booking $booking): array
    {
        $errors = [];

        if (!$this->canCreateBooking()) {
            $errors[] = 'Seuls les coachs peuvent créer des réservations.';
        }

        if (!$this->hasNoOverlappingBookings($booking)) {
            $errors[] = 'Vous avez déjà une réservation qui chevauche cette période.';
        }

        if (!$this->isPlaceAvailable($booking)) {
            $errors[] = 'Un autre coach a déjà une réservation sur ce créneau.';
        }

        return $errors;
    }

    /**
     * Valide une modification de réservation
     * 
     * @return array Liste des erreurs, tableau vide si aucune erreur
     */
    public function validateBookingModification(Booking $booking): array
    {
        $errors = [];

        if (!$this->canModifyBooking($booking)) {
            $errors[] = 'Cette réservation ne peut plus être modifiée. Les modifications doivent se faire au moins 24 heures avant le début.';
        }

        if (!$this->hasNoOverlappingBookings($booking)) {
            $errors[] = 'Vous avez déjà une réservation qui chevauche cette nouvelle période.';
        }

        if (!$this->isPlaceAvailable($booking)) {
            $errors[] = 'Un autre coach a déjà une réservation sur ce nouveau créneau.';
        }

        return $errors;
    }
}
