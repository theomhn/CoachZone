<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Entity\Institution;
use App\Service\PlaceSyncService;
use App\Service\InstitutionEnrichmentService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class RegistrationController extends AbstractController
{
    public function __invoke(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        PlaceSyncService $placeSyncService,
        InstitutionEnrichmentService $institutionEnrichmentService
    ): Response {
        $data = json_decode($request->getContent(), true);

        try {
            // Vérifier le type d'utilisateur
            $user = match ($data['type']) {
                'ROLE_COACH' => new Coach(),
                'ROLE_INSTITUTION' => new Institution(),
                default => throw new \InvalidArgumentException('Invalid user type')
            };

            $user->setEmail($data['email']);

            // Hash le mot de passe
            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $data['password']
            );
            $user->setPassword($hashedPassword);

            if ($user instanceof Coach) {
                $user->setRoles(['ROLE_COACH']);
                $user->setFirstName($data['firstName']);
                $user->setLastName($data['lastName']);
                $user->setWork($data['work']);

                $entityManager->persist($user);
                $entityManager->flush();

                return $this->json([
                    'message' => 'Coach registered successfully',
                    'email' => $user->getEmail()
                ]);
            } elseif ($user instanceof Institution) {
                $user->setRoles(['ROLE_INSTITUTION']);
                $user->setInstName($data['inst_name']);
                $user->setInstNumero($data['inst_numero']);

                // Vérifier d'abord si cette institution a des équipements dans OpenData
                if (!$placeSyncService->hasEquipmentsForInstitution($user->getInstNumero())) {
                    return $this->json([
                        'message' => 'Registration failed',
                        'error' => 'Aucun équipement trouvé pour ce numéro d\'institution dans notre base de données. Veuillez vérifier votre numéro d\'institution.'
                    ], Response::HTTP_BAD_REQUEST);
                }

                // Démarrer une transaction pour garantir l'atomicité
                $entityManager->beginTransaction();

                try {
                    // Persister l'institution de base d'abord
                    $entityManager->persist($user);
                    $entityManager->flush();

                    // Enrichir l'institution avec les données complètes
                    $enrichedInstitution = $institutionEnrichmentService->enrichInstitution($user);

                    // Persister les données enrichies
                    $entityManager->flush();

                    // Synchroniser automatiquement les places de cette institution depuis OpenData
                    $syncedPlaces = $placeSyncService->syncAllPlacesForNewInstitution($enrichedInstitution);
                    $equipmentCount = count($syncedPlaces);

                    // Tout s'est bien passé, valider la transaction
                    $entityManager->commit();

                    return $this->json([
                        'message' => 'Institution registered successfully',
                        'email' => $enrichedInstitution->getEmail(),
                        'inst_numero' => $enrichedInstitution->getInstNumero(),
                        'inst_name' => $enrichedInstitution->getInstName(),
                        'adresse' => $enrichedInstitution->getAdresse(),
                        'ville' => $enrichedInstitution->getVille(),
                        'coordonnees' => $enrichedInstitution->getCoordonnees(),
                        'activites' => $enrichedInstitution->getActivites() ?? [],
                        'equipements' => $enrichedInstitution->getEquipements() ?? [],
                        'equipment_count' => $equipmentCount,
                        'equipment_synchronized' => true
                    ]);
                } catch (\Exception $syncException) {
                    // Rollback de la transaction en cas d'erreur
                    $entityManager->rollback();

                    return $this->json([
                        'message' => 'Registration failed',
                        'error' => 'Erreur lors de l\'inscription: ' . $syncException->getMessage()
                    ], Response::HTTP_BAD_REQUEST);
                }
            }

            // Fallback si aucun type d'utilisateur n'est traité (ne devrait pas arriver)
            return $this->json([
                'message' => 'Registration failed',
                'error' => 'Type d\'utilisateur non pris en charge'
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
