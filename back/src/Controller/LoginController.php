<?php

namespace App\Controller;

use App\Entity\AccessToken;
use App\Entity\Coach;
use App\Entity\Institution;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

class LoginController extends AbstractController
{
    #[Route('/api/login', name: 'app_login', methods: ['POST'])]
    public function index(#[CurrentUser] ?User $user, EntityManagerInterface $entityManager): Response
    {
        if (null === $user) {
            return $this->json([
                'message' => 'missing credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = bin2hex(random_bytes(64));

        $accessToken = new AccessToken();
        $accessToken->setToken($token);
        $accessToken->setUserEmail($user->getEmail());

        $entityManager->persist($accessToken);
        $entityManager->flush();

        $userData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'token' => $token
        ];

        if ($user instanceof Coach) {
            $userData['firstName'] = $user->getFirstName();
            $userData['lastName'] = $user->getLastName();
            $userData['work'] = $user->getWork();
            $userData['type'] = 'coach';
        } elseif ($user instanceof Institution) {
            $userData['name'] = $user->getName();
            $userData['type'] = 'institution';
        }

        return $this->json($userData);
    }
}
