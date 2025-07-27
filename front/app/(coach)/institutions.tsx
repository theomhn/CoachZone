import getStyles from "@/assets/styles/institutionsScreen";
import Button from "@/components/Button";
import FavoriteButton from "@/components/FavoriteButton";
import InstitutionCard from "@/components/InstitutionCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { API_BASE_URL } from "@/config";
import { useInstitutionFiltersContext } from "@/contexts/InstitutionFiltersContext";
import { useTheme } from "@/hooks/useTheme";
import { Institution } from "@/types";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, View } from "react-native";

export default function InstitutionsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [favoritesRefreshKey, setFavoritesRefreshKey] = useState(0); // Force refresh des favoris

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Utiliser le contexte partagé
    const {
        filteredInstitutions,
        searchText,
        filters,
        allActivities,
        updateInstitutions,
        handleSearch,
        handleFilterChange,
    } = useInstitutionFiltersContext();

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

    // Forcer la mise à jour des FavoriteButton quand on revient sur cet écran
    useFocusEffect(
        useCallback(() => {
            // Incrémenter la clé pour forcer le re-render des FavoriteButton
            setFavoritesRefreshKey((prev) => prev + 1);
        }, [])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchInstitutions();
    };

    const navigateToMap = () => {
        router.push("/map" as any);
    };

    const navigateToInstitutionDetails = (institutionId: string) => {
        router.push({
            pathname: "/institution-details" as any,
            params: {
                id: institutionId,
                source: "list", // Indiquer que l'on vient de la liste
            },
        });
    };

    const handleFavoriteChange = (instNumero: string, isFavorite: boolean) => {
        // Optionnel: Vous pouvez ajouter une logique ici pour mettre à jour l'UI
        // Par exemple, afficher un petit toast ou mettre à jour un état global
        console.log(`Institution ${instNumero} ${isFavorite ? "ajoutée aux" : "supprimée des"} favoris`);
    };

    const renderInstitutionCard = ({ item }: { item: Institution }) => (
        <View style={styles.cardContainer}>
            <InstitutionCard
                item={item}
                variant="card"
                showActivities={true}
                showDetailsButton={true}
                onViewDetails={() => navigateToInstitutionDetails(item.inst_numero)}
            />
            {/* Bouton favori positionné en overlay sur la carte */}
            <View style={styles.favoriteButtonOverlay}>
                <FavoriteButton
                    key={`${item.inst_numero}-${favoritesRefreshKey}`} // Force refresh avec la clé
                    instNumero={item.inst_numero}
                    size={22}
                    onFavoriteChange={(isFavorite) => handleFavoriteChange(item.inst_numero, isFavorite)}
                    style={styles.favoriteButton}
                />
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Utiliser le contexte pour SearchFilterBar */}
            <SearchFilterBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                activities={allActivities}
                currentFilters={filters}
                searchText={searchText}
            />

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
            <Button
                title="Voir la carte"
                onPress={navigateToMap}
                variant="floating"
                icon="map-outline"
                iconSize={24}
                style={{ bottom: 25, alignSelf: "center" }}
            />
        </View>
    );
}
