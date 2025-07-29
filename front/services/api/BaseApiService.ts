import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../../config";
import { AuthHeaders, RequestConfig } from "./types";

export class BaseApiService {
    protected static baseUrl = API_BASE_URL;

    protected static async getAuthHeaders(): Promise<AuthHeaders> {
        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new ApiError("Token d'authentification manquant", 401);
        }

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    protected static async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const { method = "GET", headers = {}, body, requireAuth = true } = config;

        try {
            let requestHeaders: HeadersInit = {
                "Content-Type": "application/json",
                ...headers,
            };

            if (requireAuth) {
                const authHeaders = await this.getAuthHeaders();
                requestHeaders = { ...requestHeaders, ...authHeaders };
            }

            const url = `${this.baseUrl}${endpoint}`;
            
            const response = await fetch(url, {
                method,
                headers: requestHeaders,
                body,
            });
            

            return await this.handleResponse<T>(response);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError("Erreur réseau lors de la requête", 0, error);
        }
    }

    private static async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get("content-type");
        const hasJsonContent = contentType?.includes("application/json");

        if (!response.ok) {
            let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;

            if (hasJsonContent) {
                try {
                    const errorData = await response.json();
                    
                    // Gestion spéciale des erreurs de validation avec tableau 'errors'
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorMessage = errorData.errors.join("\n");
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                    
                    // Si erreur 403 et pas d'erreurs de validation, nettoyer l'authentification
                    if (response.status === 403 && !(errorData.errors && Array.isArray(errorData.errors))) {
                        try {
                            const SecureStore = require("expo-secure-store");
                            await SecureStore.deleteItemAsync("userToken");
                            global.user = null;
                        } catch (cleanupError) {
                            // Erreur silencieuse lors du nettoyage
                        }
                    }
                    
                    throw new ApiError(errorMessage, response.status, errorData);
                } catch (parseError) {
                    if (parseError instanceof ApiError) {
                        throw parseError;
                    }
                }
            }

            // Si erreur 403 sans contenu JSON, nettoyer l'authentification
            if (response.status === 403) {
                try {
                    const SecureStore = require("expo-secure-store");
                    await SecureStore.deleteItemAsync("userToken");
                    global.user = null;
                } catch (cleanupError) {
                    // Erreur silencieuse lors du nettoyage
                }
            }

            throw new ApiError(errorMessage, response.status);
        }

        if (hasJsonContent) {
            return await response.json();
        }

        const text = await response.text();
        if (!text || text.trim() === "") {
            return {} as T;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text as T;
        }
    }

    protected static async get<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
        return this.request<T>(endpoint, { method: "GET", requireAuth });
    }

    protected static async post<T = any>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
            requireAuth,
        });
    }

    protected static async put<T = any>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
            requireAuth,
        });
    }

    protected static async patch<T = any>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: JSON.stringify(data),
            requireAuth,
        });
    }

    protected static async delete<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE", requireAuth });
    }
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}
