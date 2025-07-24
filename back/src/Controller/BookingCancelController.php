<?php

namespace App\Controller;

use App\Entity\Booking;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class BookingCancelController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function __invoke(Booking $data): JsonResponse
    {
        if (!$data->canBeCancelled()) {
            return $this->json([
                'message' => 'Cette réservation ne peut plus être annulée. L\'annulation doit se faire au moins 24 heures avant le début de la réservation.'
            ], 400);
        }

        $data->setStatus('cancelled');
        $data->setCancelledAt(new \DateTime());

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Réservation annulée avec succès',
            'booking' => $data
        ], 200, [], [
            'groups' => ['booking:read', 'booking:details']
        ]);
    }
}
