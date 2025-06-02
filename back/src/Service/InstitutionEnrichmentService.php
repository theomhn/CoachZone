<?php

namespace App\Service;

use App\Entity\Institution;
use App\Repository\PlaceRepository;

class InstitutionEnrichmentService
{
    public function __construct(
        private PlaceRepository $placeRepository
    ) {}

    /**
     * Enrichit une institution avec les données des places associées
     */
    public function enrichInstitution(Institution $institution): Institution
    {
        // Récupérer les places associées à cette institution
        $places = $this->placeRepository->findBy(['inst_numero' => $institution->getInstNumero()]);

        // Initialise le tableau des activités
        $activites = [];

        // Initialise le tableau des équipements
        $equipements = [
            'douches' => false,
            'sanitaires' => false
        ];

        // Initialise les coordonnées
        $coordonnees = null;

        foreach ($places as $place) {
            $placeData = $place->getData();

            // Traitement des activités (anciennement équipements)
            if (isset($placeData['equip_aps_nom'])) {
                // Traitement des activités en tant que tableau associatif (code => nom)
                if (isset($placeData['equip_aps_nom']) && isset($placeData['equip_aps_code'])) {
                    // Si les deux propriétés sont des tableaux
                    if (is_array($placeData['equip_aps_nom']) && is_array($placeData['equip_aps_code'])) {
                        // On parcourt les tableaux et on associe les codes aux noms
                        foreach ($placeData['equip_aps_code'] as $index => $code) {
                            if (isset($placeData['equip_aps_nom'][$index]) && !isset($activites[$code])) {
                                $activites[$code] = $placeData['equip_aps_nom'][$index];
                            }
                        }
                    }
                    // Traitement pour un seul élément (pas un tableau)
                    elseif (is_string($placeData['equip_aps_code']) && is_string($placeData['equip_aps_nom']) && !isset($activites[$placeData['equip_aps_code']])) {
                        $activites[$placeData['equip_aps_code']] = $placeData['equip_aps_nom'];
                    }
                }
            }

            // Vérification des douches
            if (isset($placeData['equip_douche']) && ($placeData['equip_douche'] === true)) {
                $equipements['douches'] = true;
            }

            // Vérification des sanitaires
            if (isset($placeData['equip_sanit']) && ($placeData['equip_sanit'] === true)) {
                $equipements['sanitaires'] = true;
            }

            // Récupération des coordonnées (si elles n'ont pas encore été trouvées)
            if ($coordonnees === null && isset($placeData['coordonnees']) && is_array($placeData['coordonnees'])) {
                if (
                    isset($placeData['coordonnees']['lat']) && isset($placeData['coordonnees']['lon']) &&
                    is_numeric($placeData['coordonnees']['lat']) && is_numeric($placeData['coordonnees']['lon'])
                ) {
                    $coordonnees = [
                        'lat' => (float) $placeData['coordonnees']['lat'],
                        'lon' => (float) $placeData['coordonnees']['lon']
                    ];
                }
            }
        }

        // Ajoute le tableau des activités à l'institution
        $institution->activites = $activites;

        // Ajoute le tableau des équipements à l'institution
        $institution->equipements = $equipements;

        // Ajoute les coordonnées à l'institution
        $institution->coordonnees = $coordonnees;

        // Extraire et formater l'adresse depuis la première place (si disponible)
        if (!empty($places)) {
            $firstPlaceData = $places[0]->getData();

            // Construire l'adresse complète
            $adresseParts = [];

            if (!empty($firstPlaceData['inst_adresse'])) {
                $adresseParts[] = $firstPlaceData['inst_adresse'];
            }

            $cpVille = '';
            if (!empty($firstPlaceData['inst_cp'])) {
                $cpVille .= $firstPlaceData['inst_cp'] . ' ';
            }
            if (!empty($firstPlaceData['lib_bdv'])) {
                $cpVille .= $firstPlaceData['lib_bdv'];
            }

            if (!empty($cpVille)) {
                $adresseParts[] = $cpVille;
            }

            // Définir l'adresse complète si des parties existent
            if (!empty($adresseParts)) {
                $institution->adresse = implode(', ', $adresseParts);
            } else {
                $institution->adresse = null;
            }
        }

        return $institution;
    }

    /**
     * Enrichit plusieurs institutions
     */
    public function enrichInstitutions(array $institutions): array
    {
        foreach ($institutions as $institution) {
            $this->enrichInstitution($institution);
        }

        return $institutions;
    }
}
