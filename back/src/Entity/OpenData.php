<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\OpenDataRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: OpenDataRepository::class)]
#[ORM\Table(name: 'opendata')]
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/opendata/{id}',
            normalizationContext: ['groups' => ['opendata:read']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Accès restreint aux utilisateurs authentifiés."
        ),
        new GetCollection(
            uriTemplate: '/opendata',
            normalizationContext: ['groups' => ['opendata:read']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Accès restreint aux utilisateurs authentifiés."
        )
    ],
    order: ['id']
)]
class OpenData
{
    #[ORM\Id]
    #[ORM\Column(length: 255)]
    #[Groups(['opendata:read'])]
    private ?string $id = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['opendata:read'])]
    private array $data = [];

    #[ORM\Column]
    #[Groups(['opendata:read'])]
    private ?\DateTimeImmutable $lastUpdate = null;

    // Constructor
    public function __construct()
    {
        $this->lastUpdate = new \DateTimeImmutable();
    }

    // Getters and Setters
    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(string $id): static
    {
        $this->id = $id;
        return $this;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function setData(array $data): static
    {
        $this->data = $data;
        return $this;
    }

    public function getLastUpdate(): ?\DateTimeImmutable
    {
        return $this->lastUpdate;
    }

    public function setLastUpdate(\DateTimeImmutable $lastUpdate): static
    {
        $this->lastUpdate = $lastUpdate;
        return $this;
    }

    // Helper methods to access common data fields
    public function getEquipNumero(): ?string
    {
        return $this->data['equip_numero'] ?? null;
    }

    public function getInstNom(): ?string
    {
        return $this->data['inst_nom'] ?? null;
    }

    public function getEquipNom(): ?string
    {
        return $this->data['equip_nom'] ?? null;
    }

    public function getInstAdresse(): ?string
    {
        return $this->data['inst_adresse'] ?? null;
    }

    public function getCoordonnees(): ?array
    {
        return $this->data['coordonnees'] ?? null;
    }

    public function getEquipTypeName(): ?string
    {
        return $this->data['equip_type_name'] ?? null;
    }
}
