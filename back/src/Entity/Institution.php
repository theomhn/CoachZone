<?php

namespace App\Entity;

use App\Repository\InstitutionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InstitutionRepository::class)]
class Institution extends User
{
    #[ORM\Column(length: 255, unique: true)]
    private ?string $inst_numero = null;

    #[ORM\Column(length: 255)]
    private ?string $inst_name = null;

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
