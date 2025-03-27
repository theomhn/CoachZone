import Badge from "@/components/Badge";
import { API_BASE_URL } from "@/config";
import { Place } from "@/types";
import { formatDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function PlaceDetailsScreen() {
    const { id, source } = useLocalSearchParams<{ id: string; source: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const [place, setPlace] = useState<Place | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Définir le titre de la page quand place est chargé
    useEffect(() => {
        if (place) {
            // Titre dynamique
            navigation.setOptions({
                title: place.data.inst_nom,
            });
        }
    }, [place, navigation]);

    // Fonction pour naviguer vers l'écran de réservation
    const navigateToBooking = () => {
        if (place) {
            router.push({
                pathname: "/booking",
                params: {
                    placeId: place.id,
                    placeName: place.data.inst_nom,
                },
            });
        } else {
            Alert.alert("Erreur", "Impossible de réserver : informations de l'installation manquantes");
        }
    };

    useEffect(() => {
        fetchPlaceDetails();
    }, [id]);

    const fetchPlaceDetails = async () => {
        if (!id) return;

        try {
            // Récupération de tous les lieux puis filtrage par ID
            const response = await fetch(`${API_BASE_URL}/opendata/places`);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }

            const data = await response.json();
            const placeFound = data.find((p: Place) => p.id === id);

            if (placeFound) {
                setPlace(placeFound);
            } else {
                Alert.alert("Erreur", "Installation non trouvée");
                router.back();
            }
        } catch (error) {
            console.error("Erreur :", error);
            Alert.alert("Erreur", "Impossible de charger les détails de l'installation");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!place) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Installation non trouvée</Text>
            </View>
        );
    }

    // Vérifier si le lieu a des coordonnées valides pour la carte
    const hasValidCoordinates = place.data.coordonnees && place.data.coordonnees.lat && place.data.coordonnees.lon;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Carte (si coordonnées disponibles) */}
                {hasValidCoordinates && (
                    <View style={styles.mapContainer}>
                        <MapView
                            provider={PROVIDER_DEFAULT}
                            showsPointsOfInterest={false}
                            style={styles.map}
                            initialRegion={{
                                latitude: place.data.coordonnees.lat,
                                longitude: place.data.coordonnees.lon,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            zoomEnabled={true}
                            scrollEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: place.data.coordonnees.lat,
                                    longitude: place.data.coordonnees.lon,
                                }}
                                title={place.data.inst_nom}
                            />
                        </MapView>
                    </View>
                )}

                {/* Informations principales */}
                <View style={styles.card}>
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="business-outline" size={20} color="#555" style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Équipement :</Text>
                            <Text style={styles.infoValue}>{place.data.equip_nom}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#555" style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Adresse :</Text>
                            <Text style={styles.infoValue}>{place.data.inst_adresse}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="map-outline" size={20} color="#555" style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Localité :</Text>
                            <Text style={styles.infoValue}>
                                {place.data.inst_cp} {place.data.lib_bdv}
                            </Text>
                        </View>

                        {place.data.equip_surf > 0 && (
                            <View style={styles.infoRow}>
                                <Ionicons name="resize-outline" size={20} color="#555" style={styles.infoIcon} />
                                <Text style={styles.infoLabel}>Surface :</Text>
                                <Text style={styles.infoValue}>{place.data.equip_surf} m²</Text>
                            </View>
                        )}

                        {place.data.equip_nature && (
                            <View style={styles.infoRow}>
                                <Ionicons name="leaf-outline" size={20} color="#555" style={styles.infoIcon} />
                                <Text style={styles.infoLabel}>Nature :</Text>
                                <Text style={styles.infoValue}>{place.data.equip_nature}</Text>
                            </View>
                        )}
                    </View>

                    {/* Équipements */}
                    {(place.data.equip_douche || place.data.equip_sanit) && (
                        <View style={styles.facilitiesSection}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="water-outline" size={20} color="#555" /> Équipements
                            </Text>
                            <View style={styles.badgeContainer}>
                                {place.data.equip_douche && <Badge text="Douches" />}
                                {place.data.equip_sanit && <Badge text="Sanitaires" />}
                            </View>
                        </View>
                    )}

                    {/* Activités sportives */}
                    {place.data.equip_aps_nom && place.data.equip_aps_nom.length > 0 && (
                        <View style={styles.activitiesSection}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="fitness-outline" size={20} color="#555" /> Activités sportives
                            </Text>
                            <View style={styles.activitiesList}>
                                {place.data.equip_aps_nom.map((activity, index) => (
                                    <View key={index} style={styles.activityItem}>
                                        <Ionicons name="checkmark-circle-outline" size={16} color="#007AFF" style={styles.activityIcon} />
                                        <Text style={styles.activityText}>{activity}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Bouton de réservation */}
                    {global.user && (
                        <View style={styles.bookingSection}>
                            <TouchableOpacity style={styles.bookingButton} onPress={navigateToBooking}>
                                <Ionicons name="calendar-outline" size={20} color="#fff" style={styles.bookingIcon} />
                                <Text style={styles.bookingButtonText}>Réserver cette installation</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Information de mise à jour */}
                    <View style={styles.updateInfo}>
                        <Ionicons name="time-outline" size={16} color="#999" />
                        <Text style={styles.updateText}>Dernière mise à jour : {formatDate(place.lastUpdate)}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        color: "#666",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    mapContainer: {
        height: 200,
        marginBottom: 16,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoSection: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    infoIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
        width: 90,
    },
    infoValue: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    facilitiesSection: {
        marginBottom: 20,
    },
    badgeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    activitiesSection: {
        marginBottom: 20,
    },
    activitiesList: {
        marginLeft: 4,
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    activityIcon: {
        marginRight: 8,
    },
    activityText: {
        fontSize: 14,
        color: "#333",
    },
    bookingSection: {
        marginTop: 16,
        marginBottom: 16,
    },
    bookingButton: {
        backgroundColor: "#28a745",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    bookingButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    bookingIcon: {
        marginRight: 4,
    },
    updateInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    updateText: {
        fontSize: 12,
        color: "#999",
        marginLeft: 4,
    },
});
