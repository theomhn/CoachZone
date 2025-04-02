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
