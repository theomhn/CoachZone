<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PlaceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlaceRepository::class)]
#[ApiResource(routePrefix: '/opendata')]
class Place
{
    #[ORM\Id]
    #[ORM\Column(length: 255)]
    private ?string $id = null;  // Utilisation de equip_numero comme ID

    #[ORM\Column(length: 255)]
    private ?string $inst_numero = null;

    #[ORM\Column(length: 255)]
    private ?string $inst_name = null;

    #[ORM\Column(type: Types::JSON)]
    private array $data = [];

    #[ORM\Column]
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
