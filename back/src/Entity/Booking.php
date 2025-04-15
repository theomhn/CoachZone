<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\BookingController;
use App\Repository\BookingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ApiResource(
    operations: [
        new Post(
            security: "is_granted('ROLE_USER')",
            securityPostDenormalize: "object.getCoach() == user"
        ),
        new Get(
            requirements: ['id' => '\d+'],
            normalizationContext: ['groups' => ['booking:read', 'booking:details']]
        ),
        new GetCollection(
            controller: BookingController::class,
            normalizationContext: ['groups' => ['booking:read', 'booking:details']]
        )
    ],
    normalizationContext: ['groups' => ['booking:read']],
    denormalizationContext: ['groups' => ['booking:write']]
)]
class Booking
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['booking:read', 'booking:write'])]
    private ?\DateTimeInterface $dateStart = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['booking:read', 'booking:write'])]
    private ?\DateTimeInterface $dateEnd = null;

    #[ORM\Column]
    #[Groups(['booking:read', 'booking:write'])]
    private ?float $price = null;

    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['booking:read', 'booking:write'])]
    private ?Place $place = null;

    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[Groups(['booking:read', 'booking:write'])]
    private ?Coach $coach = null;

    // Propriétés virtuelles pour exposer les données supplémentaires

    #[Groups(['booking:details'])]
    public function getInstitutionNumero(): ?string
    {
        return $this->place->getData()['inst_numero'] ?? '';
    }

    #[Groups(['booking:details'])]
    public function getCoachFullName(): string
    {
        return $this->coach ? $this->coach->getFirstName() . ' ' . $this->coach->getLastName() : '';
    }

    #[Groups(['booking:details'])]
    public function getPlaceEquipmentName(): ?string
    {
        if (!$this->place || !$this->place->getData()) {
            return null;
        }

        $data = $this->place->getData();
        $instName = $data['inst_nom'] ?? '';
        $equipNom = $data['equip_nom'] ?? '';

        if (empty($instName) && empty($equipNom)) {
            return null;
        }

        return $instName . ' - ' . $equipNom;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getDateStart(): ?\DateTimeInterface
    {
        return $this->dateStart;
    }

    public function setDateStart(\DateTimeInterface $dateStart): static
    {
        $this->dateStart = $dateStart;

        return $this;
    }

    public function getDateEnd(): ?\DateTimeInterface
    {
        return $this->dateEnd;
    }

    public function setDateEnd(\DateTimeInterface $dateEnd): static
    {
        $this->dateEnd = $dateEnd;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getPlace(): ?Place
    {
        return $this->place;
    }

    public function setPlace(?Place $place): static
    {
        $this->place = $place;

        return $this;
    }

    public function getCoach(): ?Coach
    {
        return $this->coach;
    }

    public function setCoach(?Coach $coach): static
    {
        $this->coach = $coach;

        return $this;
    }
}
