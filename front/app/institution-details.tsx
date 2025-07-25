import getStyles from "@/assets/styles/institutionDetailsScreen";
import Badge from "@/components/Badge";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Institution, Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function InstitutionDetailsScreen() {
    // Protection : Rediriger si pas coach
    useFocusEffect(
        useCallback(() => {
            if (!global.user || global.user.type !== "ROLE_COACH") {
                router.replace("/(auth)/login" as any);
                return;
            }
        }, [])
    );

    const { id, source } = useLocalSearchParams<{ id: string; source: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Si pas coach, ne pas afficher l'écran
    if (!global.user || global.user.type !== "ROLE_COACH") {
        return null;
    }

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
                pathname: "/booking" as any,
                params: {
                    placeId: selectedPlace.id,
                    placeName: `${institution.inst_name} - ${selectedPlace.equip_nom || selectedPlace.lib_bdv}`,
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
            // Ajouter la récupération du token
            const token = await SecureStore.getItemAsync("userToken");

            const response = await fetch(`${API_BASE_URL}/institutions`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

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
        if (!institution || !institution.places || institution.places.length === 0) return;

        try {
            setIsLoadingPlaces(true);

            // Ajouter la récupération du token
            const token = await SecureStore.getItemAsync("userToken");

            // Récupérer chaque place individuellement
            const placesPromises = institution.places.map(async (placeUrl: string) => {
                const response = await fetch(`${API_BASE_URL}${placeUrl.replace("/api", "")}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Erreur lors de la récupération de l'équipement ${placeUrl}`);
                }

                return response.json();
            });

            const placesData = await Promise.all(placesPromises);

            // Filtrer pour ne garder que les places avec un prix défini (non NULL)
            const placesWithPrice = placesData.filter(
                (place: Place) => place.price !== undefined && place.price !== null
            );
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
                <ActivityIndicator size="large" color={currentTheme.primary} />
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
            <Ionicons name={iconName} size={20} style={styles.sectionTitleIcon} />
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
                            <Ionicons name="business-outline" size={20} style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Établissement :</Text>
                            <Text style={styles.infoValue}>{institution.inst_name}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Adresse :</Text>
                            <Text style={styles.infoValue}>
                                {institution.adresse}, {institution.ville}
                            </Text>
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
                                        <Ionicons
                                            name="checkmark-circle-outline"
                                            size={16}
                                            style={styles.activityIcon}
                                        />
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
                        <ActivityIndicator size="small" style={styles.placesLoading} />
                    ) : places.length > 0 ? (
                        <View style={styles.placesContainer}>
                            {places.map((place) => (
                                <TouchableOpacity
                                    key={place.id}
                                    style={[
                                        styles.placeCard,
                                        selectedPlace?.id === place.id && styles.selectedPlaceCard,
                                    ]}
                                    onPress={() => setSelectedPlace(place)}
                                >
                                    {/* Nom de l'équipement */}
                                    <Text style={styles.placeCardTitle}>{place.equip_nom || "Équipement"}</Text>

                                    {/* Localité */}
                                    <Text style={styles.placeCardSubtitle}>
                                        {institution.adresse}, {institution.ville}
                                    </Text>

                                    {/* Surface de l'équipement */}
                                    {place.equip_surf > 0 && (
                                        <View style={styles.placeInfoRow}>
                                            <Ionicons
                                                name="resize-outline"
                                                size={16}
                                                style={[styles.placeInfoIcon, styles.icon]}
                                            />
                                            <Text style={styles.placeInfoText}>Surface: {place.equip_surf} m²</Text>
                                        </View>
                                    )}

                                    {/* Prix de l'équipement */}
                                    {place.price !== undefined && (
                                        <View style={styles.placeInfoRow}>
                                            <Ionicons
                                                name="pricetag-outline"
                                                size={16}
                                                style={[styles.placeInfoIcon, styles.icon]}
                                            />
                                            <Text style={styles.placeInfoText}>Prix: {place.price} € / créneau</Text>
                                        </View>
                                    )}

                                    {/* Activités sportives */}
                                    {place.equip_aps_nom && place.equip_aps_nom.length > 0 && (
                                        <View style={styles.placeActivities}>
                                            <View style={styles.placeInfoRow}>
                                                <Ionicons
                                                    name="fitness-outline"
                                                    size={16}
                                                    style={[styles.placeInfoIcon, styles.icon]}
                                                />
                                                <Text style={styles.placeActivitiesLabel}>Activités:</Text>
                                            </View>
                                            <Text style={styles.placeActivitiesText}>
                                                {place.equip_aps_nom.join(", ")}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Indicateur de sélection */}
                                    {selectedPlace?.id === place.id && (
                                        <View style={styles.selectedIndicator}>
                                            <Ionicons name="checkmark-circle" size={20} style={styles.iconPrimary} />
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
                        <TouchableOpacity
                            style={styles.bookingButton}
                            onPress={navigateToBooking}
                            disabled={!selectedPlace}
                        >
                            <View style={styles.bookingButtonContent}>
                                <Ionicons name="calendar-outline" size={20} style={styles.iconWhite} />
                                <Text style={styles.bookingButtonText}>Voir les disponibilités</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
