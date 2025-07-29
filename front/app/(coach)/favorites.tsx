import InstitutionListView from "@/components/ui/InstitutionListView";
import LoadingView from "@/components/ui/LoadingView";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Institution } from "@/types";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    const fetchFavorites = async () => {
        try {
            const token = await SecureStore.getItemAsync("userToken");
            if (!token) {
                Alert.alert("Erreur", "Token d'authentification non trouvé");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/coaches/me/favorites/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des favoris");
            }

            const data = await response.json();
            setFavorites(data.favoriteInstitutions);
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert("Erreur", "Impossible de charger les favoris");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    // Recharger les favoris à chaque fois qu'on revient sur cet écran
    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchFavorites();
    };

    const handleFavoriteRemoved = (instNumero: string, isFavorite: boolean) => {
        if (!isFavorite) {
            // L'institution a été supprimée des favoris, on met à jour la liste locale
            setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.inst_numero !== instNumero));
        }
    };

    const navigateToInstitutions = () => {
        router.push("/(coach)/institutions");
    };

    if (loading) {
        return <LoadingView text="Chargement des favoris..." />;
    }

    return (
        <View style={styles.container}>
            <InstitutionListView
                institutions={favorites}
                isLoading={false}
                isRefreshing={refreshing}
                onRefresh={onRefresh}
                onFavoriteChange={handleFavoriteRemoved}
                sourceScreen="favorites"
                emptyStateConfig={{
                    icon: "heart-outline",
                    title: "Aucun favori",
                    subtitle: "Vous n'avez pas encore ajouté d'institutions en favoris",
                    actionText: "Réserver maintenant une séance",
                    onActionPress: navigateToInstitutions,
                }}
            />
        </View>
    );
}

const getStyles = (currentTheme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: currentTheme.background,
    },
});
