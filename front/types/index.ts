import { ThemeType } from "@/contexts/ThemeContext";

/**
 * Interface représentant une institution sportive
 */
export interface Institution {
    inst_numero: string;
    inst_name: string;
    adresse: string;
    activites: {
        [key: string]: string;
    };
    equipements: {
        douches: boolean;
        sanitaires: boolean;
    };
    coordonnees: {
        lat: number;
        lon: number;
    };
}

/**
 * Type pour les données d'utilisateur
 */
export interface User {
    id: string;
    email: string;
    type: "coach" | "institution";
    firstName?: string;
    lastName?: string;
    work?: string;
    name?: string;
    inst_numero?: string;
    inst_name?: string;
}

/**
 * Type pour les Institution pour la page d'inscription
 */
export interface InstitutionRegister {
    id: string;
    name: string;
}

/**
 * Types d'erreurs API
 */
export interface ApiError {
    message: string;
    code?: number;
}

/**
 * Interface pour les places (équipements spécifiques)
 */
export interface Place {
    id: string;
    inst_numero: string;
    inst_name: string;
    data: {
        aca_nom: string;
        dep_nom: string;
        equip_x: number;
        equip_y: number;
        equip_nom: string; // Nom de l'équipement
        equip_aps_nom: string[]; // Activités sportives
        equip_surf: number; // Surface de l'équipement
        inst_cp: number;
        lib_bdv: string;
        reg_nom: string;
    };
    price?: number | null;
    lastUpdate: string;
}

/**
 * Type pour les réservations
 */
export interface Booking {
    id: number;
    dateStart: string;
    dateEnd: string;
    price: number;
    place: string;
    coach: string;
    coachFullName: string;
    placeEquipmentName: string;
    institutionNumero: string;
}

/**
 * Type pour les cartes d'institutions
 */
export interface InstitutionCardProps {
    item: Institution;
    onPress?: () => void;
    onClose?: () => void;
    onViewDetails?: () => void;
    variant?: "card" | "popup";
    showActivities?: boolean;
    showDetailsButton?: boolean;
}

/**
 * Type pour les Badge
 */
export interface BadgeProps {
    text: string;
    color?: string;
    backgroundColor?: string;
}

/**
 * Type pour les filtres
 */
export interface FilterOptions {
    activities: string[];
    equipements: {
        douches: boolean;
        sanitaires: boolean;
    };
}

/**
 * Type pour la barre de recherche
 */
export interface SearchFilterBarProps {
    onSearch: (text: string) => void;
    onFilterChange: (filters: FilterOptions) => void;
    activities: string[];
    currentFilters: FilterOptions;
    searchText: string;
}

/**
 * Interface pour les valeurs du contexte
 */
export interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    currentTheme: {
        /* border: string;
        primary: string;
        icon: string;
        tabIconDefault: string;
        text: string;
        background: string;
        tint: string;
        tabIconSelected: string; */
        [key: string]: string;
    };
}

/**
 * Interface pour le selecteur de thème
 */
export interface ThemeSelectorProps {
    isVisible: boolean;
    onClose: () => void;
}

/**
 * Interface pour le bouton favoris
 */
export interface FavoriteButtonProps {
    instNumero: string;
    size?: number;
    onFavoriteChange?: (isFavorite: boolean) => void; // Callback optionnel pour notifier le parent
    style?: any;
}
