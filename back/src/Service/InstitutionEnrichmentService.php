<?php

namespace App\Service;

use App\Entity\Institution;
use App\Repository\OpenDataRepository;
use Doctrine\ORM\EntityManagerInterface;

class InstitutionEnrichmentService
{
    public function __construct(
        private OpenDataRepository $openDataRepository,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Enrichit une institution avec les données des équipements associés
     */
    public function enrichInstitution(Institution $institution): Institution
    {
        // Utiliser la méthode privée pour l'enrichissement
        $this->enrichInstitutionWithoutFlush($institution);
        
        // Persister les modifications en base de données
        $this->entityManager->flush();

        return $institution;
    }

    /**
     * Enrichit plusieurs institutions
     */
    public function enrichInstitutions(array $institutions): array
    {
        foreach ($institutions as $institution) {
            // Enrichir sans flush pour éviter les multiples flush
            $this->enrichInstitutionWithoutFlush($institution);
        }

        // Un seul flush à la fin pour toutes les institutions
        $this->entityManager->flush();

        return $institutions;
    }

    /**
     * Enrichit une institution sans persister immédiatement
     */
    private function enrichInstitutionWithoutFlush(Institution $institution): Institution
    {
        // Récupérer les équipements associés à cette institution depuis OpenData
        $equipments = $this->openDataRepository->findEquipmentsByInstitution($institution->getInstNumero());

        // Initialise le tableau des activités
        $activites = [];

        // Initialise le tableau des équipements
        $equipements = [
            'douches' => false,
            'sanitaires' => false
        ];

        // Initialise les coordonnées
        $coordonnees = null;

        foreach ($equipments as $equipment) {
            $equipmentData = $equipment->getData();

            // Traitement des activités (anciennement équipements)
            if (isset($equipmentData['equip_aps_nom'])) {
                // Traitement des activités en tant que tableau associatif (code => nom)
                if (isset($equipmentData['equip_aps_nom']) && isset($equipmentData['equip_aps_code'])) {
                    // Si les deux propriétés sont des tableaux
                    if (is_array($equipmentData['equip_aps_nom']) && is_array($equipmentData['equip_aps_code'])) {
                        // On parcourt les tableaux et on associe les codes aux noms
                        foreach ($equipmentData['equip_aps_code'] as $index => $code) {
                            if (isset($equipmentData['equip_aps_nom'][$index]) && !isset($activites[$code])) {
                                $activites[$code] = $equipmentData['equip_aps_nom'][$index];
                            }
                        }
                    }
                    // Traitement pour un seul élément (pas un tableau)
                    elseif (is_string($equipmentData['equip_aps_code']) && is_string($equipmentData['equip_aps_nom']) && !isset($activites[$equipmentData['equip_aps_code']])) {
                        $activites[$equipmentData['equip_aps_code']] = $equipmentData['equip_aps_nom'];
                    }
                }
            }

            // Vérification des douches
            if (isset($equipmentData['equip_douche']) && ($equipmentData['equip_douche'] === true)) {
                $equipements['douches'] = true;
            }

            // Vérification des sanitaires
            if (isset($equipmentData['equip_sanit']) && ($equipmentData['equip_sanit'] === true)) {
                $equipements['sanitaires'] = true;
            }

            // Récupération des coordonnées (si elles n'ont pas encore été trouvées)
            if ($coordonnees === null && isset($equipmentData['coordonnees']) && is_array($equipmentData['coordonnees'])) {
                if (
                    isset($equipmentData['coordonnees']['lat']) && isset($equipmentData['coordonnees']['lon']) &&
                    is_numeric($equipmentData['coordonnees']['lat']) && is_numeric($equipmentData['coordonnees']['lon'])
                ) {
                    $coordonnees = [
                        'lat' => (float) $equipmentData['coordonnees']['lat'],
                        'lon' => (float) $equipmentData['coordonnees']['lon']
                    ];
                }
            }
        }

        // Ajoute le tableau des activités à l'institution
        $institution->setActivites($activites);

        // Ajoute le tableau des équipements à l'institution
        $institution->setEquipements($equipements);

        // Ajoute les coordonnées à l'institution
        $institution->setCoordonnees($coordonnees);

        // Extraire et formater l'adresse depuis le premier équipement (si disponible)
        if (!empty($equipments)) {
            $firstEquipmentData = $equipments[0]->getData();

            // Définir l'adresse (rue uniquement)
            if (!empty($firstEquipmentData['inst_adresse'])) {
                $institution->setAdresse($firstEquipmentData['inst_adresse']);
            } else {
                $institution->setAdresse(null);
            }

            // Construire ville avec code postal
            $ville = '';
            if (!empty($firstEquipmentData['inst_cp'])) {
                $ville .= $firstEquipmentData['inst_cp'] . ' ';
            }
            if (!empty($firstEquipmentData['lib_bdv'])) {
                $ville .= $firstEquipmentData['lib_bdv'];
            }

            // Définir la ville
            if (!empty($ville)) {
                $institution->setVille(trim($ville));
            } else {
                $institution->setVille(null);
            }
        }

        return $institution;
    }
}
