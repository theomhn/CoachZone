import { useTheme } from "@/hooks/useTheme";
import { UserService } from "@/services/userService";
import { PasswordChangeRequest } from "@/types";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import BaseModal from "./BaseModal";

interface PasswordChangeModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function PasswordChangeModal({ visible, onClose }: PasswordChangeModalProps) {
    const { currentTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PasswordChangeRequest>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const styles = getStyles(currentTheme);

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
            console.error("Erreur lors du changement de mot de passe:", error);
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
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe actuel</Text>
                <TextInput
                    style={styles.input}
                    value={formData.currentPassword}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, currentPassword: text }))}
                    secureTextEntry
                    placeholder="Votre mot de passe actuel"
                    placeholderTextColor={currentTheme.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <TextInput
                    style={styles.input}
                    value={formData.newPassword}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, newPassword: text }))}
                    secureTextEntry
                    placeholder="Votre nouveau mot de passe (min. 6 caractères)"
                    placeholderTextColor={currentTheme.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, confirmPassword: text }))}
                    secureTextEntry
                    placeholder="Confirmez votre nouveau mot de passe"
                    placeholderTextColor={currentTheme.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
        </BaseModal>
    );
}

const getStyles = (currentTheme: any) => ({
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: currentTheme.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: currentTheme.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: currentTheme.text,
        backgroundColor: currentTheme.background,
    },
});
