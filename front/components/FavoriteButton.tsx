import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { FavoriteButtonProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

export default function FavoriteButton({ instNumero, size = 24, onFavoriteChange, style }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { currentTheme } = useTheme();

    const checkIfFavorite = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync("userToken");
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/coaches/me/favorites/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                const isInFavorites = data.favoriteInstitutions.some((fav: any) => fav.inst_numero === instNumero);
                setIsFavorite(isInFavorites);
            }
        } catch (error) {
            console.error("Erreur lors de la vérification des favoris:", error);
        }
    }, [instNumero]);

    // Vérifier si l'institution est déjà en favoris au montage
    useEffect(() => {
        checkIfFavorite();
    }, [checkIfFavorite]);

    const toggleFavorite = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync("userToken");
            if (!token) {
                Alert.alert("Erreur", "Token d'authentification non trouvé");
                return;
            }

            const method = isFavorite ? "DELETE" : "POST";
            const response = await fetch(`${API_BASE_URL}/coaches/me/favorites/${instNumero}`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de ${isFavorite ? "la suppression" : "l'ajout"} du favori`);
            }

            const newFavoriteState = !isFavorite;
            setIsFavorite(newFavoriteState);

            // Notifier le parent du changement si callback fourni
            onFavoriteChange?.(newFavoriteState);

            // Message de succès discret (optionnel)
            // Alert.alert("Succès", isFavorite ? "Supprimé des favoris" : "Ajouté aux favoris");
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert("Erreur", `Impossible de ${isFavorite ? "supprimer" : "ajouter"} ce favori`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={toggleFavorite} disabled={isLoading}>
            <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={size}
                color={isFavorite ? currentTheme.danger : currentTheme.secondaryText}
                style={{ opacity: isLoading ? 0.5 : 1 }}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
        borderRadius: 8,
    },
});
