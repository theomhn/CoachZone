<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use App\Controller\CoachFavoritesController;
use App\Controller\AddFavoriteInstitutionController;
use App\Controller\RemoveFavoriteInstitutionController;
use App\Repository\CoachRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CoachRepository::class)]
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/coaches/me/favorites',
            controller: CoachFavoritesController::class,
            normalizationContext: ['groups' => ['coach:favorites']],
            security: "is_granted('ROLE_COACH')",
            securityMessage: "Seuls les coachs peuvent accéder à leurs favoris."
        ),
        new Post(
            uriTemplate: '/coaches/me/favorites/{institutionId}',
            controller: AddFavoriteInstitutionController::class,
            security: "is_granted('ROLE_COACH')",
            securityMessage: "Seuls les coachs peuvent ajouter des favoris."
        ),
        new Delete(
            uriTemplate: '/coaches/me/favorites/{institutionId}',
            controller: RemoveFavoriteInstitutionController::class,
            security: "is_granted('ROLE_COACH')",
            securityMessage: "Seuls les coachs peuvent supprimer des favoris."
        )
    ]
)]
class Coach extends User
{
    #[ORM\Column(length: 255)]
    #[Groups(['user:read'])]
    #[Assert\NotBlank(message: "Le nom est requis")]
    #[Assert\Length(max: 255, maxMessage: "Le nom ne peut pas dépasser {{ limit }} caractères")]
    private ?string $lastName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read'])]
    #[Assert\NotBlank(message: "Le prénom est requis")]
    #[Assert\Length(max: 255, maxMessage: "Le prénom ne peut pas dépasser {{ limit }} caractères")]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read'])]
    #[Assert\NotBlank(message: "Le métier est requis")]
    #[Assert\Length(max: 255, maxMessage: "Le métier ne peut pas dépasser {{ limit }} caractères")]
    private ?string $work = null;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'coach')]
    private Collection $bookings;

    /**
     * @var Collection<int, Institution>
     */
    #[ORM\ManyToMany(targetEntity: Institution::class)]
    #[ORM\JoinTable(name: 'coach_favorite_institutions')]
    private Collection $favoriteInstitutions;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
        $this->favoriteInstitutions = new ArrayCollection();
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getWork(): ?string
    {
        return $this->work;
    }

    public function setWork(string $work): static
    {
        $this->work = $work;

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
            $booking->setCoach($this);
        }

        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            // set the owning side to null (unless already changed)
            if ($booking->getCoach() === $this) {
                $booking->setCoach(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Institution>
     */
    public function getFavoriteInstitutions(): Collection
    {
        return $this->favoriteInstitutions;
    }

    public function addFavoriteInstitution(Institution $institution): static
    {
        if (!$this->favoriteInstitutions->contains($institution)) {
            $this->favoriteInstitutions->add($institution);
        }

        return $this;
    }

    public function removeFavoriteInstitution(Institution $institution): static
    {
        $this->favoriteInstitutions->removeElement($institution);

        return $this;
    }

    public function isFavoriteInstitution(Institution $institution): bool
    {
        return $this->favoriteInstitutions->contains($institution);
    }
}
