<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Entity\Institution;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class RegistrationController extends AbstractController
{
    public function __invoke(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);

        try {
            // Vérifier le type d'utilisateur
            $user = match ($data['type']) {
                'coach' => new Coach(),
                'institution' => new Institution(),
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
            } elseif ($user instanceof Institution) {
                $user->setRoles(['ROLE_INSTITUTION']);
                $user->setInstName($data['inst_name']);
                $user->setInstNumero($data['inst_numero']);
            }

            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'message' => 'User registered successfully',
                'email' => $user->getEmail()
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}
