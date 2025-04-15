import { API_BASE_URL } from "@/config";
import { Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, ScrollView } from "react-native";

export default function ProfileScreen() {
    const [user, setUser] = useState(global.user);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState<{ [id: string]: string }>({});
    const [updatingPlace, setUpdatingPlace] = useState<string | null>(null);

    useEffect(() => {
        if (global.user) {
            setUser(global.user);

            // Si l'utilisateur est une institution, récupérer ses places
            if (global.user.type === "institution") {
                fetchPlaces();
            }
        } else {
            Alert.alert("Erreur", "Impossible de charger les données utilisateur");
        }
    }, []);

    const fetchPlaces = async () => {
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
                initialPrices[place.id] = place.price !== null && place.price !== undefined ? place.price.toString() : "";
            });
            setPrices(initialPrices);
        } catch (error) {
            console.error("Erreur :", error);
            Alert.alert("Erreur", "Impossible de charger les équipements de cet établissement");
        } finally {
            setLoading(false);
        }
    };

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

    if (!user) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person-circle" size={80} color="#007AFF" />
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email}</Text>

                    {user.type === "coach" ? (
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
                        </>
                    )}
                </View>

                {/* Section de gestion des prix pour les utilisateurs institution */}
                {user.type === "institution" && (
                    <View style={styles.placesSection}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="cash-outline" size={20} color="#333" /> Gestion des prix
                        </Text>
                        <Text style={styles.priceExplanation}>Définissez le tarif par créneau pour chaque équipement</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
                        ) : places.length > 0 ? (
                            places.map((place) => (
                                <View key={place.id} style={styles.placeItem}>
                                    <Text style={styles.placeName}>{place.data.equip_nom || place.data.lib_bdv}</Text>
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
                                        <TouchableOpacity style={styles.updateButton} onPress={() => updatePlacePrice(place.id)} disabled={updatingPlace === place.id}>
                                            {updatingPlace === place.id ? (
                                                <ActivityIndicator size="small" color="#fff" />
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    priceExplanation: {
        color: "#666",
        fontStyle: "italic",
        marginBottom: 15,
        fontSize: 14,
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e1e1e1",
        backgroundColor: "#f8f8f8",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    infoSection: {
        backgroundColor: "#f8f8f8",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginTop: 12,
    },
    value: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
        marginTop: 4,
    },
    placesSection: {
        backgroundColor: "#f8f8f8",
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 15,
    },
    placeItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e1e1e1",
        paddingBottom: 15,
    },
    placeName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
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
        borderColor: "#ccc",
        borderRadius: 4,
        backgroundColor: "#fff",
        marginRight: 10,
        paddingRight: 8,
    },
    priceInput: {
        flex: 1,
        padding: 8,
    },
    euroSymbol: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    updateButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 4,
        minWidth: 100,
        alignItems: "center",
    },
    updateButtonText: {
        color: "#fff",
        fontWeight: "500",
    },
    noPlacesText: {
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 15,
    },
    loader: {
        marginVertical: 20,
    },
    logoutButton: {
        backgroundColor: "#ff3b30",
        margin: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
