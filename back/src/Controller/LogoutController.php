<?php

namespace App\Controller;

use App\Repository\AccessTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class LogoutController extends AbstractController
{
    public function __invoke(Request $request, AccessTokenRepository $tokenRepository, EntityManagerInterface $entityManager): Response
    {
        $authHeader = $request->headers->get('Authorization');
        $token = str_replace('Bearer ', '', $authHeader);

        $accessToken = $tokenRepository->findOneByToken($token);

        if ($accessToken) {
            $entityManager->remove($accessToken);
            $entityManager->flush();
        }

        return $this->json(['message' => 'Logged out successfully']);
    }
}
