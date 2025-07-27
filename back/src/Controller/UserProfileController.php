<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

class UserProfileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {
    }

    #[IsGranted('ROLE_USER')]
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return new JsonResponse(['error' => 'Données JSON invalides'], 400);
        }

        // Mettre à jour seulement les champs autorisés
        $allowedFields = [
            // Coach
            'firstName' => 'setFirstName',
            'lastName' => 'setLastName', 
            'work' => 'setWork',
            // Institution
            'inst_name' => 'setInstName',
            'adresse' => 'setAdresse',
            'ville' => 'setVille',
            'coordonnees' => 'setCoordonnees',
            'activites' => 'setActivites',
            'equipements' => 'setEquipements'
        ];

        foreach ($data as $field => $value) {
            if (isset($allowedFields[$field]) && method_exists($user, $allowedFields[$field])) {
                $user->{$allowedFields[$field]}($value);
            }
        }

        $this->entityManager->flush();

        // Retourner l'utilisateur mis à jour
        $userData = $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]);
        
        return new JsonResponse(json_decode($userData), 200);
    }
}