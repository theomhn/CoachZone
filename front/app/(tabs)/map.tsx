import PlaceCard from "@/components/PlaceCard";
import { API_BASE_URL } from "@/config";
import { Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function MapScreen() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [region, setRegion] = useState({
        latitude: 43.62505, // Montpellier par défaut
        longitude: 3.862038,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    // Récupération des lieux
    useEffect(() => {
        fetchPlaces();
        getUserLocation();
    }, []);

    const fetchPlaces = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/opendata/places`);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            const data = await response.json();

            // Filtrer les lieux qui ont des coordonnées valides
            const placesWithCoords = data.filter((place: Place) => place.data.coordonnees && place.data.coordonnees.lat && place.data.coordonnees.lon);

            setPlaces(placesWithCoords);

            // Si des lieux sont disponibles, centrer la carte sur le premier
            if (placesWithCoords.length > 0) {
                setRegion({
                    latitude: placesWithCoords[0].data.coordonnees.lat,
                    longitude: placesWithCoords[0].data.coordonnees.lon,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
        } catch (error) {
            console.error("Erreur :", error);
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

    const handleMarkerPress = (place: Place) => {
        setSelectedPlace(place);
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

    const navigateToPlaceDetails = (placeId: string) => {
        router.push({
            pathname: "/place-details",
            params: {
                id: placeId,
                source: "map", // Indiquer que l'on vient de la carte
            },
        });
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

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
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{
                            latitude: place.data.coordonnees.lat,
                            longitude: place.data.coordonnees.lon,
                        }}
                        title={place.data.inst_nom}
                        description={place.data.equip_nom}
                        onPress={() => handleMarkerPress(place)}
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

            {/* Bouton pour centrer sur l'utilisateur */}
            {userLocation && (
                <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
                    <Ionicons name="locate" size={24} color="#007AFF" />
                </TouchableOpacity>
            )}

            {/* Utilisation du PlaceCard partagé en mode popup */}
            {selectedPlace && (
                <PlaceCard
                    item={selectedPlace}
                    variant="popup"
                    showDate={false}
                    showActivities={false}
                    showDetailsButton={true}
                    onClose={() => setSelectedPlace(null)}
                    onViewDetails={() => navigateToPlaceDetails(selectedPlace.id)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
    locationButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#fff",
        borderRadius: 30,
        padding: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
