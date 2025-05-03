import styles from "@/assets/styles/institutionsScreen";
import InstitutionCard from "@/components/InstitutionCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { API_BASE_URL } from "@/config";
import { Colors } from "@/constants/Colors";
import { useInstitutionFiltersContext } from "@/contexts/InstitutionFiltersContext";
import { Institution } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";

export default function InstitutionsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Utiliser le contexte partagé
    const { filteredInstitutions, searchText, filters, allActivities, updateInstitutions, handleSearch, handleFilterChange } = useInstitutionFiltersContext();

    const fetchInstitutions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/institutions`);

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            const data = await response.json();
            updateInstitutions(data);
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
        router.push("/map");
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
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Utiliser le contexte pour SearchFilterBar */}
            <SearchFilterBar onSearch={handleSearch} onFilterChange={handleFilterChange} activities={allActivities} currentFilters={filters} searchText={searchText} />

            <FlatList
                data={filteredInstitutions}
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
                <Ionicons name="map-outline" size={24} color={Colors.primary} />
                <Text style={styles.mapButtonText}>Voir la carte</Text>
            </TouchableOpacity>
        </View>
    );
}
