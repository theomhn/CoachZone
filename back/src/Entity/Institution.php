<?php

namespace App\Entity;

use App\Repository\InstitutionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InstitutionRepository::class)]
class Institution extends User
{
    #[ORM\Column(type: Types::ARRAY)]
    private array $ownedPlace = [];

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    public function getOwnedPlace(): array
    {
        return $this->ownedPlace;
    }

    public function setOwnedPlace(array $ownedPlace): static
    {
        $this->ownedPlace = $ownedPlace;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }
}
