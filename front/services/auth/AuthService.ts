import * as SecureStore from "expo-secure-store";
import { User } from "../../types";
import { ApiClient } from "../api/ApiClient";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    type: "ROLE_COACH" | "ROLE_INSTITUTION";
    inst_numero?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export class AuthService {
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await ApiClient.post<any>("/login", credentials, false);
        
        // L'API retourne directement le token comme string
        if (typeof response === 'string') {
            await SecureStore.setItemAsync("userToken", response);
            return { access_token: response, user: null as any };
        }
        
        // Si c'est un objet avec access_token (pour compatibilité future)
        if (response.access_token) {
            await SecureStore.setItemAsync("userToken", response.access_token);
        }

        return response;
    }

    static async register(data: RegisterRequest): Promise<User> {
        return ApiClient.post<User>("/register", data, false);
    }

    static async logout(): Promise<void> {
        try {
            await ApiClient.post("/logout");
        } catch (error) {
            console.warn("Erreur lors de la déconnexion côté serveur:", error);
        } finally {
            await SecureStore.deleteItemAsync("userToken");
        }
    }

    static async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
        return ApiClient.post<{ message: string }>("/password/forgot", data, false);
    }

    static async getCurrentUser(): Promise<User> {
        return ApiClient.get<User>("/users/me");
    }

    static async isAuthenticated(): Promise<boolean> {
        try {
            const token = await SecureStore.getItemAsync("userToken");
            return !!token;
        } catch {
            return false;
        }
    }

    static async getToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync("userToken");
        } catch {
            return null;
        }
    }

    static async clearToken(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync("userToken");
        } catch (error) {
            console.warn("Erreur lors de la suppression du token:", error);
        }
    }
}
