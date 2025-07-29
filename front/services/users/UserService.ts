import {
    EmailChangeConfirm,
    EmailChangeRequest,
    EmailChangeStatus,
    PasswordChangeRequest,
    UpdateCoachProfile,
    UpdateInstitutionProfile,
    User,
} from "../../types";
import { ApiClient } from "../api/ApiClient";

export class UserService {
    /**
     * Récupère les informations du profil utilisateur actuel
     */
    static async getCurrentUser(): Promise<User> {
        return ApiClient.get<User>("/users/me");
    }

    /**
     * Met à jour les informations du profil utilisateur
     */
    static async updateProfile(profileData: UpdateCoachProfile | UpdateInstitutionProfile): Promise<User> {
        return ApiClient.patch<User>("/users/me/update", profileData);
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
     * Change le mot de passe de l'utilisateur
     */
    static async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
        return ApiClient.post<{ message: string }>("/users/me/password/change", passwordData);
    }

    /**
     * Initie une demande de changement d'email
     */
    static async requestEmailChange(emailData: EmailChangeRequest): Promise<{ message: string }> {
        return ApiClient.post<{ message: string }>("/users/me/email/request-change", emailData);
    }

    /**
     * Confirme le changement d'email avec le code reçu
     */
    static async confirmEmailChange(confirmData: EmailChangeConfirm): Promise<{ message: string }> {
        return ApiClient.post<{ message: string }>("/users/me/email/confirm-change", confirmData);
    }

    /**
     * Vérifie le statut du changement d'email
     */
    static async getEmailChangeStatus(): Promise<EmailChangeStatus> {
        try {
            return await ApiClient.get<EmailChangeStatus>("/users/me/email/status");
        } catch (error) {
            // Si l'endpoint n'existe pas encore, on retourne un statut par défaut
            return {
                canInitiateChange: true,
                currentEmail: "unknown@email.com",
                message: "Changement d'email disponible",
            };
        }
    }
}
