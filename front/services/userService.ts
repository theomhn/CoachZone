import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config";
import {
    EmailChangeConfirm,
    EmailChangeRequest,
    EmailChangeStatus,
    PasswordChangeRequest,
    UpdateCoachProfile,
    UpdateInstitutionProfile,
    User,
} from "../types";

/**
 * Service pour la gestion des profils utilisateur
 */
export class UserService {
    private static async getAuthHeaders(): Promise<HeadersInit> {
        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new Error("Token d'authentification manquant");
        }

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    /**
     * Met à jour les informations du profil utilisateur
     */
    static async updateProfile(profileData: UpdateCoachProfile | UpdateInstitutionProfile): Promise<User> {
        try {
            console.log("=== SERVICE UPDATE PROFILE ===");
            console.log("URL cible:", `${API_BASE_URL}/users/me/update`);
            console.log("Données à envoyer:", JSON.stringify(profileData, null, 2));

            const headers = await this.getAuthHeaders();
            console.log("Headers préparés:", headers);

            console.log("Envoi de la requête PATCH...");
            const response = await fetch(`${API_BASE_URL}/users/me/update`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(profileData),
            });

            console.log("Réponse reçue - Status:", response.status);
            console.log("Réponse reçue - StatusText:", response.statusText);
            console.log("Réponse reçue - Headers:", Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.log("Erreur HTTP - Tentative de lecture du body...");
                try {
                    const errorData = await response.json();
                    console.log("Données d'erreur:", errorData);
                    throw new Error(errorData.message || "Erreur lors de la mise à jour du profil");
                } catch (parseError) {
                    console.log("Impossible de parser l'erreur JSON:", parseError);
                    const textError = await response.text();
                    console.log("Erreur en text:", textError);
                    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
                }
            }

            console.log("Lecture de la réponse JSON...");
            const result = await response.json();
            console.log("Données utilisateur reçues:", JSON.stringify(result, null, 2));
            console.log("=== FIN SERVICE UPDATE PROFILE ===");

            return result;
        } catch (error) {
            console.log("=== ERREUR SERVICE UPDATE PROFILE ===");
            console.error("Erreur capturée:", error);
            if (error instanceof Error) {
                console.error("Message:", error.message);
                console.error("Stack:", error.stack);
                throw error;
            }
            throw new Error("Erreur réseau lors de la mise à jour du profil");
        }
    }

    /**
     * Met à jour le profil d'un coach
     */
    static async updateCoachProfile(profileData: UpdateCoachProfile): Promise<User> {
        return this.updateProfile(profileData);
    }

    /**
     * Met à jour le profil d'une institution
     */
    static async updateInstitutionProfile(profileData: UpdateInstitutionProfile): Promise<User> {
        return this.updateProfile(profileData);
    }

    /**
     * Initie une demande de changement d'email
     */
    static async requestEmailChange(emailData: EmailChangeRequest): Promise<{ message: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/users/me/email/request-change`, {
                method: "POST",
                headers,
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                let errorMessage = "Erreur lors de la demande de changement d'email";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // Si l'endpoint n'existe pas encore
                    if (response.status === 404) {
                        throw new Error("Cette fonctionnalité n'est pas encore disponible sur le serveur");
                    }
                }
                throw new Error(errorMessage);
            }

            const text = await response.text();
            if (!text || text.trim() === "") {
                return { message: "Demande de changement d'email envoyée" };
            }

            try {
                return JSON.parse(text);
            } catch {
                return { message: "Demande de changement d'email envoyée" };
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur réseau lors de la demande de changement d'email");
        }
    }

    /**
     * Confirme le changement d'email avec le code reçu
     */
    static async confirmEmailChange(confirmData: EmailChangeConfirm): Promise<{ message: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/users/me/email/confirm-change`, {
                method: "POST",
                headers,
                body: JSON.stringify(confirmData),
            });

            if (!response.ok) {
                let errorMessage = "Erreur lors de la confirmation du changement d'email";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    if (response.status === 404) {
                        throw new Error("Cette fonctionnalité n'est pas encore disponible sur le serveur");
                    }
                }
                throw new Error(errorMessage);
            }

            const text = await response.text();
            if (!text || text.trim() === "") {
                return { message: "Email modifié avec succès" };
            }

            try {
                return JSON.parse(text);
            } catch {
                return { message: "Email modifié avec succès" };
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur réseau lors de la confirmation du changement d'email");
        }
    }

    /**
     * Vérifie le statut du changement d'email
     */
    static async getEmailChangeStatus(): Promise<EmailChangeStatus> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/users/me/email/status`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                // Si l'endpoint n'existe pas encore, on retourne un statut par défaut
                if (response.status === 404) {
                    return {
                        canInitiateChange: true,
                        currentEmail: "unknown@email.com",
                        message: "Changement d'email disponible",
                    };
                }

                let errorMessage = "Erreur lors de la vérification du statut";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // Ignore les erreurs de parsing JSON pour les erreurs
                }
                throw new Error(errorMessage);
            }

            // Vérifier si la réponse a du contenu
            const text = await response.text();
            if (!text || text.trim() === "") {
                // Réponse vide, on retourne un statut par défaut
                return {
                    canInitiateChange: true,
                    currentEmail: "unknown@email.com",
                    message: "Changement d'email disponible",
                };
            }

            try {
                return JSON.parse(text);
            } catch {
                // Si le parsing JSON échoue, on retourne un statut par défaut
                return {
                    canInitiateChange: true,
                    currentEmail: "unknown@email.com",
                    message: "Changement d'email disponible",
                };
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur réseau lors de la vérification du statut");
        }
    }

    /**
     * Récupère les informations du profil utilisateur actuel
     */
    static async getCurrentUser(): Promise<User> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de la récupération du profil");
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur réseau lors de la récupération du profil");
        }
    }

    /**
     * Change le mot de passe de l'utilisateur
     */
    static async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/users/me/password/change`, {
                method: "POST",
                headers,
                body: JSON.stringify(passwordData),
            });

            if (!response.ok) {
                let errorMessage = "Erreur lors du changement de mot de passe";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    if (response.status === 404) {
                        throw new Error("Cette fonctionnalité n'est pas encore disponible sur le serveur");
                    }
                }
                throw new Error(errorMessage);
            }

            const text = await response.text();
            if (!text || text.trim() === "") {
                return { message: "Mot de passe modifié avec succès" };
            }

            try {
                return JSON.parse(text);
            } catch {
                return { message: "Mot de passe modifié avec succès" };
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur réseau lors du changement de mot de passe");
        }
    }
}
