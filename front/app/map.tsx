import getStyles from "@/assets/styles/mapScreen";
import InstitutionCard from "@/components/InstitutionCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { API_BASE_URL } from "@/config";
import { useInstitutionFiltersContext } from "@/contexts/InstitutionFiltersContext";
import { useTheme } from "@/hooks/useTheme";
import { Institution } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function MapScreen() {
    // Protection : Rediriger si pas coach
    useFocusEffect(
        useCallback(() => {
            if (!global.user || global.user.type !== "coach") {
                router.replace("/(auth)/login" as any);
                return;
            }
        }, [])
    );

    const [isLoading, setIsLoading] = useState(true);
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [region, setRegion] = useState({
        latitude: 43.62505, // Montpellier par défaut
        longitude: 3.862038,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Utiliser le contexte partagé
    const {
        filteredInstitutions,
        allActivities,
        updateInstitutions,
        handleSearch,
        handleFilterChange,
        filters,
        searchText,
    } = useInstitutionFiltersContext();

    // Si pas coach, ne pas afficher l'écran
    if (!global.user || global.user.type !== "coach") {
        return null;
    }

    // Récupération des lieux
    useEffect(() => {
        fetchInstitutions();
        getUserLocation();
    }, []);

    const fetchInstitutions = async () => {
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
            updateInstitutions(data);

            // Si des institutions sont disponibles, centrer la carte sur la première
            if (data.length > 0 && data[0].coordonnees) {
                setRegion({
                    latitude: data[0].coordonnees.lat,
                    longitude: data[0].coordonnees.lon,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
        } catch (error) {
            console.error("Erreur :", error);
            Alert.alert("Erreur", "Impossible de récupérer les données des institutions");
        } finally {
            setIsLoading(false);
        }
    };

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission d'accès à la localisation refusée");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setUserLocation({ latitude, longitude });

            // Centrer la carte sur la position de l'utilisateur
            setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        } catch (error) {
            console.error("Erreur de localisation :", error);
        }
    };

    const handleMarkerPress = (institution: Institution) => {
        setSelectedInstitution(institution);
    };

    const centerOnUserLocation = () => {
        if (userLocation) {
            setRegion({
                ...region,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            });
        }
    };

    const navigateToInstitutionDetails = (institutionId: string) => {
        router.push({
            pathname: "/institution-details" as any,
            params: {
                id: institutionId,
                source: "map", // Indiquer que l'on vient de la carte
            },
        });
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    // Filtrer les institutions sans coordonnées
    const markersToShow = filteredInstitutions.filter(
        (inst) => inst.coordonnees && inst.coordonnees.lat && inst.coordonnees.lon
    );

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_DEFAULT}
                showsPointsOfInterest={false}
                showsTraffic={false}
                showsBuildings={false}
                showsIndoors={false}
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
            >
                {markersToShow.map((institution) => (
                    <Marker
                        key={institution.inst_numero}
                        coordinate={{
                            latitude: institution.coordonnees.lat,
                            longitude: institution.coordonnees.lon,
                        }}
                        title={institution.inst_name}
                        onPress={() => handleMarkerPress(institution)}
                    />
                ))}

                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        }}
                        pinColor="blue"
                        title="Ma position"
                    />
                )}
            </MapView>

            {/* Utiliser le contexte pour SearchFilterBar */}
            <View style={styles.searchFilterContainer}>
                <SearchFilterBar
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    activities={allActivities}
                    currentFilters={filters}
                    searchText={searchText}
                />
            </View>

            {/* Bouton pour centrer sur l'utilisateur */}
            {userLocation && (
                <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
                    <Ionicons name="locate" size={24} style={styles.icon} />
                </TouchableOpacity>
            )}

            {/* Utilisation du InstitutionCard partagé en mode popup */}
            {selectedInstitution && (
                <InstitutionCard
                    item={selectedInstitution}
                    variant="popup"
                    showActivities={false}
                    showDetailsButton={true}
                    onClose={() => setSelectedInstitution(null)}
                    onViewDetails={() => navigateToInstitutionDetails(selectedInstitution.inst_numero)}
                />
            )}
        </View>
    );
}
