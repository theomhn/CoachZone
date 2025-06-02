import getStyles from "@/assets/styles/profileScreen";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ProfileScreenProps {
    onPriceUpdated?: () => void;
}

export default function ProfileScreen({ onPriceUpdated }: ProfileScreenProps) {
    const [user, setUser] = useState(global.user);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState<{ [id: string]: string }>({});
    const [updatingPlace, setUpdatingPlace] = useState<string | null>(null);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

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
                            <Ionicons name="cash-outline" size={20} style={styles.icon} /> Gestion des prix
                        </Text>
                        <Text style={styles.priceExplanation}>Définissez le tarif par créneau pour chaque équipement</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color={currentTheme.primary} style={styles.loader} />
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
        </ScrollView>
    );
}
