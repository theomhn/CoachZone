import { Booking } from "../../types";
import { ApiClient } from "../api/ApiClient";
import { ApiError } from "../api/BaseApiService";

export interface CreateBookingRequest {
    placeId: string;
    date: string;
    startTime: string;
    endTime: string;
    price?: number;
    numberOfPeople?: number;
    notes?: string;
}

export interface BookingApiRequest {
    dateStart: string;
    dateEnd: string;
    price: number;
    place: string;
    coach: string;
}

export interface BookingFilters {
    status?: "confirmed" | "pending" | "cancelled";
    dateFrom?: string;
    dateTo?: string;
    placeId?: string;
}

export class BookingService {
    static async createBooking(data: CreateBookingRequest): Promise<Booking> {
        console.log("📝 Création de réservation - données reçues:", JSON.stringify(data, null, 2));
        
        // Récupérer l'utilisateur connecté
        const currentUser = global.user;
        if (!currentUser || currentUser.type !== "ROLE_COACH") {
            throw new ApiError("Vous devez être connecté en tant que coach", 403);
        }

        // Convertir au format attendu par l'API backend
        const apiData: BookingApiRequest = {
            dateStart: `${data.date}T${data.startTime}`,
            dateEnd: `${data.date}T${data.endTime}`,
            price: data.price || 25, // Utiliser le prix fourni ou prix par défaut
            place: `/api/places/${data.placeId}`,
            coach: `/api/users/${currentUser.id}`
        };

        console.log("📝 Données converties pour l'API:", JSON.stringify(apiData, null, 2));
        
        try {
            const result = await ApiClient.post<Booking>("/bookings", apiData);
            console.log("✅ Réservation créée avec succès:", result);
            return result;
        } catch (error) {
            console.log("❌ Erreur lors de la création de réservation:", error);
            if (error instanceof ApiError) {
                console.log("📊 Détails de l'erreur API:", {
                    status: error.status,
                    message: error.message
                });
            }
            throw error;
        }
    }

    static async getMyBookings(filters?: BookingFilters): Promise<Booking[]> {
        let endpoint = "/bookings";
        const params = new URLSearchParams();

        if (filters?.status) {
            params.append("status", filters.status);
        }
        if (filters?.dateFrom) {
            params.append("dateFrom", filters.dateFrom);
        }
        if (filters?.dateTo) {
            params.append("dateTo", filters.dateTo);
        }
        if (filters?.placeId) {
            params.append("placeId", filters.placeId);
        }

        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }

        return ApiClient.get<Booking[]>(endpoint);
    }

    static async getBookingById(bookingId: string | number): Promise<Booking> {
        return ApiClient.get<Booking>(`/bookings/${bookingId}`);
    }

    static async cancelBooking(bookingId: string | number): Promise<{ message: string }> {
        try {
            // Utiliser DELETE pour l'annulation (méthode principale)
            return await ApiClient.delete<{ message: string }>(`/bookings/${bookingId}`);
        } catch (error) {
            // Si DELETE échoue avec 404, fallback vers PATCH avec status=cancelled
            if (error instanceof ApiError && error.status === 404) {
                return await ApiClient.patch<{ message: string }>(`/bookings/${bookingId}`, {
                    status: 'cancelled'
                });
            }
            throw error;
        }
    }

    static async updateBooking(bookingId: string | number, data: Partial<CreateBookingRequest>): Promise<Booking> {
        return ApiClient.patch<Booking>(`/bookings/${bookingId}`, data);
    }

    static async getBookingsByPlace(placeId: string): Promise<Booking[]> {
        return ApiClient.get<Booking[]>(`/places/${placeId}/bookings`);
    }

    static async getInstitutionBookings(instNumero: string): Promise<Booking[]> {
        return ApiClient.get<Booking[]>(`/institutions/${instNumero}/bookings`);
    }

    static async confirmBooking(bookingId: string | number): Promise<Booking> {
        return ApiClient.patch<Booking>(`/bookings/${bookingId}/confirm`, {});
    }

    static async rejectBooking(bookingId: string | number, reason?: string): Promise<Booking> {
        return ApiClient.patch<Booking>(`/bookings/${bookingId}/reject`, { reason });
    }
}
