<?php

namespace App\Entity;

use App\Repository\EmailChangeRequestRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: EmailChangeRequestRepository::class)]
class EmailChangeRequest
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 180)]
    #[Assert\Email(message: "L'email doit avoir un format valide")]
    private ?string $currentEmail = null;

    #[ORM\Column(length: 180)]
    #[Assert\Email(message: "Le nouvel email doit avoir un format valide")]
    private ?string $newEmail = null;

    #[ORM\Column(length: 6)]
    private ?string $verificationCode = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $expiresAt = null;

    #[ORM\Column]
    private bool $isUsed = false;

    public function __construct()
    {
        $parisTimezone = new \DateTimeZone('Europe/Paris');
        $this->createdAt = new \DateTime('now', $parisTimezone);
        $this->expiresAt = new \DateTime('+15 minutes', $parisTimezone);
        $this->verificationCode = $this->generateCode();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCurrentEmail(): ?string
    {
        return $this->currentEmail;
    }

    public function setCurrentEmail(string $currentEmail): static
    {
        $this->currentEmail = $currentEmail;

        return $this;
    }

    public function getNewEmail(): ?string
    {
        return $this->newEmail;
    }

    public function setNewEmail(string $newEmail): static
    {
        $this->newEmail = $newEmail;

        return $this;
    }

    public function getVerificationCode(): ?string
    {
        return $this->verificationCode;
    }

    public function setVerificationCode(string $verificationCode): static
    {
        $this->verificationCode = $verificationCode;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeInterface
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeInterface $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function isUsed(): bool
    {
        return $this->isUsed;
    }

    public function setIsUsed(bool $isUsed): static
    {
        $this->isUsed = $isUsed;

        return $this;
    }

    public function isExpired(): bool
    {
        $now = new \DateTime('now', new \DateTimeZone('Europe/Paris'));
        return $now > $this->expiresAt;
    }

    public function isValid(): bool
    {
        return !$this->isUsed && !$this->isExpired();
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
