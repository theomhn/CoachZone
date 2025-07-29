import { useTheme } from "@/hooks/useTheme";
import { UserService } from "@/services";
import { EmailChangeStatus } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import BaseModal from "./BaseModal";

interface EmailChangeModalProps {
    visible: boolean;
    onClose: () => void;
    currentEmail: string;
    onEmailChanged: () => Promise<void>;
}

export default function EmailChangeModal({ visible, onClose, currentEmail, onEmailChanged }: EmailChangeModalProps) {
    const { currentTheme } = useTheme();
    const [step, setStep] = useState<"request" | "confirm">("request");
    const [newEmail, setNewEmail] = useState("");
    const [confirmationCode, setConfirmationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState<EmailChangeStatus | null>(null);

    const checkEmailChangeStatus = useCallback(async () => {
        try {
            const status = await UserService.getEmailChangeStatus();
            setEmailStatus(status);

            if (status.pendingEmail) {
                setNewEmail(status.pendingEmail);
                setStep("confirm");
            } else {
                setStep("request");
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du statut:", error);
            // En cas d'erreur, on permet quand même l'accès au changement d'email
            const fallbackStatus = {
                canInitiateChange: true,
                currentEmail: currentEmail,
                message: "Changement d'email disponible",
            };
            setEmailStatus(fallbackStatus);
            setStep("request");
        }
    }, [currentEmail]);

    useEffect(() => {
        if (visible) {
            checkEmailChangeStatus();
        }
    }, [visible, checkEmailChangeStatus]);

    const handleRequestChange = async () => {
        if (!newEmail || newEmail === currentEmail) {
            Alert.alert("Erreur", "Veuillez saisir une nouvelle adresse email différente");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            Alert.alert("Erreur", "Veuillez saisir une adresse email valide");
            return;
        }

        try {
            setLoading(true);
            await UserService.requestEmailChange({ newEmail });
            Alert.alert(
                "Code envoyé",
                `Un code de confirmation a été envoyé à votre adresse email actuelle (${currentEmail}) pour des raisons de sécurité.`,
                [{ text: "OK", onPress: () => setStep("confirm") }]
            );
        } catch (error) {
            console.error("Erreur lors de la demande de changement:", error);
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de la demande";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmChange = async () => {
        if (!confirmationCode || confirmationCode.length !== 6) {
            Alert.alert("Erreur", "Veuillez saisir un code de confirmation valide (6 chiffres)");
            return;
        }

        try {
            setLoading(true);
            await UserService.confirmEmailChange({ code: confirmationCode });
            Alert.alert("Succès", "Votre adresse email a été modifiée avec succès", [
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            await onEmailChanged();
                        } catch (error) {
                            console.error("Erreur lors de la mise à jour des données:", error);
                        }
                        onClose();
                    },
                },
            ]);
        } catch (error) {
            Alert.alert("Erreur", error instanceof Error ? error.message : "Code de confirmation invalide");
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setStep("request");
        setNewEmail("");
        setConfirmationCode("");
        setEmailStatus(null);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const styles = getStyles(currentTheme);

    const renderRequestStep = () => (
        <>
            <View style={styles.currentEmailContainer}>
                <Text style={styles.currentEmailLabel}>Adresse email actuelle</Text>
                <Text style={styles.currentEmailText}>{currentEmail}</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouvelle adresse email</Text>
                <TextInput
                    style={styles.input}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    placeholder="nouvelle@exemple.com"
                    placeholderTextColor={currentTheme.placeholder}
                />
            </View>

            {emailStatus && !emailStatus.canInitiateChange && (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{emailStatus.message}</Text>
                </View>
            )}
        </>
    );

    const renderConfirmStep = () => (
        <>
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Code de confirmation envoyé à votre adresse actuelle{"\n"}
                    <Text style={{ fontWeight: "bold" }}>{currentEmail}</Text>
                    {"\n\n"}
                    Nouvelle adresse : <Text style={{ fontWeight: "bold" }}>{newEmail}</Text>
                </Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Code de confirmation</Text>
                <TextInput
                    style={[styles.input, styles.codeInput]}
                    value={confirmationCode}
                    onChangeText={setConfirmationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="123456"
                    placeholderTextColor={currentTheme.placeholder}
                />
                <Text style={styles.hint}>Saisissez le code à 6 chiffres reçu sur votre adresse email actuelle</Text>
            </View>

            <View>
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        { padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
                    ]}
                    onPress={() => setStep("request")}
                    disabled={loading}
                >
                    <Text style={styles.backButtonText}>Retour</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <BaseModal
            visible={visible}
            onClose={handleClose}
            title="Changer d'email"
            size="large"
            scrollable={true}
            primaryButton={
                step === "request"
                    ? {
                          text: "Envoyer le code",
                          onPress: handleRequestChange,
                          loading: loading,
                          disabled: emailStatus ? !emailStatus.canInitiateChange : false,
                      }
                    : {
                          text: "Confirmer",
                          onPress: handleConfirmChange,
                          loading: loading,
                      }
            }
            secondaryButton={{
                text: "Annuler",
                onPress: handleClose,
                disabled: loading,
            }}
        >
            {step === "request" ? renderRequestStep() : renderConfirmStep()}
        </BaseModal>
    );
}

const getStyles = (currentTheme: any) => ({
    currentEmailContainer: {
        backgroundColor: currentTheme.border,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    currentEmailLabel: {
        fontSize: 12,
        color: currentTheme.text,
        opacity: 0.7,
        marginBottom: 4,
    },
    currentEmailText: {
        fontSize: 16,
        color: currentTheme.text,
        fontWeight: "500" as const,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
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
    codeInput: {
        textAlign: "center" as const,
        fontSize: 24,
        fontWeight: "bold" as const,
        letterSpacing: 2,
    },
    hint: {
        fontSize: 12,
        color: currentTheme.text,
        opacity: 0.7,
        marginTop: 8,
        textAlign: "center" as const,
    },
    statusContainer: {
        backgroundColor: currentTheme.lightBackground || currentTheme.border,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: currentTheme.primary,
    },
    statusText: {
        fontSize: 14,
        color: currentTheme.primary,
        textAlign: "center" as const,
    },
    backButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: currentTheme.border,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: currentTheme.text,
    },
});
