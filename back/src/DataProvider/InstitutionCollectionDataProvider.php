<?php

namespace App\DataProvider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\InstitutionRepository;
use App\Repository\PlaceRepository;

class InstitutionCollectionDataProvider implements ProviderInterface
{
    private $placeRepository;
    private $institutionRepository;

    public function __construct(
        PlaceRepository $placeRepository,
        InstitutionRepository $institutionRepository,
    ) {
        $this->placeRepository = $placeRepository;
        $this->institutionRepository = $institutionRepository;
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // Récupérer toutes les institutions
        $institutions = $this->institutionRepository->findAll();

        // Pour chaque institution, récupérer les données de Place associées
        foreach ($institutions as $institution) {
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
        }

        return $institutions;
    }
}
