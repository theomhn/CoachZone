<?php

namespace App\Service;

use App\Entity\Institution;
use App\Entity\Place;
use App\Repository\OpenDataRepository;
use App\Repository\PlaceRepository;
use Doctrine\ORM\EntityManagerInterface;

class PlaceSyncService
{
    public function __construct(
        private OpenDataRepository $openDataRepository,
        private PlaceRepository $placeRepository,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Synchronise les places d'une institution depuis OpenData
     * Crée ou met à jour les entités Place basées sur les données OpenData
     * 
     * @param Institution $institution L'institution pour laquelle synchroniser les places
     * @return array Les places synchronisées
     */
    public function syncPlacesForInstitution(Institution $institution): array
    {
        $instNumero = $institution->getInstNumero();

        // Récupérer tous les équipements de cette institution depuis OpenData
        $equipments = $this->openDataRepository->findEquipmentsByInstitution($instNumero);

        // Récupérer les places existantes pour cette institution
        $existingPlaces = $this->placeRepository->findByInstitutionNumero($instNumero);
        $existingPlacesMap = [];
        foreach ($existingPlaces as $place) {
            $existingPlacesMap[$place->getId()] = $place;
        }

        $syncedPlaces = [];

        foreach ($equipments as $equipment) {
            $equipmentData = $equipment->getData();
            $equipmentId = $equipment->getId();

            // Vérifier si la place existe déjà
            if (isset($existingPlacesMap[$equipmentId])) {
                $place = $existingPlacesMap[$equipmentId];
                // Mettre à jour les informations si nécessaire
                $this->updatePlaceFromOpenData($place, $equipmentData);
            } else {
                // Créer une nouvelle place
                $place = $this->createPlaceFromOpenData($equipmentId, $equipmentData);
                $this->entityManager->persist($place);
            }

            $syncedPlaces[] = $place;
        }

        return $syncedPlaces;
    }

    /**
     * Synchronise une place spécifique depuis OpenData
     */
    public function syncPlace(string $equipmentId): ?Place
    {
        $equipment = $this->openDataRepository->find($equipmentId);
        if (!$equipment) {
            return null;
        }

        $equipmentData = $equipment->getData();

        // Vérifier si la place existe déjà
        $existingPlace = $this->placeRepository->find($equipmentId);

        if ($existingPlace) {
            $this->updatePlaceFromOpenData($existingPlace, $equipmentData);
            return $existingPlace;
        } else {
            $place = $this->createPlaceFromOpenData($equipmentId, $equipmentData);
            $this->entityManager->persist($place);
            return $place;
        }
    }

    /**
     * Crée une nouvelle entité Place depuis les données OpenData
     */
    private function createPlaceFromOpenData(string $equipmentId, array $equipmentData, ?Institution $institution = null): Place
    {
        $place = new Place();
        $place->setId($equipmentId);
        $place->setInstitutionNumero($equipmentData['inst_numero'] ?? '');
        $place->setInstitutionName($equipmentData['inst_nom'] ?? '');
        $place->setEquipNom($equipmentData['equip_nom'] ?? null);
        $place->setEquipApsNom($equipmentData['equip_aps_nom'] ?? null);
        $place->setEquipSurf($equipmentData['equip_surf'] ?? null);
        $place->setLastUpdate(new \DateTimeImmutable());

        // Associer à l'institution si fournie
        if ($institution) {
            $place->setInstitution($institution);
        }

        return $place;
    }

    /**
     * Met à jour une entité Place existante depuis les données OpenData
     */
    private function updatePlaceFromOpenData(Place $place, array $equipmentData): void
    {
        // Mettre à jour uniquement les champs qui peuvent changer
        $place->setInstitutionName($equipmentData['inst_nom'] ?? '');
        $place->setEquipNom($equipmentData['equip_nom'] ?? null);
        $place->setEquipApsNom($equipmentData['equip_aps_nom'] ?? null);
        $place->setEquipSurf($equipmentData['equip_surf'] ?? null);
        $place->setLastUpdate(new \DateTimeImmutable());

        // Note: On ne met pas à jour le prix car il est géré par l'institution
    }

    /**
     * Synchronise toutes les places lors de l'inscription d'une institution
     * Cette méthode doit être appelée quand une institution s'inscrit
     */
    public function syncAllPlacesForNewInstitution(Institution $institution): array
    {
        $places = $this->syncPlacesForInstitution($institution);

        // Associer toutes les places à cette institution
        foreach ($places as $place) {
            if (!$place->getInstitution()) {
                $place->setInstitution($institution);
            }
        }

        // Sauvegarder toutes les modifications
        $this->entityManager->flush();

        return $places;
    }

    /**
     * Vérifie si une institution a des équipements disponibles dans OpenData
     */
    public function hasEquipmentsForInstitution(string $instNumero): bool
    {
        $equipments = $this->openDataRepository->findEquipmentsByInstitution($instNumero);
        return count($equipments) > 0;
    }

    /**
     * Compte le nombre d'équipements disponibles pour une institution
     */
    public function countEquipmentsForInstitution(string $instNumero): int
    {
        $equipments = $this->openDataRepository->findEquipmentsByInstitution($instNumero);
        return count($equipments);
    }
}
