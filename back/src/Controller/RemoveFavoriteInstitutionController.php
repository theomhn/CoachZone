<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Entity\Institution;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[AsController]
class RemoveFavoriteInstitutionController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[IsGranted('ROLE_COACH')]
    public function __invoke(string $institutionId, #[CurrentUser] Coach $coach): JsonResponse
    {
        $institution = $this->entityManager->getRepository(Institution::class)->findOneBy(['inst_numero' => $institutionId]);

        if (!$institution) {
            return new JsonResponse(['error' => 'Institution non trouvée'], 404);
        }

        // Vérifier si n'est pas en favoris
        if (!$coach->isFavoriteInstitution($institution)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Institution pas en favoris',
                'institutionId' => $institutionId,
                'isFavorite' => false
            ], 409); // Conflict
        }

        $coach->removeFavoriteInstitution($institution);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Institution supprimée des favoris',
            'institutionId' => $institutionId,
            'isFavorite' => false
        ], 200); // OK
    }
}
