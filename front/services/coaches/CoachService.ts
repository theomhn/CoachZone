import { Institution } from "../../types";
import { ApiClient } from "../api/ApiClient";

export interface FavoriteInstitution {
    id: number;
    inst_numero: string;
    inst_name: string;
    adresse: string;
    ville: string;
    coordonnees: {
        lat: number;
        lon: number;
    };
    activites: {
        [key: string]: string;
    };
    equipements: {
        douches: boolean;
        sanitaires: boolean;
    };
}

export class CoachService {
    private static favoritesCache: FavoriteInstitution[] | null = null;
    private static cacheTimestamp: number = 0;
    private static CACHE_DURATION = 30000; // 30 secondes

    static async getFavorites(): Promise<FavoriteInstitution[]> {
        const now = Date.now();
        
        // Utiliser le cache s'il est récent
        if (this.favoritesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            return this.favoritesCache;
        }

        // Récupérer depuis l'API et mettre en cache
        const response = await ApiClient.get<{ favoriteInstitutions: FavoriteInstitution[] }>("/coaches/me/favorites/");
        this.favoritesCache = response.favoriteInstitutions || [];
        this.cacheTimestamp = now;
        
        return this.favoritesCache;
    }

    static async addToFavorites(instNumero: string): Promise<FavoriteInstitution> {
        const result = await ApiClient.post<FavoriteInstitution>(`/coaches/me/favorites/${instNumero}`, {});
        // Invalider le cache
        this.favoritesCache = null;
        return result;
    }

    static async removeFromFavorites(instNumero: string): Promise<{ message: string }> {
        const result = await ApiClient.delete<{ message: string }>(`/coaches/me/favorites/${instNumero}`);
        // Invalider le cache
        this.favoritesCache = null;
        return result;
    }

    static async isFavorite(instNumero: string): Promise<boolean> {
        try {
            const favorites = await this.getFavorites();
            return favorites.some(fav => fav.inst_numero === instNumero);
        } catch {
            return false;
        }
    }

    static async toggleFavorite(instNumero: string): Promise<boolean> {
        const isFav = await this.isFavorite(instNumero);

        if (isFav) {
            await this.removeFromFavorites(instNumero);
            return false;
        } else {
            await this.addToFavorites(instNumero);
            return true;
        }
    }

    static async getCoachProfile(): Promise<any> {
        return ApiClient.get("/coaches/me/profile");
    }

    static async updateCoachProfile(data: any): Promise<any> {
        return ApiClient.patch("/coaches/me/profile", data);
    }
}
