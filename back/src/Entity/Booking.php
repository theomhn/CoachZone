<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Controller\BookingController;
use App\Controller\BookingCancelController;
use App\Repository\BookingRepository;
use App\Validator\Constraint\BookingConstraint;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ApiResource(
    operations: [
        new Post(
            security: "is_granted('ROLE_COACH')",
            securityMessage: "Seuls les coachs peuvent créer des réservations.",
            securityPostDenormalize: "object.getCoach() == user",
            securityPostDenormalizeMessage: "Vous ne pouvez créer des réservations que pour vous-même."
        ),
        new Get(
            requirements: ['id' => '\d+'],
            normalizationContext: ['groups' => ['booking:read', 'booking:details']],
            security: "is_granted('ROLE_COACH') and object.getCoach() == user or (is_granted('ROLE_INSTITUTION') and object.getInstitutionNumero() == user.getInstNumero())",
            securityMessage: "Les coachs ne peuvent voir que leurs propres réservations, les institutions ne peuvent voir que les réservations dans leurs places."
        ),
        new GetCollection(
            controller: BookingController::class,
            normalizationContext: ['groups' => ['booking:read', 'booking:details']],
            security: "is_granted('ROLE_COACH') or is_granted('ROLE_INSTITUTION')",
            securityMessage: "Seuls les coachs et institutions peuvent accéder aux réservations."
        ),
        new Patch(
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_COACH') and object.getCoach() == user and object.getStatus() == 'confirmed'",
            securityMessage: "Seuls les coachs peuvent modifier leurs propres réservations confirmées.",
            denormalizationContext: ['groups' => ['booking:write']]
        ),
        new Delete(
            requirements: ['id' => '\d+'],
            controller: BookingCancelController::class,
            security: "is_granted('ROLE_COACH') and object.getCoach() == user and object.getStatus() == 'confirmed'",
            securityMessage: "Seuls les coachs peuvent annuler leurs propres réservations confirmées."
        )
    ],
    normalizationContext: ['groups' => ['booking:read']],
    denormalizationContext: ['groups' => ['booking:write']]
)]
#[BookingConstraint]
class Booking
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['booking:read', 'place:read'])]
    private ?int $id = null;

    /**
     * @var \DateTimeInterface|null Date et heure de début de la réservation
     * @example "2024-07-25T14:00:00"
     */
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['booking:read', 'booking:write', 'place:read'])]
    private ?\DateTimeInterface $dateStart = null;

    /**
     * @var \DateTimeInterface|null Date et heure de fin de la réservation
     * @example "2024-07-25T16:00:00"
     */
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['booking:read', 'booking:write', 'place:read'])]
    private ?\DateTimeInterface $dateEnd = null;

    /**
     * @var float|null Prix de la réservation en euros
     * @example 25.50
     */
    #[ORM\Column]
    #[Groups(['booking:read', 'booking:write', 'place:read'])]
    private ?float $price = null;

    /**
     * @var Place|null Place à réserver (utiliser l'URI de la place)
     * @example "/api/places/EQ12345"
     */
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['booking:read', 'booking:write'])]
    private ?Place $place = null;

    /**
     * @var Coach|null Coach qui fait la réservation (automatiquement défini)
     * @example "/api/coaches/1"
     */
    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[Groups(['booking:write'])]
    private ?Coach $coach = null;

    /**
     * @var string|null Statut de la réservation
     * @example "confirmed"
     */
    #[ORM\Column(length: 20, options: ['default' => 'confirmed'])]
    #[Groups(['booking:read', 'booking:write', 'place:read'])]
    private ?string $status = 'confirmed';

    /**
     * @var \DateTimeInterface|null Date d'annulation de la réservation
     */
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['booking:read'])]
    private ?\DateTimeInterface $cancelledAt = null;

    // Propriétés virtuelles pour exposer les données supplémentaires

    #[Groups(['booking:details'])]
    public function getInstitutionNumero(): ?string
    {
        return $this->place ? $this->place->getInstitutionNumero() : '';
    }

    #[Groups(['booking:details', 'place:read'])]
    public function getCoachFullName(): string
    {
        return $this->coach ? $this->coach->getFirstName() . ' ' . $this->coach->getLastName() : '';
    }

    #[Groups(['booking:read', 'booking:details', 'place:read'])]
    public function getCoachId(): ?int
    {
        return $this->coach ? $this->coach->getId() : null;
    }

    #[Groups(['booking:details'])]
    public function getPlaceEquipmentName(): ?string
    {
        if (!$this->place) {
            return null;
        }

        $instName = $this->place->getInstitutionName() ?? '';
        $equipNom = $this->place->getEquipNom() ?? '';

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

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCancelledAt(): ?\DateTimeInterface
    {
        return $this->cancelledAt;
    }

    public function setCancelledAt(?\DateTimeInterface $cancelledAt): static
    {
        $this->cancelledAt = $cancelledAt;

        return $this;
    }

    public function canBeModified(): bool
    {
        if ($this->status !== 'confirmed') {
            return false;
        }

        if (!$this->dateStart) {
            return false;
        }

        $now = new \DateTime('now');

        // Créer un timestamp 24h avant la date de début
        $bookingTimestamp = $this->dateStart->getTimestamp();
        $deadlineTimestamp = $bookingTimestamp - (24 * 60 * 60); // 24h en secondes
        $deadlineTime = new \DateTime('now');
        $deadlineTime->setTimestamp($deadlineTimestamp);

        return $now < $deadlineTime;
    }

    public function canBeCancelled(): bool
    {
        return $this->canBeModified();
    }
}
