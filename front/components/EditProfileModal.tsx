import { useTheme } from "@/hooks/useTheme";
import { UserService } from "@/services";
import { UpdateCoachProfile, UpdateInstitutionProfile, User } from "@/types";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import BaseModal from "./BaseModal";

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: User;
    onUserUpdated: (updatedUser: User) => void;
}

export default function EditProfileModal({ visible, onClose, user, onUserUpdated }: EditProfileModalProps) {
    const { currentTheme } = useTheme();
    const [loading, setLoading] = useState(false);

    // Initialiser formData directement avec les données user
    const [formData, setFormData] = useState<UpdateCoachProfile | UpdateInstitutionProfile>(() => {
        if (user.type === "ROLE_COACH") {
            return {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                work: user.work || "",
            };
        } else {
            return {
                inst_name: user.inst_name || "",
                adresse: user.adresse || "",
                ville: user.ville || "",
                coordonnees: user.coordonnees
                    ? {
                          latitude: user.coordonnees.latitude || 0,
                          longitude: user.coordonnees.longitude || 0,
                      }
                    : { latitude: 0, longitude: 0 },
                activites: user.activites || [],
                equipements: user.equipements || [],
            };
        }
    });

    useEffect(() => {
        if (user.type === "ROLE_COACH") {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                work: user.work || "",
            });
        } else {
            setFormData({
                inst_name: user.inst_name || "",
                adresse: user.adresse || "",
                ville: user.ville || "",
                coordonnees: user.coordonnees
                    ? {
                          latitude: user.coordonnees.latitude || 0,
                          longitude: user.coordonnees.longitude || 0,
                      }
                    : { latitude: 0, longitude: 0 },
                activites: user.activites || [],
                equipements: user.equipements || [],
            });
        }
    }, [user]);

    // Réinitialiser les données quand le modal s'ouvre
    useEffect(() => {
        if (visible) {
            if (user.type === "ROLE_COACH") {
                setFormData({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    work: user.work || "",
                });
            } else {
                setFormData({
                    inst_name: user.inst_name || "",
                    adresse: user.adresse || "",
                    ville: user.ville || "",
                    coordonnees: user.coordonnees
                        ? {
                              latitude: user.coordonnees.latitude || 0,
                              longitude: user.coordonnees.longitude || 0,
                          }
                        : { latitude: 0, longitude: 0 },
                    activites: user.activites || [],
                    equipements: user.equipements || [],
                });
            }
        }
    }, [visible, user]);

    const handleSave = async () => {
        try {
            setLoading(true);
            let updatedUser: User;
            if (user.type === "ROLE_COACH") {
                const coachDataWithEmail = {
                    ...(formData as UpdateCoachProfile),
                    email: user.email, // Email obligatoire selon validation Symfony
                };
                updatedUser = await UserService.updateCoachProfile(coachDataWithEmail);
            } else {
                const instDataWithEmail = {
                    ...(formData as UpdateInstitutionProfile),
                    email: user.email, // Email obligatoire selon validation Symfony
                };
                updatedUser = await UserService.updateInstitutionProfile(instDataWithEmail);
            }

            // Vérifier si le type d'utilisateur est préservé
            if (!updatedUser.type && user.type) {
                updatedUser.type = user.type;
            }

            onUserUpdated(updatedUser);
            Alert.alert("Succès", "Profil mis à jour avec succès");
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const styles = getStyles(currentTheme);

    const renderCoachForm = () => {
        const coachData = formData as UpdateCoachProfile;
        return (
            <>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Prénom</Text>
                    <TextInput
                        style={styles.input}
                        value={coachData.firstName || ""}
                        onChangeText={(value) => updateFormData("firstName", value)}
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                        style={styles.input}
                        value={coachData.lastName || ""}
                        onChangeText={(value) => updateFormData("lastName", value)}
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Profession</Text>
                    <TextInput
                        style={styles.input}
                        value={coachData.work || ""}
                        onChangeText={(value) => updateFormData("work", value)}
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>
            </>
        );
    };

    const renderInstitutionForm = () => {
        const instData = formData as UpdateInstitutionProfile;
        return (
            <>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nom de l&apos;établissement</Text>
                    <TextInput
                        style={styles.input}
                        value={instData.inst_name || ""}
                        onChangeText={(value) => updateFormData("inst_name", value)}
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Adresse</Text>
                    <TextInput
                        style={styles.input}
                        value={instData.adresse || ""}
                        onChangeText={(value) => updateFormData("adresse", value)}
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ville</Text>
                    <TextInput
                        style={styles.input}
                        value={instData.ville || ""}
                        onChangeText={(value) => updateFormData("ville", value)}
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Coordonnées</Text>
                    <View style={styles.coordinatesContainer}>
                        <View style={[styles.coordinateInput]}>
                            <Text style={styles.label}>Latitude</Text>
                            <TextInput
                                style={styles.input}
                                value={instData.coordonnees?.latitude?.toString() || ""}
                                onChangeText={(value) =>
                                    updateFormData("coordonnees", {
                                        ...instData.coordonnees,
                                        latitude: parseFloat(value) || 0,
                                    })
                                }
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.coordinateInput]}>
                            <Text style={styles.label}>Longitude</Text>
                            <TextInput
                                style={styles.input}
                                value={instData.coordonnees?.longitude?.toString() || ""}
                                onChangeText={(value) =>
                                    updateFormData("coordonnees", {
                                        ...instData.coordonnees,
                                        longitude: parseFloat(value) || 0,
                                    })
                                }
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Activités</Text>
                    <TextInput
                        style={[styles.input, styles.listInput]}
                        value={instData.activites?.join(", ")}
                        onChangeText={(value) =>
                            updateFormData(
                                "activites",
                                value
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter((item) => item)
                            )
                        }
                        multiline
                        placeholder="Football, Basketball, Tennis..."
                    />
                    <Text style={styles.listHint}>Séparez les activités par des virgules</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Équipements</Text>
                    <TextInput
                        style={[styles.input, styles.listInput]}
                        value={instData.equipements?.join(", ")}
                        onChangeText={(value) =>
                            updateFormData(
                                "equipements",
                                value
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter((item) => item)
                            )
                        }
                        multiline
                        placeholder="Terrain de football, Gymnase, Court de tennis..."
                    />
                    <Text style={styles.listHint}>Séparez les équipements par des virgules</Text>
                </View>
            </>
        );
    };

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title="Modifier le profil"
            size="large"
            scrollable={true}
            primaryButton={{
                text: "Enregistrer",
                onPress: handleSave,
                loading: loading,
            }}
            secondaryButton={{
                text: "Annuler",
                onPress: onClose,
                disabled: loading,
            }}
        >
            {user.type === "ROLE_COACH" ? renderCoachForm() : renderInstitutionForm()}
        </BaseModal>
    );
}

const getStyles = (currentTheme: any) => ({
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: currentTheme.text,
        marginBottom: 5,
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
    coordinatesContainer: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
    },
    coordinateInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    listInput: {
        minHeight: 60,
        textAlignVertical: "top" as const,
    },
    listHint: {
        fontSize: 12,
        color: currentTheme.text,
        opacity: 0.7,
        marginTop: 2,
    },
});
