<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\Controller\MeController;
use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\InheritanceType('JOINED')]
#[ORM\DiscriminatorColumn(name: 'type', type: 'string')]
#[ORM\DiscriminatorMap(['ROLE_COACH' => Coach::class, 'ROLE_INSTITUTION' => Institution::class])]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ApiResource(operations: [
    new Get(
        requirements: ['id' => '\d+'],
        security: "is_granted('ROLE_USER') and (object == user or is_granted('ROLE_ADMIN'))",
        securityMessage: "Vous ne pouvez accéder qu'à votre propre profil utilisateur."
    ),
    new Get(
        name: 'me',
        uriTemplate: 'users/me',
        controller: MeController::class,
        security: "is_granted('ROLE_USER')",
        securityMessage: "Vous devez être authentifié pour accéder à votre profil."
    )
])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The discriminator column for inheritance (managed by Doctrine)
     */
    private ?string $type = 'ROLE_USER';

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        
        // Synchroniser type avec le rôle principal
        $this->syncTypeFromRoles();

        return $this;
    }

    /**
     * Synchronise la colonne type avec le rôle principal depuis roles
     */
    private function syncTypeFromRoles(): void
    {
        // Trouver le rôle principal (ROLE_COACH ou ROLE_INSTITUTION)
        if (in_array('ROLE_COACH', $this->roles)) {
            $this->type = 'ROLE_COACH';
        } elseif (in_array('ROLE_INSTITUTION', $this->roles)) {
            $this->type = 'ROLE_INSTITUTION';
        } else {
            $this->type = 'ROLE_USER';
        }
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }
}
