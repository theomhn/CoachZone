import getStyles from "@/assets/styles/favoritesScreen";
import FavoriteButton from "@/components/FavoriteButton";
import InstitutionCard from "@/components/InstitutionCard";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Institution } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Récupérer le thème actuel et les couleurs associées
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

    const navigateToInstitutionDetails = (institutionId: string) => {
        router.push({
            pathname: "/institution-details" as any,
            params: {
                id: institutionId,
                source: "favorites", // Indiquer que l'on vient des favoris
            },
        });
    };

    const renderInstitution = ({ item }: { item: Institution }) => (
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
                    instNumero={item.inst_numero}
                    size={22}
                    onFavoriteChange={(isFavorite) => handleFavoriteRemoved(item.inst_numero, isFavorite)}
                    style={styles.favoriteButton}
                />
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={styles.loadingIndicator.color} />
                <Text style={styles.loadingText}>Chargement des favoris...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={64} color={styles.emptyIcon.color} />
                    <Text style={styles.emptyTitle}>Aucun favori</Text>
                    <Text style={styles.emptySubtitle}>Vous n'avez pas encore ajouté d'institutions en favoris</Text>
                    <TouchableOpacity style={styles.reservationButton} onPress={navigateToInstitutions}>
                        <Text style={styles.reservationButtonText}>Réserver maintenant une séance</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderInstitution}
                    keyExtractor={(item) => item.inst_numero}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={styles.refreshControl.tintColor}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
