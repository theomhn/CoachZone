import { Place } from "../../types";
import { ApiClient } from "../api/ApiClient";

export interface PlaceUpdateData {
    price?: number | null;
    [key: string]: any;
}

export interface PriceStatusResult {
    hasConfiguredPrices: boolean;
    placesWithoutPrice: number;
    totalPlaces: number;
    unconfiguredPlaces: Place[];
}

export class PlaceService {
    static async getPlacesByInstitution(instNumero: string): Promise<Place[]> {
        return ApiClient.get<Place[]>(`/places?inst_numero=${instNumero}`);
    }

    static async getPlaceById(placeId: string): Promise<Place> {
        return ApiClient.get<Place>(`/places/${placeId}`);
    }

    static async updatePlace(placeId: string, data: PlaceUpdateData): Promise<Place> {
        return ApiClient.patch<Place>(`/places/${placeId}`, data);
    }

    static async checkPriceStatus(instNumero: string): Promise<PriceStatusResult> {
        const places = await this.getPlacesByInstitution(instNumero);
        const unconfiguredPlaces = places.filter((place) => place.price === null || place.price === undefined);

        return {
            hasConfiguredPrices: unconfiguredPlaces.length === 0 || places.length === 0,
            placesWithoutPrice: unconfiguredPlaces.length,
            totalPlaces: places.length,
            unconfiguredPlaces,
        };
    }

    static async getAllPlaces(): Promise<Place[]> {
        return ApiClient.get<Place[]>("/places");
    }

    static async getPlaceFromUrl(url: string): Promise<Place> {
        const cleanUrl = url.replace("/api", "");
        return ApiClient.get<Place>(cleanUrl);
    }
}
