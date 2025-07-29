import { useTheme } from "@/hooks/useTheme";
import { AuthService, PlaceService } from "@/services";
import { UserService } from "@/services";
import { Place, User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
    const styles = getStyles(currentTheme);

    const fetchPlaces = useCallback(async () => {
        try {
            setLoading(true);
            if (!user?.inst_numero) return;
            
            const places = await PlaceService.getPlacesByInstitution(user.inst_numero);
            setPlaces(places);

            const initialPrices: { [id: string]: string } = {};
            places.forEach((place: Place) => {
                initialPrices[place.id] =
                    place.price !== null && place.price !== undefined ? place.price.toString() : "";
            });
            setPrices(initialPrices);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Impossible de charger les équipements de cet établissement";
            Alert.alert("Erreur", errorMessage);
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
            const priceValue = prices[placeId] === "" ? null : Number(prices[placeId]);
            
            await PlaceService.updatePlace(placeId, { price: priceValue });
            
            Alert.alert("Succès", "Le prix a été mis à jour avec succès");
            fetchPlaces();
            
            if (onPriceUpdated) {
                onPriceUpdated();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Impossible de mettre à jour le prix";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setUpdatingPlace(null);
        }
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            global.user = null;
            router.replace("/login");
        } catch (error) {
            // Forcer la déconnexion même en cas d'erreur
            global.user = null;
            router.replace("/login");
        }
    };

    const handleUserUpdated = (updatedUser: User) => {
        setUser(updatedUser);
        global.user = updatedUser;

        // Si l'utilisateur est une institution, recharger les places aussi
        if (updatedUser.type === "ROLE_INSTITUTION") {
            fetchPlaces();
        }
    };

    const handleEmailChanged = async () => {
        try {
            const updatedUser = await UserService.getCurrentUser();

            // Mettre à jour l'état local et global
            setUser(updatedUser);
            global.user = updatedUser;
        } catch (error) {
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

const getStyles = (currentTheme: any) => StyleSheet.create({
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
