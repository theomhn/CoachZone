<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\InstitutionController;
use App\DataProvider\InstitutionCollectionDataProvider;
use App\Repository\InstitutionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: InstitutionRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            provider: InstitutionCollectionDataProvider::class,
            normalizationContext: ['groups' => ['institution:read']]
        ),
        new GetCollection(
            uriTemplate: '/opendata/institutions',
            controller: InstitutionController::class,
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

    /**
     * Adresse complète de l'institution (combinaison de inst_adresse, inst_cp, lib_bdv)
     */
    #[Groups(['institution:read'])]
    public ?string $adresse = null;

    /**
     * Coordonnées géographiques de l'institution
     */
    #[Groups(['institution:read'])]
    public ?array $coordonnees = null;

    /**
     * Liste des activités sportives (equip_aps_nom) dans cette institution
     */
    #[Groups(['institution:read'])]
    public array $activites = [];

    /**
     * Informations sur les équipements disponibles (douches, sanitaires)
     */
    #[Groups(['institution:read'])]
    public array $equipements = [];

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
}
