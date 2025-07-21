import getStyles from "@/assets/styles/favoritesScreen";
import Badge from "@/components/Badge";
import FavoriteButton from "@/components/FavoriteButton";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Institution } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, View } from "react-native";

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

    const renderInstitution = ({ item }: { item: Institution }) => (
        <View style={styles.institutionCard}>
            <View style={styles.institutionHeader}>
                <View style={styles.institutionInfo}>
                    <Text style={styles.institutionName}>{item.inst_name}</Text>
                    <Text style={styles.institutionNumber}>N° {item.inst_numero}</Text>
                    <Text style={styles.institutionAddress}>{item.adresse}, {item.ville}</Text>
                    {item.coordonnees && (
                        <Text style={styles.coordinates}>
                            📍 {item.coordonnees.lat.toFixed(4)}, {item.coordonnees.lon.toFixed(4)}
                        </Text>
                    )}
                </View>
                <FavoriteButton
                    instNumero={item.inst_numero}
                    size={24}
                    onFavoriteChange={(isFavorite) => handleFavoriteRemoved(item.inst_numero, isFavorite)}
                    style={styles.favoriteButton}
                />
            </View>

            {Object.keys(item.activites).length > 0 && (
                <View style={styles.activitiesContainer}>
                    <Text style={styles.sectionTitle}>Activités disponibles</Text>
                    <View style={styles.activitiesList}>
                        {Object.entries(item.activites).map(([key, value]) => (
                            <Badge key={key} text={value} />
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.equipmentsContainer}>
                <Text style={styles.sectionTitle}>Équipements</Text>
                <View style={styles.equipmentsList}>
                    <View style={styles.equipmentItem}>
                        <Ionicons
                            name={item.equipements.douches ? "checkmark-circle" : "close-circle"}
                            size={20}
                            color={item.equipements.douches ? styles.successIcon.color : styles.errorIcon.color}
                        />
                        <Text style={styles.equipmentText}>Douches</Text>
                    </View>
                    <View style={styles.equipmentItem}>
                        <Ionicons
                            name={item.equipements.sanitaires ? "checkmark-circle" : "close-circle"}
                            size={20}
                            color={item.equipements.sanitaires ? styles.successIcon.color : styles.errorIcon.color}
                        />
                        <Text style={styles.equipmentText}>Sanitaires</Text>
                    </View>
                </View>
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
