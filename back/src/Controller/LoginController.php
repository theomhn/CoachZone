<?php

// LoginController.php
namespace App\Controller;

use App\Entity\AccessToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class LoginController extends AbstractController
{
    public function __invoke(#[CurrentUser] ?User $user, EntityManagerInterface $entityManager): Response
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

        return $this->json($token);
    }
}
