<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Entity\Institution;
use App\Entity\User;
use App\Repository\BookingRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

#[AsController]
class BookingController extends AbstractController
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private SerializerInterface $serializer
    ) {}

    /**
     * Récupère les réservations de l'utilisateur connecté (coach ou institution)
     */
    public function __invoke(Request $request, #[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer les paramètres de filtrage
        $dateStart = $request->query->get('dateStart');
        $dateEnd = $request->query->get('dateEnd');

        try {
            // Récupérer les réservations en fonction du type d'utilisateur
            $bookings = $this->getBookingsForUser($user, $dateStart, $dateEnd);

            if ($bookings === null) {
                return $this->json(['message' => 'Type d\'utilisateur non autorisé'], 403);
            }

            // Sérialiser les résultats avec les mêmes groupes que dans l'entité
            $json = $this->serializer->serialize(
                $bookings,
                'json',
                [
                    'groups' => ['booking:read', 'booking:details'],
                ]
            );

            return new JsonResponse($json, 200, [], true);
        } catch (\Exception $e) {
            // Log l'erreur
            error_log($e->getMessage());
            return $this->json(['message' => 'Une erreur est survenue: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Récupère les réservations en fonction du type d'utilisateur
     */
    private function getBookingsForUser(User $user, ?string $dateStart, ?string $dateEnd): ?array
    {
        // Vérifier si l'utilisateur est un COACH
        if ($user instanceof Coach) {
            return $this->bookingRepository->findByCoachWithFilters(
                $user,
                $dateStart,
                $dateEnd
            );
        }

        // Vérifier si l'utilisateur est une INSTITUTION
        if ($user instanceof Institution) {
            return $this->bookingRepository->findByInstitutionWithFilters(
                $user,
                $dateStart,
                $dateEnd
            );
        }

        // Si on arrive ici, l'utilisateur n'est ni un Coach ni une Institution
        return null;
    }
}
