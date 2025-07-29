import { useTheme } from "@/hooks/useTheme";
import { CoachService } from "@/services";
import { FavoriteButtonProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

export default function FavoriteButton({ instNumero, size = 24, onFavoriteChange, style, initialState }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialState ?? false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(initialState === undefined);
    const { currentTheme } = useTheme();
    

    const checkIfFavorite = useCallback(async () => {
        try {
            const isInFavorites = await CoachService.isFavorite(instNumero);
            setIsFavorite(isInFavorites);
        } catch (error) {
            // Erreur silencieuse pour la vérification initiale
        } finally {
            setIsInitialLoading(false);
        }
    }, [instNumero]);

    // Vérifier si l'institution est déjà en favoris au montage (seulement si initialState n'est pas fourni)
    useEffect(() => {
        if (initialState === undefined) {
            checkIfFavorite();
        }
    }, [checkIfFavorite, initialState, instNumero]);

    const toggleFavorite = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const newFavoriteState = await CoachService.toggleFavorite(instNumero);
            setIsFavorite(newFavoriteState);
            onFavoriteChange?.(newFavoriteState);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Impossible de ${isFavorite ? "supprimer" : "ajouter"} ce favori`;
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={toggleFavorite} disabled={isLoading || isInitialLoading}>
            <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={size}
                color={isFavorite ? currentTheme.danger : currentTheme.secondaryText}
                style={{ opacity: (isLoading || isInitialLoading) ? 0.3 : 1 }}
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
