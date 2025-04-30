import { FilterOptions, Institution } from "@/types";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

// Clé pour le stockage des filtres
const FILTERS_STORAGE_KEY = "institutionFilters";

export const useInstitutionFilters = (initialInstitutions: Institution[] = []) => {
    const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
    const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>(initialInstitutions);
    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState<FilterOptions>({
        activities: [],
        equipements: {
            douches: false,
            sanitaires: false,
        },
    });
    const [allActivities, setAllActivities] = useState<string[]>([]);
    const [filtersLoaded, setFiltersLoaded] = useState(false);

    // Charger les filtres sauvegardés au démarrage (une seule fois)
    useEffect(() => {
        const loadSavedFilters = async () => {
            try {
                const savedFilters = await SecureStore.getItemAsync(FILTERS_STORAGE_KEY);

                if (savedFilters) {
                    const parsedFilters = JSON.parse(savedFilters);
                    console.log("Filtres chargés:", parsedFilters);
                    setFilters(parsedFilters);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des filtres sauvegardés:", error);
            } finally {
                setFiltersLoaded(true);
            }
        };

        loadSavedFilters();
    }, []);

    // Sauvegarder les filtres quand ils changent (mais seulement après le chargement initial)
    useEffect(() => {
        const saveFilters = async () => {
            try {
                console.log("Sauvegarde des filtres:", filters);
                await SecureStore.setItemAsync(FILTERS_STORAGE_KEY, JSON.stringify(filters));
            } catch (error) {
                console.error("Erreur lors de la sauvegarde des filtres:", error);
            }
        };

        // Ne sauvegarder que si les filtres ont déjà été chargés (pour éviter d'écraser)
        if (filtersLoaded) {
            saveFilters();
        }
    }, [filters, filtersLoaded]);

    // Mettre à jour la liste des institutions et réappliquer les filtres
    const updateInstitutions = (newInstitutions: Institution[]) => {
        setInstitutions(newInstitutions);

        // Extraire toutes les activités uniques pour les filtres
        const activitiesSet = new Set<string>();
        newInstitutions.forEach((institution: Institution) => {
            if (institution.activites) {
                Object.values(institution.activites).forEach((activity) => {
                    activitiesSet.add(activity);
                });
            }
        });
        setAllActivities(Array.from(activitiesSet).sort());

        // Appliquer les filtres existants aux nouvelles institutions
        applyFilters(newInstitutions, searchText, filters);
    };

    // Appliquer les filtres
    const applyFilters = (institutionsToFilter: Institution[] = institutions, search: string = searchText, filterOptions: FilterOptions = filters) => {
        let result = institutionsToFilter;

        // Filtrer par recherche textuelle
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter((inst) => {
                // Recherche dans le nom de l'institution
                if (inst.inst_name && inst.inst_name.toLowerCase().includes(searchLower)) {
                    return true;
                }

                // Recherche dans les activités
                if (inst.activites) {
                    return Object.values(inst.activites).some((activity) => activity.toLowerCase().includes(searchLower));
                }

                return false;
            });
        }

        // Filtrer par activités
        if (filterOptions.activities.length > 0) {
            result = result.filter((inst) => {
                if (!inst.activites) return false;
                const instActivities = Object.values(inst.activites);
                return filterOptions.activities.some((activity) => instActivities.includes(activity));
            });
        }

        // Filtrer par équipements
        if (filterOptions.equipements.douches || filterOptions.equipements.sanitaires) {
            result = result.filter((inst) => {
                if (!inst.equipements) return false;

                if (filterOptions.equipements.douches && !inst.equipements.douches) {
                    return false;
                }

                if (filterOptions.equipements.sanitaires && !inst.equipements.sanitaires) {
                    return false;
                }

                return true;
            });
        }

        setFilteredInstitutions(result);
    };

    // Gérer le changement de recherche
    const handleSearch = (text: string) => {
        setSearchText(text);
        applyFilters(institutions, text, filters);
    };

    // Gérer le changement de filtres
    const handleFilterChange = (newFilters: FilterOptions) => {
        console.log("Nouveaux filtres appliqués:", newFilters);
        setFilters(newFilters);
        applyFilters(institutions, searchText, newFilters);
    };

    // Réinitialiser tous les filtres
    const resetAllFilters = async () => {
        const emptyFilters = {
            activities: [],
            equipements: {
                douches: false,
                sanitaires: false,
            },
        };

        setSearchText("");
        setFilters(emptyFilters);
        applyFilters(institutions, "", emptyFilters);

        try {
            await SecureStore.deleteItemAsync(FILTERS_STORAGE_KEY);
        } catch (error) {
            console.error("Erreur lors de la réinitialisation des filtres:", error);
        }
    };

    return {
        institutions,
        filteredInstitutions,
        searchText,
        filters,
        allActivities,
        updateInstitutions,
        handleSearch,
        handleFilterChange,
        resetAllFilters,
    };
};
