import { Institution } from "../../types";
import { ApiClient } from "../api/ApiClient";

export interface InstitutionFilters {
    activity?: string;
    search?: string;
    location?: {
        latitude: number;
        longitude: number;
        radius?: number;
    };
}

export class InstitutionService {
    static async getAllInstitutions(filters?: InstitutionFilters): Promise<Institution[]> {
        let endpoint = "/institutions";
        const params = new URLSearchParams();

        if (filters?.activity) {
            params.append("activity", filters.activity);
        }
        if (filters?.search) {
            params.append("search", filters.search);
        }
        if (filters?.location) {
            params.append("lat", filters.location.latitude.toString());
            params.append("lng", filters.location.longitude.toString());
            if (filters.location.radius) {
                params.append("radius", filters.location.radius.toString());
            }
        }

        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }

        return ApiClient.get<Institution[]>(endpoint);
    }

    static async getInstitutionById(id: string): Promise<Institution> {
        return ApiClient.get<Institution>(`/institutions/${id}`);
    }

    static async getInstitutionByNumero(instNumero: string): Promise<Institution> {
        const institutions = await this.getAllInstitutions();
        const institution = institutions.find((inst) => inst.inst_numero === instNumero);

        if (!institution) {
            throw new Error(`Institution avec le numéro ${instNumero} introuvable`);
        }

        return institution;
    }

    static async getOpenDataInstitutions(): Promise<Institution[]> {
        return ApiClient.get<Institution[]>("/opendata/institutions", false);
    }

    static async searchInstitutions(query: string): Promise<Institution[]> {
        return this.getAllInstitutions({ search: query });
    }

    static async getInstitutionsByActivity(activity: string): Promise<Institution[]> {
        return this.getAllInstitutions({ activity });
    }

    static async getNearbyInstitutions(
        latitude: number,
        longitude: number,
        radius: number = 10
    ): Promise<Institution[]> {
        return this.getAllInstitutions({
            location: { latitude, longitude, radius },
        });
    }
}
