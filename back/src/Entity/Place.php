<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use App\DataProvider\PlaceCollectionProvider;
use App\Repository\PlaceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PlaceRepository::class)]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['place:read']],
            security: "is_granted('ROLE_COACH')",
            securityMessage: "Seuls les coachs peuvent consulter les détails des places."
        ),
        new GetCollection(
            provider: PlaceCollectionProvider::class,
            normalizationContext: ['groups' => ['place:read']],
            security: "is_granted('ROLE_COACH')",
            securityMessage: "Seuls les coachs peuvent consulter la liste des places."
        ),
        new Patch(
            denormalizationContext: ['groups' => ['price:write']],
            normalizationContext: ['groups' => ['place:read']],
            security: "is_granted('ROLE_INSTITUTION') and object.getInstitutionNumero() == user.getInstNumero()",
            securityMessage: "Seules les institutions peuvent modifier le prix de leurs propres places."
        )
    ],
    order: ['inst_name', 'inst_numero', 'id']
)]
class Place
{
    #[ORM\Id]
    #[ORM\Column(length: 255)]
    #[Groups(['place:read'])]
    private ?string $id = null;  // Utilisation de equip_numero comme ID

    #[ORM\Column(length: 255)]
    #[Groups(['place:read'])]
    private ?string $inst_numero = null;

    #[ORM\Column(length: 255)]
    #[Groups(['place:read'])]
    private ?string $inst_name = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['place:read'])]
    private array $data = [];

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['place:read', 'price:write'])]
    private ?float $price = null;

    #[ORM\Column]
    #[Groups(['place:read'])]
    private ?\DateTimeImmutable $lastUpdate = null;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'place')]
    private Collection $bookings;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(string $id): static
    {
        $this->id = $id;
        return $this;
    }

    public function getInstitutionName(): ?string
    {
        return $this->inst_name;
    }

    public function setInstitutionName(string $inst_name): static
    {
        $this->inst_name = $inst_name;

        return $this;
    }

    public function getInstitutionNumero(): string
    {
        return $this->inst_numero;
    }

    public function setInstitutionNumero(?string $inst_numero): static
    {
        $this->inst_numero = $inst_numero;
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

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(?float $price): static
    {
        $this->price = $price;
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

    /**
     * @return Collection<int, Booking>
     */
    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    /**
     * Retourne uniquement les réservations qui ne sont pas passées (futures ou en cours)
     * 
     * @return Collection<int, Booking>
     */
    #[Groups(['place:read'])]
    public function getUpcomingBookings(): Collection
    {
        $now = new \DateTime();

        return $this->bookings->filter(function (Booking $booking) use ($now) {
            return $booking->getDateEnd() > $now;
        });
    }

    public function addBooking(Booking $booking): static
    {
        if (!$this->bookings->contains($booking)) {
            $this->bookings->add($booking);
            $booking->setPlace($this);
        }
        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getPlace() === $this) {
                $booking->setPlace(null);
            }
        }
        return $this;
    }
}
