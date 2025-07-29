import InstitutionListView from "@/components/ui/InstitutionListView";
import LoadingView from "@/components/ui/LoadingView";
import { useTheme } from "@/hooks/useTheme";
import { CoachService } from "@/services";
import { Institution } from "@/types";
import { router, useFocusEffect } from "expo-router";
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
            const data = await CoachService.getFavorites();
            
            // Vérifier que data est bien un tableau
            if (Array.isArray(data)) {
                // Les données sont directement les institutions favoris
                const validInstitutions = data
                    .filter(fav => fav && fav.inst_numero) // Éliminer les null/undefined et vérifier inst_numero
                    .map(fav => ({
                        // Convertir au format Institution attendu par le composant
                        inst_numero: fav.inst_numero,
                        inst_name: fav.inst_name,
                        adresse: fav.adresse,
                        ville: fav.ville,
                        activites: fav.activites,
                        equipements: fav.equipements,
                        coordonnees: fav.coordonnees,
                        places: [] // Pas de places dans les favoris
                    }));
                
                setFavorites(validInstitutions);
            } else {
                console.warn("Les données des favoris ne sont pas un tableau:", data);
                setFavorites([]);
            }
        } catch (error) {
            setFavorites([]);
            const errorMessage = error instanceof Error ? error.message : "Impossible de charger les favoris";
            Alert.alert("Erreur", errorMessage);
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
            setFavorites((prevFavorites) => 
                prevFavorites.filter((fav) => fav && fav.inst_numero && fav.inst_numero !== instNumero)
            );
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
        paddingTop: 16, // Ajouter un padding en haut pour éviter que le premier élément touche le header
    },
});
