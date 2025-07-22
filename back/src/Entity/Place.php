<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\DataProvider\PlaceCollectionProvider;
use App\Repository\PlaceRepository;
use App\State\PlacePriceUpdateProcessor;
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
            security: "is_granted('ROLE_COACH') or is_granted('ROLE_INSTITUTION')",
            securityMessage: "Accès restreint aux coachs et institutions."
        ),
        new GetCollection(
            provider: PlaceCollectionProvider::class,
            normalizationContext: ['groups' => ['place:read']],
            security: "is_granted('ROLE_COACH') or is_granted('ROLE_INSTITUTION')",
            securityMessage: "Accès restreint aux coachs et institutions."
        ),
        new Post(
            denormalizationContext: ['groups' => ['place:write']],
            normalizationContext: ['groups' => ['place:read']],
            security: "is_granted('ROLE_INSTITUTION')",
            securityMessage: "Seules les institutions peuvent créer des places."
        ),
        new Patch(
            denormalizationContext: ['groups' => ['price:write']],
            processor: PlacePriceUpdateProcessor::class,
            security: "is_granted('ROLE_INSTITUTION') and object.getInstitution() == user",
            securityMessage: "Seules les institutions peuvent modifier leurs propres places."
        ),
        new Delete(
            security: "is_granted('ROLE_INSTITUTION') and object.getInstitution() == user",
            securityMessage: "Seules les institutions peuvent supprimer leurs propres places."
        )
    ],
    order: ['inst_name', 'id']
)]
class Place
{
    /**
     * @var string|null Identifiant unique de l'équipement
     * @example "EQ12345"
     */
    #[ORM\Id]
    #[ORM\Column(length: 255)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $id = null;  // Utilisation de equip_numero comme ID

    /**
     * @var string|null Numéro de l'institution
     * @example "INST001"
     */
    #[ORM\Column(length: 255)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $inst_numero = null;

    /**
     * @var string|null Nom de l'institution
     * @example "Centre Sportif Municipal"
     */
    #[ORM\Column(length: 255)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $inst_name = null;

    /**
     * @var string|null Nom de l'équipement
     * @example "Terrain de football principal"
     */
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $equip_nom = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['place:read'])]
    private ?array $equip_aps_nom = null;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['place:read'])]
    private ?float $equip_surf = null;

    /**
     * @var float|null Prix de location par heure en euros
     * @example 25.50
     */
    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['place:read', 'price:write', 'place:write'])]
    private ?float $price = null;

    #[ORM\Column]
    #[Groups(['place:read'])]
    private ?\DateTimeImmutable $lastUpdate = null;

    /**
     * @var Institution|null Institution propriétaire de la place
     * @example "/api/institutions/1"
     */
    #[ORM\ManyToOne(targetEntity: Institution::class, inversedBy: 'places')]
    #[ORM\JoinColumn(name: 'institution_id', referencedColumnName: 'id')]
    #[Groups(['place:read', 'place:write'])]
    private ?Institution $institution = null;

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

    public function getEquipNom(): ?string
    {
        return $this->equip_nom;
    }

    public function setEquipNom(?string $equip_nom): static
    {
        $this->equip_nom = $equip_nom;
        return $this;
    }

    public function getEquipApsNom(): ?array
    {
        return $this->equip_aps_nom;
    }

    public function setEquipApsNom(?array $equip_aps_nom): static
    {
        $this->equip_aps_nom = $equip_aps_nom;
        return $this;
    }

    public function getEquipSurf(): ?float
    {
        return $this->equip_surf;
    }

    public function setEquipSurf(?float $equip_surf): static
    {
        $this->equip_surf = $equip_surf;
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

    public function getInstitution(): ?Institution
    {
        return $this->institution;
    }

    public function setInstitution(?Institution $institution): static
    {
        $this->institution = $institution;
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
