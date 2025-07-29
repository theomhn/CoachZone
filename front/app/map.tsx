import getStyles from "@/assets/styles/mapScreen";
import Button from "@/components/Button";
import InstitutionCard from "@/components/InstitutionCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { useInstitutionFiltersContext } from "@/contexts/InstitutionFiltersContext";
import { useTheme } from "@/hooks/useTheme";
import { InstitutionService } from "@/services";
import { Institution } from "@/types";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function MapScreen() {
    // Protection : Rediriger si pas coach
    useFocusEffect(
        useCallback(() => {
            if (!global.user || global.user.type !== "ROLE_COACH") {
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
    if (!global.user || global.user.type !== "ROLE_COACH") {
        return null;
    }

    // Récupération des lieux
    useEffect(() => {
        fetchInstitutions();
        getUserLocation();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const data = await InstitutionService.getAllInstitutions();
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
                <Button
                    onPress={centerOnUserLocation}
                    variant="floating"
                    icon="locate"
                    iconSize={24}
                    style={{
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                        backgroundColor: currentTheme.background,
                        borderRadius: 30,
                        width: 50,
                        height: 50,
                        paddingVertical: 0,
                        paddingHorizontal: 0,
                    }}
                />
            )}

            {/* Utilisation du InstitutionCard partagé en mode popup */}
            {selectedInstitution && (
                <InstitutionCard
                    item={selectedInstitution}
                    variant="popup"
                    showActivities={true}
                    showDetailsButton={true}
                    onClose={() => setSelectedInstitution(null)}
                    onViewDetails={() => navigateToInstitutionDetails(selectedInstitution.inst_numero)}
                />
            )}
        </View>
    );
}
