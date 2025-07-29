import { UserService } from "@/services";
import { PasswordChangeRequest } from "@/types";
import React, { useState } from "react";
import { Alert } from "react-native";
import BaseModal from "./BaseModal";
import FormInput from "./ui/FormInput";

interface PasswordChangeModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function PasswordChangeModal({ visible, onClose }: PasswordChangeModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PasswordChangeRequest>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handlePasswordChange = async () => {
        if (!formData.currentPassword) {
            Alert.alert("Erreur", "Veuillez saisir votre mot de passe actuel");
            return;
        }

        if (!formData.newPassword) {
            Alert.alert("Erreur", "Veuillez saisir votre nouveau mot de passe");
            return;
        }

        if (formData.newPassword.length < 6) {
            Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            Alert.alert("Erreur", "La confirmation du mot de passe ne correspond pas");
            return;
        }

        try {
            setLoading(true);
            const response = await UserService.changePassword(formData);
            Alert.alert("Succès", response.message || "Mot de passe modifié avec succès");
            handleClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur lors du changement de mot de passe";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        onClose();
    };

    const isFormValid = formData.currentPassword && formData.newPassword && formData.confirmPassword;

    return (
        <BaseModal
            visible={visible}
            onClose={handleClose}
            title="Changer le mot de passe"
            size="large"
            scrollable={true}
            animationType="fade"
            primaryButton={{
                text: "Modifier",
                onPress: handlePasswordChange,
                loading: loading,
                disabled: !isFormValid,
            }}
            secondaryButton={{
                text: "Annuler",
                onPress: handleClose,
                disabled: loading,
            }}
        >
            <FormInput
                label="Mot de passe actuel"
                value={formData.currentPassword}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, currentPassword: text }))}
                secureTextEntry
                placeholder="Votre mot de passe actuel"
                autoCapitalize="none"
                autoCorrect={false}
                required
            />

            <FormInput
                label="Nouveau mot de passe"
                value={formData.newPassword}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, newPassword: text }))}
                secureTextEntry
                placeholder="Votre nouveau mot de passe (min. 6 caractères)"
                autoCapitalize="none"
                autoCorrect={false}
                required
            />

            <FormInput
                label="Confirmer le nouveau mot de passe"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, confirmPassword: text }))}
                secureTextEntry
                placeholder="Confirmez votre nouveau mot de passe"
                autoCapitalize="none"
                autoCorrect={false}
                required
            />
        </BaseModal>
    );
}
