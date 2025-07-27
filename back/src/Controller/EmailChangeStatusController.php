<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\EmailChangeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class EmailChangeStatusController extends AbstractController
{
    public function __construct(
        private EmailChangeService $emailChangeService
    ) {
    }

    #[IsGranted('ROLE_USER')]
    public function __invoke(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $canInitiate = $this->emailChangeService->canInitiateEmailChange($user);
        
        $response = [
            'currentEmail' => $user->getEmail(),
            'canInitiateChange' => $canInitiate
        ];
        
        if (!$canInitiate) {
            $timeLeft = $this->emailChangeService->getTimeUntilNextRequest($user);
            $response['timeUntilNextRequest'] = $timeLeft;
        }
        
        return new JsonResponse($response);
    }
}