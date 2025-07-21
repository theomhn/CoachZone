<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use App\Controller\InstitutionController;
use App\DataProvider\InstitutionCollectionDataProvider;
use App\Repository\InstitutionRepository;
use App\Repository\OpenDataRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: InstitutionRepository::class)]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['institution:read']],
            security: "is_granted('ROLE_COACH') or is_granted('ROLE_INSTITUTION')",
            securityMessage: "Accès restreint aux utilisateurs authentifiés."
        ),
        new GetCollection(
            provider: InstitutionCollectionDataProvider::class,
            normalizationContext: ['groups' => ['institution:read']],
            security: "is_granted('ROLE_COACH')",
            securityMessage: "Seuls les coachs peuvent consulter la liste des institutions."
        ),
        new GetCollection(
            uriTemplate: '/opendata/institutions',
            controller: InstitutionController::class,
            security: 'true' // Route publique pour les données ouvertes
        ),
        new Patch(
            denormalizationContext: ['groups' => ['institution:write']],
            normalizationContext: ['groups' => ['institution:read']],
            security: "is_granted('ROLE_INSTITUTION') and object == user",
            securityMessage: "Seules les institutions peuvent modifier leur propre profil."
        )
    ]
)]
class Institution extends User
{
    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['institution:read'])]
    private ?string $inst_numero = null;

    #[ORM\Column(length: 255)]
    #[Groups(['institution:read'])]
    private ?string $inst_name = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['institution:read'])]
    private ?string $adresse = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['institution:read'])]
    private ?string $ville = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['institution:read'])]
    private ?array $coordonnees = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['institution:read'])]
    private ?array $activites = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['institution:read'])]
    private ?array $equipements = null;

    /**
     * @var Collection<int, Place>
     */
    #[ORM\OneToMany(targetEntity: Place::class, mappedBy: 'institution')]
    #[Groups(['institution:read'])]
    private Collection $places;

    public function __construct()
    {
        $this->places = new ArrayCollection();
    }

    public function getInstNumero(): ?string
    {
        return $this->inst_numero;
    }

    public function setInstNumero(string $inst_numero): static
    {
        $this->inst_numero = $inst_numero;
        return $this;
    }

    public function getInstName(): ?string
    {
        return $this->inst_name;
    }

    public function setInstName(string $inst_name): static
    {
        $this->inst_name = $inst_name;
        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;
        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(?string $ville): static
    {
        $this->ville = $ville;
        return $this;
    }

    public function getCoordonnees(): ?array
    {
        return $this->coordonnees;
    }

    public function setCoordonnees(?array $coordonnees): static
    {
        $this->coordonnees = $coordonnees;
        return $this;
    }

    public function getActivites(): ?array
    {
        return $this->activites;
    }

    public function setActivites(?array $activites): static
    {
        $this->activites = $activites;
        return $this;
    }

    public function getEquipements(): ?array
    {
        return $this->equipements;
    }

    public function setEquipements(?array $equipements): static
    {
        $this->equipements = $equipements;
        return $this;
    }

    /**
     * @return Collection<int, Place>
     */
    public function getPlaces(): Collection
    {
        return $this->places;
    }

    public function addPlace(Place $place): static
    {
        if (!$this->places->contains($place)) {
            $this->places->add($place);
            $place->setInstitution($this);
        }
        return $this;
    }

    public function removePlace(Place $place): static
    {
        if ($this->places->removeElement($place)) {
            if ($place->getInstitution() === $this) {
                $place->setInstitution(null);
            }
        }
        return $this;
    }
}
