import InstitutionCard from "@/components/InstitutionCard";
import { API_BASE_URL } from "@/config";
import { Institution } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InstitutionsScreen() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchInstitutions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/institutions`);

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            const data = await response.json();
            setInstitutions(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchInstitutions();
    };

    const navigateToMap = () => {
        router.replace("/(tabs)/map");
    };

    const navigateToInstitutionDetails = (institutionId: string) => {
        router.push({
            pathname: "/institution-details",
            params: {
                id: institutionId,
                source: "list", // Indiquer que l'on vient de la liste
            },
        });
    };

    const renderInstitutionCard = ({ item }: { item: Institution }) => (
        <InstitutionCard item={item} variant="card" showActivities={true} showDetailsButton={true} onViewDetails={() => navigateToInstitutionDetails(item.inst_numero)} />
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={institutions}
                renderItem={renderInstitutionCard}
                keyExtractor={(item) => item.inst_numero}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune installation disponible</Text>
                    </View>
                }
            />

            {/* Bouton Voir la carte en position absolute */}
            <TouchableOpacity style={styles.floatingMapButton} onPress={navigateToMap}>
                <Ionicons name="map-outline" size={24} color="#007AFF" />
                <Text style={styles.mapButtonText}>Voir la carte</Text>
            </TouchableOpacity>
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
    listContainer: {
        paddingBottom: 80, // Espace en bas pour le bouton flottant
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
    floatingMapButton: {
        position: "absolute",
        bottom: 25,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e1f5fe",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mapButtonText: {
        color: "#007AFF",
        marginLeft: 8,
        fontWeight: "600",
        fontSize: 16,
    },
});
