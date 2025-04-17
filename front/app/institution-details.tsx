import Badge from "@/components/Badge";
import { API_BASE_URL } from "@/config";
import { Institution, Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function InstitutionDetailsScreen() {
    const { id, source } = useLocalSearchParams<{ id: string; source: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);

    // Définir le titre de la page quand l'institution est chargée
    useEffect(() => {
        if (institution) {
            // Titre dynamique
            navigation.setOptions({
                title: institution.inst_name,
            });
        }
    }, [institution, navigation]);

    // Fonction pour naviguer vers l'écran de réservation
    const navigateToBooking = () => {
        if (institution && selectedPlace) {
            router.push({
                pathname: "/booking",
                params: {
                    placeId: selectedPlace.id,
                    placeName: `${institution.inst_name} - ${selectedPlace.data.equip_nom || selectedPlace.data.lib_bdv}`,
                    placePrice: selectedPlace.price ? selectedPlace.price.toString() : "0", // Passer le prix directement
                },
            });
        } else {
            Alert.alert("Erreur", "Veuillez sélectionner un équipement pour réserver");
        }
    };

    useEffect(() => {
        fetchInstitutionDetails();
    }, [id]);

    // Récupérer les places associées à l'institution
    useEffect(() => {
        if (institution) {
            fetchPlaces();
        }
    }, [institution]);

    const fetchInstitutionDetails = async () => {
        if (!id) return;

        try {
            // Récupération de toutes les institutions puis filtrage par ID
            const response = await fetch(`${API_BASE_URL}/institutions`);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }

            const data = await response.json();
            const institutionFound = data.find((i: Institution) => i.inst_numero === id);

            if (institutionFound) {
                setInstitution(institutionFound);
            } else {
                Alert.alert("Erreur", "Établissement non trouvé");
                router.back();
            }
        } catch (error) {
            console.error("Erreur :", error);
            Alert.alert("Erreur", "Impossible de charger les détails de l'établissement");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlaces = async () => {
        if (!institution) return;

        try {
            setIsLoadingPlaces(true);
            const response = await fetch(`${API_BASE_URL}/places?inst_numero=${institution.inst_numero}`);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des équipements");
            }

            const data = await response.json();

            // Filtrer pour ne garder que les places avec un prix défini (non NULL)
            const placesWithPrice = data.filter((place: Place) => place.price !== undefined && place.price !== null);
            setPlaces(placesWithPrice);

            // Sélectionner la première place par défaut s'il y en a
            if (placesWithPrice.length > 0) {
                setSelectedPlace(placesWithPrice[0]);
            }
        } catch (error) {
            console.error("Erreur :", error);
            Alert.alert("Erreur", "Impossible de charger les équipements de cet établissement");
        } finally {
            setIsLoadingPlaces(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!institution) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Établissement non trouvé</Text>
            </View>
        );
    }

    // Convertir l'objet activités en tableau de valeurs
    const activitesArray = institution.activites ? Object.values(institution.activites) : [];

    // Vérifier si l'établissement a des coordonnées valides pour la carte
    const hasValidCoordinates = institution.coordonnees && institution.coordonnees.lat && institution.coordonnees.lon;

    // Fonction pour créer un titre de section avec icône alignée correctement
    const renderSectionTitle = (title: string, iconName: any) => (
        <View style={styles.sectionTitleContainer}>
            <Ionicons name={iconName} size={20} color="#555" style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitleText}>{title}</Text>
        </View>
    );

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
                                latitude: institution.coordonnees.lat,
                                longitude: institution.coordonnees.lon,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            zoomEnabled={true}
                            scrollEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: institution.coordonnees.lat,
                                    longitude: institution.coordonnees.lon,
                                }}
                                title={institution.inst_name}
                            />
                        </MapView>
                    </View>
                )}

                {/* Informations principales */}
                <View style={styles.card}>
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="business-outline" size={20} color="#555" style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Établissement :</Text>
                            <Text style={styles.infoValue}>{institution.inst_name}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#555" style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Adresse :</Text>
                            <Text style={styles.infoValue}>{institution.adresse}</Text>
                        </View>
                    </View>

                    {/* Équipements */}
                    {(institution.equipements.douches || institution.equipements.sanitaires) && (
                        <View style={styles.facilitiesSection}>
                            {renderSectionTitle("Équipements", "water-outline")}
                            <View style={styles.badgeContainer}>
                                {institution.equipements.douches && <Badge text="Douches" />}
                                {institution.equipements.sanitaires && <Badge text="Sanitaires" />}
                            </View>
                        </View>
                    )}

                    {/* Activités sportives */}
                    {activitesArray.length > 0 && (
                        <View style={styles.activitiesSection}>
                            {renderSectionTitle("Activités sportives", "fitness-outline")}
                            <View style={styles.activitiesList}>
                                {activitesArray.map((activity, index) => (
                                    <View key={index} style={styles.activityItem}>
                                        <Ionicons name="checkmark-circle-outline" size={16} color="#007AFF" style={styles.activityIcon} />
                                        <Text style={styles.activityText}>{activity}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Liste des équipements spécifiques (places) */}
                <View style={styles.card}>
                    {renderSectionTitle("Sites disponibles", "grid-outline")}

                    {isLoadingPlaces ? (
                        <ActivityIndicator size="small" color="#007AFF" style={styles.placesLoading} />
                    ) : places.length > 0 ? (
                        <View style={styles.placesContainer}>
                            {places.map((place) => (
                                <TouchableOpacity
                                    key={place.id}
                                    style={[styles.placeCard, selectedPlace?.id === place.id && styles.selectedPlaceCard]}
                                    onPress={() => setSelectedPlace(place)}
                                >
                                    {/* Nom de l'équipement */}
                                    <Text style={[styles.placeCardTitle, selectedPlace?.id === place.id && styles.selectedPlaceCardText]}>
                                        {place.data.equip_nom || "Équipement"}
                                    </Text>

                                    {/* Localité */}
                                    <Text style={[styles.placeCardSubtitle, selectedPlace?.id === place.id && styles.selectedPlaceCardText]}>
                                        {place.data.lib_bdv}, {place.data.inst_cp}
                                    </Text>

                                    {/* Surface de l'équipement */}
                                    {place.data.equip_surf > 0 && (
                                        <View style={styles.placeInfoRow}>
                                            <Ionicons name="resize-outline" size={16} color={selectedPlace?.id === place.id ? "#007AFF" : "#555"} style={styles.placeInfoIcon} />
                                            <Text style={[styles.placeInfoText, selectedPlace?.id === place.id && styles.selectedPlaceCardText]}>
                                                Surface: {place.data.equip_surf} m²
                                            </Text>
                                        </View>
                                    )}

                                    {/* Prix de l'équipement */}
                                    {place.price !== undefined && (
                                        <View style={styles.placeInfoRow}>
                                            <Ionicons name="pricetag-outline" size={16} color={selectedPlace?.id === place.id ? "#007AFF" : "#555"} style={styles.placeInfoIcon} />
                                            <Text style={[styles.placeInfoText, selectedPlace?.id === place.id && styles.selectedPlaceCardText]}>
                                                Prix: {place.price} € / créneau
                                            </Text>
                                        </View>
                                    )}

                                    {/* Activités sportives */}
                                    {place.data.equip_aps_nom && place.data.equip_aps_nom.length > 0 && (
                                        <View style={styles.placeActivities}>
                                            <View style={styles.placeInfoRow}>
                                                <Ionicons
                                                    name="fitness-outline"
                                                    size={16}
                                                    color={selectedPlace?.id === place.id ? "#007AFF" : "#555"}
                                                    style={styles.placeInfoIcon}
                                                />
                                                <Text style={[styles.placeActivitiesLabel, selectedPlace?.id === place.id && styles.selectedPlaceCardText]}>Activités:</Text>
                                            </View>
                                            <Text style={[styles.placeActivitiesText, selectedPlace?.id === place.id && styles.selectedPlaceCardText]}>
                                                {place.data.equip_aps_nom.join(", ")}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Indicateur de sélection */}
                                    {selectedPlace?.id === place.id && (
                                        <View style={styles.selectedIndicator}>
                                            <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noPlacesText}>Aucun site disponible pour cet établissement</Text>
                    )}

                    {/* Bouton de réservation */}
                    {global.user && places.length > 0 && (
                        <TouchableOpacity style={styles.bookingButton} onPress={navigateToBooking} disabled={!selectedPlace}>
                            <View style={styles.bookingButtonContent}>
                                <Ionicons name="calendar-outline" size={20} color="#fff" />
                                <Text style={styles.bookingButtonText}>Réserver {selectedPlace ? `(${selectedPlace.data.equip_nom || selectedPlace.inst_name})` : ""}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
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
        alignItems: "center", // Centrer verticalement le texte avec les icônes
        marginBottom: 12,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
        paddingRight: 5,
    },
    infoValue: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    // Nouveaux styles pour les titres de section avec alignement
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitleIcon: {
        marginRight: 8,
    },
    sectionTitleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    // Ancien style maintenu pour la compatibilité
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
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
    placesLoading: {
        marginVertical: 20,
    },
    placesContainer: {
        marginBottom: 16,
    },
    placeCard: {
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#eaeaea",
        position: "relative",
    },
    selectedPlaceCard: {
        borderColor: "#007AFF",
    },
    placeCardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
    },
    placeCardSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    selectedPlaceCardText: {
        // Style pour le texte de la carte sélectionnée
    },
    placeInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    placeInfoIcon: {
        marginRight: 6,
    },
    placeInfoText: {
        fontSize: 14,
        color: "#555",
    },
    placeActivities: {
        marginTop: 4,
    },
    placeActivitiesLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#555",
    },
    placeActivitiesText: {
        fontSize: 13,
        color: "#666",
        fontStyle: "italic",
        marginLeft: 22, // Aligner avec l'icône
    },
    selectedIndicator: {
        position: "absolute",
        top: "50%",
        right: 12,
    },
    noPlacesText: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
    bookingButton: {
        backgroundColor: "#28a745",
        padding: 14,
        marginTop: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    bookingButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
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
});
