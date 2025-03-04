/**
 * Interface représentant une installation sportive
 */
export interface Place {
    id: string;
    data: {
        inst_nom: string;
        inst_adresse: string;
        inst_cp: number;
        lib_bdv: string;
        equip_nom: string;
        equip_aps_nom: string[];
        equip_douche: boolean;
        equip_sanit: boolean;
        equip_surf: number;
        equip_nature: string;
        coordonnees: {
            lat: number;
            lon: number;
        };
    };
    lastUpdate: string;
}

/**
 * Type pour les données d'utilisateur (à compléter selon votre modèle)
 */
export interface User {
    id: string;
    email: string;
    type: "coach" | "institution";
    firstName?: string;
    lastName?: string;
    work?: string;
    name?: string;
}

/**
 * Types d'erreurs API
 */
export interface ApiError {
    message: string;
    code?: number;
}
