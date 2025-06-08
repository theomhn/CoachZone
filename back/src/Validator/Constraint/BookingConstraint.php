<?php
// src/Validator/Constraint/BookingConstraint.php

namespace App\Validator\Constraint;

use Symfony\Component\Validator\Constraint;
use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class BookingConstraint extends Constraint
{
    public string $messageOverlap = 'Vous avez déjà une réservation qui chevauche cette période.';
    public string $messageRole = 'Seuls les coachs peuvent créer des réservations.';
    public string $messagePlaceConflict = 'Un autre coach a déjà une réservation sur ce créneau.';

    public function getTargets(): string|array
    {
        return self::CLASS_CONSTRAINT;
    }
}
