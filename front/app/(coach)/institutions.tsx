import Button from "@/components/Button";
import SearchFilterBar from "@/components/SearchFilterBar";
import InstitutionListView from "@/components/ui/InstitutionListView";
import LoadingView from "@/components/ui/LoadingView";
import { useInstitutionFiltersContext } from "@/contexts/InstitutionFiltersContext";
import { useTheme } from "@/hooks/useTheme";
import { InstitutionService } from "@/services";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

export default function InstitutionsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [favoritesRefreshKey, setFavoritesRefreshKey] = useState(0); // Force refresh des favoris

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
            const data = await InstitutionService.getAllInstitutions();
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


    const handleFavoriteChange = (instNumero: string, isFavorite: boolean) => {
        // Callback vide - la logique est gérée par le FavoriteButton
    };

    if (isLoading) {
        return <LoadingView />;
    }

    return (
        <View style={styles.container}>
            <SearchFilterBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                activities={allActivities}
                currentFilters={filters}
                searchText={searchText}
            />

            <InstitutionListView
                institutions={filteredInstitutions}
                isLoading={false}
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
                onFavoriteChange={handleFavoriteChange}
                sourceScreen="list"
                emptyStateConfig={{
                    icon: "business-outline",
                    title: "Aucune installation disponible",
                    subtitle: "Il n'y a actuellement aucune institution correspondant à vos critères.",
                }}
                favoritesRefreshKey={favoritesRefreshKey}
            />

            <Button
                title="Voir la carte"
                onPress={navigateToMap}
                variant="floating"
                icon="map-outline"
                iconSize={24}
                style={styles.floatingButton}
            />
        </View>
    );
}

const getStyles = (currentTheme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: currentTheme.background,
    },
    floatingButton: {
        position: "absolute",
        bottom: 25,
        alignSelf: "center",
    },
});
