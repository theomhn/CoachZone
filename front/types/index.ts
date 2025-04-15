/**
 * Interface représentant une institution sportive
 */
export interface Institution {
    inst_numero: string;
    inst_name: string;
    adresse: string;
    activites: string[];
    surface_totale: number;
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
