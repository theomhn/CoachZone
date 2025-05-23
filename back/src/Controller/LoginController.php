<?php

namespace App\Controller;

use App\Entity\AccessToken;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsController]
class LoginController extends AbstractController
{
    public function __invoke(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): Response {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->json([
                'message' => 'missing credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Trouver l'utilisateur par email
        $user = $userRepository->findOneBy(['email' => $data['email']]);

        if (!$user) {
            return $this->json([
                'message' => 'missing credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe
        if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json([
                'message' => 'missing credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Générer le token
        $token = bin2hex(random_bytes(64));

        $accessToken = new AccessToken();
        $accessToken->setToken($token);
        $accessToken->setUserEmail($user->getEmail());

        $entityManager->persist($accessToken);
        $entityManager->flush();

        return $this->json($token);
    }
}
