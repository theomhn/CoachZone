<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

class UserController extends AbstractController
{

    #[Route('/api/users/me', name: 'app_user_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): Response
    {

        if (!$user) {
            return $this->json(['message' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $userData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles()
        ];

        if ($user instanceof \App\Entity\Coach) {
            $userData['firstName'] = $user->getFirstName();
            $userData['lastName'] = $user->getLastName();
            $userData['work'] = $user->getWork();
            $userData['type'] = 'coach';
        } elseif ($user instanceof \App\Entity\Institution) {
            $userData['inst_numero'] = $user->getInstNumero();
            $userData['inst_name'] = $user->getInstName();
            $userData['type'] = 'institution';
        }

        return $this->json($userData);
    }
}
