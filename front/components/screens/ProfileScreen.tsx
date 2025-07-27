import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { UserService } from "@/services/userService";
import { Place, User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import EditProfileModal from "../EditProfileModal";
import EmailChangeModal from "../EmailChangeModal";
import PasswordChangeModal from "../PasswordChangeModal";

interface ProfileScreenProps {
    onPriceUpdated?: () => void;
}

export default function ProfileScreen({ onPriceUpdated }: ProfileScreenProps) {
    const [user, setUser] = useState<User | null>(global.user);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState<{ [id: string]: string }>({});
    const [updatingPlace, setUpdatingPlace] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
    const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        header: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
            backgroundColor: currentTheme.background,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: currentTheme.text,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        iconContainer: {
            alignItems: "center",
            marginBottom: 20,
        },
        icon: {
            color: currentTheme.primary,
        },
        infoSection: {
            backgroundColor: currentTheme.lightBackground,
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            color: currentTheme.text,
            marginTop: 12,
        },
        value: {
            fontSize: 16,
            color: currentTheme.text,
            fontWeight: "500",
            marginTop: 4,
        },
        placesSection: {
            backgroundColor: currentTheme.lightBackground,
            padding: 15,
            borderRadius: 8,
            marginTop: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: currentTheme.text,
            marginBottom: 15,
        },
        priceExplanation: {
            color: currentTheme.text,
            fontStyle: "italic",
            marginBottom: 15,
            fontSize: 14,
        },
        placeItem: {
            marginBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
            paddingBottom: 15,
        },
        placeName: {
            fontSize: 16,
            fontWeight: "500",
            color: currentTheme.text,
            marginBottom: 8,
        },
        priceInputContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        priceInputWrapper: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: currentTheme.border,
            borderRadius: 4,
            backgroundColor: currentTheme.white,
            marginRight: 10,
            paddingRight: 8,
        },
        priceInput: {
            flex: 1,
            padding: 8,
        },
        euroSymbol: {
            fontSize: 16,
            color: currentTheme.secondaryText,
            fontWeight: "500",
        },
        updateButton: {
            backgroundColor: currentTheme.primary,
            padding: 10,
            borderRadius: 4,
            minWidth: 100,
            alignItems: "center",
        },
        updateButtonText: {
            color: currentTheme.white,
            fontWeight: "500",
        },
        noPlacesText: {
            color: currentTheme.secondaryText,
            fontStyle: "italic",
            textAlign: "center",
            marginVertical: 15,
        },
        loader: {
            marginVertical: 20,
        },
        logoutButton: {
            backgroundColor: currentTheme.danger,
            margin: 20,
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
        },
        logoutButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
        },
        infoRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
        },
        infoContent: {
            flex: 1,
        },
        changeEmailButton: {
            padding: 8,
            borderRadius: 6,
            backgroundColor: currentTheme.lightBackground,
            borderWidth: 1,
            borderColor: currentTheme.primary,
        },
        editButton: {
            backgroundColor: currentTheme.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            borderRadius: 8,
            marginTop: 20,
        },
        editButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
        },
        passwordButton: {
            backgroundColor: currentTheme.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
        },
        passwordButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
        },
    });

    const fetchPlaces = useCallback(async () => {
        try {
            setLoading(true);
            const userToken = await SecureStore.getItemAsync("userToken");

            const response = await fetch(`${API_BASE_URL}/places?inst_numero=${user?.inst_numero}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des équipements");
            }

            const data = await response.json();
            setPlaces(data);

            // Initialiser l'état des prix avec les valeurs actuelles
            const initialPrices: { [id: string]: string } = {};
            data.forEach((place: Place) => {
                initialPrices[place.id] =
                    place.price !== null && place.price !== undefined ? place.price.toString() : "";
            });
            setPrices(initialPrices);
        } catch (error) {
            console.error("Erreur :", error);
            Alert.alert("Erreur", "Impossible de charger les équipements de cet établissement");
        } finally {
            setLoading(false);
        }
    }, [user?.inst_numero]);

    useEffect(() => {
        if (global.user) {
            setUser(global.user);

            // Si l'utilisateur est une institution, récupérer ses places
            if (global.user.type === "ROLE_INSTITUTION") {
                fetchPlaces();
            }
        } else {
            Alert.alert("Erreur", "Impossible de charger les données utilisateur");
        }
    }, [fetchPlaces]);

    const updatePlacePrice = async (placeId: string) => {
        try {
            setUpdatingPlace(placeId);
            const userToken = await SecureStore.getItemAsync("userToken");

            const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    price: prices[placeId] === "" ? null : Number(prices[placeId]),
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la mise à jour du prix");
            }

            Alert.alert("Succès", "Le prix a été mis à jour avec succès");

            // Rafraîchir les places pour obtenir les données mises à jour
            fetchPlaces();

            // Notifier le parent que les prix ont été mis à jour
            if (onPriceUpdated) {
                onPriceUpdated();
            }
        } catch (error) {
            console.error("Erreur :", error);
            Alert.alert("Erreur", "Impossible de mettre à jour le prix");
        } finally {
            setUpdatingPlace(null);
        }
    };

    const handleLogout = async () => {
        try {
            const userToken = await SecureStore.getItemAsync("userToken");

            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok || response.status === 204) {
                global.user = null;
                await SecureStore.deleteItemAsync("userToken");
                router.replace("/login");
            } else {
                try {
                    const errorData = await response.json();
                    Alert.alert("Erreur", errorData.message || "Erreur lors de la déconnexion");
                } catch {
                    Alert.alert("Erreur", "Erreur lors de la déconnexion");
                }
            }
        } catch (error) {
            console.error("Erreur de déconnexion :", error);
            global.user = null;
            await SecureStore.deleteItemAsync("userToken");
            router.replace("/login");
        }
    };

    const handleUserUpdated = (updatedUser: User) => {
        console.log("=== MISE À JOUR UTILISATEUR ===");
        console.log("Utilisateur avant mise à jour:", user);
        console.log("Utilisateur après mise à jour reçu:", updatedUser);
        console.log("Type avant:", user?.type);
        console.log("Type après:", updatedUser.type);
        console.log("Données complètes:", JSON.stringify(updatedUser, null, 2));

        setUser(updatedUser);
        global.user = updatedUser;

        // Si l'utilisateur est une institution, recharger les places aussi
        if (updatedUser.type === "ROLE_INSTITUTION") {
            fetchPlaces();
        }

        console.log("=== FIN MISE À JOUR UTILISATEUR ===");
    };

    const handleEmailChanged = async () => {
        try {
            console.log("Rechargement des données utilisateur après changement d'email...");
            const updatedUser = await UserService.getCurrentUser();
            console.log("Nouvelles données utilisateur reçues:", updatedUser);

            // Mettre à jour l'état local et global
            setUser(updatedUser);
            global.user = updatedUser;

            console.log("Données utilisateur mises à jour avec succès");
        } catch (error) {
            console.error("Erreur lors du rechargement des données utilisateur:", error);
            Alert.alert(
                "Information",
                "Les données ont été mises à jour mais l'affichage n'a pas pu être rafraîchi. Redémarrez l'application pour voir les changements."
            );
        }
    };

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person-circle" size={80} style={styles.icon} />
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{user.email}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.changeEmailButton}
                            onPress={() => setShowEmailChangeModal(true)}
                        >
                            <Ionicons name="mail-outline" size={20} color={currentTheme.primary} />
                        </TouchableOpacity>
                    </View>

                    {user.type === "ROLE_COACH" ? (
                        <>
                            <Text style={styles.label}>Prénom</Text>
                            <Text style={styles.value}>{user.firstName}</Text>

                            <Text style={styles.label}>Nom</Text>
                            <Text style={styles.value}>{user.lastName}</Text>

                            <Text style={styles.label}>Profession</Text>
                            <Text style={styles.value}>{user.work}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Code établissement</Text>
                            <Text style={styles.value}>{user.inst_numero}</Text>

                            <Text style={styles.label}>Nom de votre établissement</Text>
                            <Text style={styles.value}>{user.inst_name}</Text>

                            {user.adresse && (
                                <>
                                    <Text style={styles.label}>Adresse</Text>
                                    <Text style={styles.value}>{user.adresse}</Text>
                                </>
                            )}

                            {user.ville && (
                                <>
                                    <Text style={styles.label}>Ville</Text>
                                    <Text style={styles.value}>{user.ville}</Text>
                                </>
                            )}

                            {user.activites && user.activites.length > 0 && (
                                <>
                                    <Text style={styles.label}>Activités</Text>
                                    <Text style={styles.value}>{user.activites.join(", ")}</Text>
                                </>
                            )}

                            {user.equipements && user.equipements.length > 0 && (
                                <>
                                    <Text style={styles.label}>Équipements</Text>
                                    <Text style={styles.value}>{user.equipements.join(", ")}</Text>
                                </>
                            )}
                        </>
                    )}

                    <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.editButtonText}>Modifier mes informations</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.passwordButton} onPress={() => setShowPasswordChangeModal(true)}>
                        <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                        <Text style={styles.passwordButtonText}>Changer le mot de passe</Text>
                    </TouchableOpacity>
                </View>

                {/* Section de gestion des prix pour les utilisateurs institution */}
                {user.type === "ROLE_INSTITUTION" && (
                    <View style={styles.placesSection}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="cash-outline" size={20} style={styles.icon} /> Gestion des prix
                        </Text>
                        <Text style={styles.priceExplanation}>
                            Définissez le tarif par créneau pour chaque équipement
                        </Text>

                        {loading ? (
                            <ActivityIndicator size="large" color={currentTheme.primary} style={styles.loader} />
                        ) : places.length > 0 ? (
                            places.map((place) => (
                                <View key={place.id} style={styles.placeItem}>
                                    <Text style={styles.placeName}>{place.equip_nom || place.lib_bdv}</Text>
                                    <View style={styles.priceInputContainer}>
                                        <View style={styles.priceInputWrapper}>
                                            <TextInput
                                                style={styles.priceInput}
                                                value={prices[place.id]}
                                                onChangeText={(text) => {
                                                    // Autoriser uniquement les nombres et chaîne vide
                                                    if (text === "" || /^\d+(\.\d*)?$/.test(text)) {
                                                        setPrices({ ...prices, [place.id]: text });
                                                    }
                                                }}
                                                keyboardType="numeric"
                                                placeholder="Prix par créneau"
                                            />
                                            <Text style={styles.euroSymbol}>€ / créneau</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.updateButton}
                                            onPress={() => updatePlacePrice(place.id)}
                                            disabled={updatingPlace === place.id}
                                        >
                                            {updatingPlace === place.id ? (
                                                <ActivityIndicator size="small" color={currentTheme.primary} />
                                            ) : (
                                                <Text style={styles.updateButtonText}>Mettre à jour</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noPlacesText}>Aucun équipement trouvé pour cet établissement</Text>
                        )}
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>

            {/* Modales */}
            <EditProfileModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onUserUpdated={handleUserUpdated}
            />

            <EmailChangeModal
                visible={showEmailChangeModal}
                onClose={() => setShowEmailChangeModal(false)}
                currentEmail={user.email}
                onEmailChanged={handleEmailChanged}
            />

            <PasswordChangeModal visible={showPasswordChangeModal} onClose={() => setShowPasswordChangeModal(false)} />
        </ScrollView>
    );
}
