import PlaceCard from "@/components/PlaceCard";
import { Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PlacesScreen() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchPlaces = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/opendata/places");

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            const data = await response.json();
            setPlaces(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPlaces();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchPlaces();
    };

    const navigateToMap = () => {
        router.replace("/(tabs)/map");
    };

    const renderPlaceCard = ({ item }: { item: Place }) => <PlaceCard item={item} />;

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Installations Sportives</Text>
                <TouchableOpacity style={styles.mapButton} onPress={navigateToMap}>
                    <Ionicons name="map-outline" size={24} color="#007AFF" />
                    <Text style={styles.mapButtonText}>Voir sur la carte</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={places}
                renderItem={renderPlaceCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune installation disponible</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e1f5fe",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    mapButtonText: {
        color: "#007AFF",
        marginLeft: 6,
        fontWeight: "500",
    },
    listContainer: {
        paddingBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});
