import getStyles from "@/assets/styles/PriceConfigurationBanner";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PriceConfigurationBannerProps {
    user: any;
    onPriceConfigured?: () => void;
}

const PriceConfigurationBanner = React.forwardRef<{ refresh: () => void }, PriceConfigurationBannerProps>(({ user, onPriceConfigured }, ref) => {
    const [placesWithoutPrice, setPlacesWithoutPrice] = useState<number>(0);
    const [shouldShow, setShouldShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    const checkPriceStatus = useCallback(async () => {
        if (!user || user.type !== "institution") {
            setShouldShow(false);
            return;
        }

        try {
            setIsLoading(true);
            const userToken = await SecureStore.getItemAsync("userToken");
            if (!userToken) {
                setShouldShow(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/places?inst_numero=${user.inst_numero}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                setShouldShow(false);
                return;
            }

            const places: Place[] = await response.json();
            const unconfiguredPlaces = places.filter((place) => place.price === null || place.price === undefined);

            setPlacesWithoutPrice(unconfiguredPlaces.length);
            const hasUnconfiguredPrices = unconfiguredPlaces.length > 0;
            setShouldShow(hasUnconfiguredPrices);

            // Callback quand les prix sont configurés
            if (!hasUnconfiguredPrices && onPriceConfigured) {
                onPriceConfigured();
            }
        } catch (error) {
            console.error("Erreur lors de la vérification des prix :", error);
            setShouldShow(false);
        } finally {
            setIsLoading(false);
        }
    }, [user, onPriceConfigured]);

    useEffect(() => {
        checkPriceStatus();
    }, [checkPriceStatus]);

    // Exposer la fonction refresh via ref
    React.useImperativeHandle(
        ref,
        () => ({
            refresh: checkPriceStatus,
        }),
        [checkPriceStatus]
    );

    const handleNavigateToProfile = () => {
        router.navigate("/(institution)/profile");
    };

    // Ne pas afficher la bannière si pas nécessaire
    if (!shouldShow || isLoading) {
        return null;
    }

    return (
        <View style={styles.banner}>
            <View style={styles.iconContainer}>
                <Ionicons name="warning" size={20} style={styles.icon} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Configuration des prix requise</Text>
                <Text style={styles.subtitle}>{placesWithoutPrice > 1 ? `${placesWithoutPrice} équipements sans prix` : `${placesWithoutPrice} équipement sans prix`}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleNavigateToProfile}>
                <Text style={styles.buttonText}>Configurer</Text>
            </TouchableOpacity>
        </View>
    );
});

PriceConfigurationBanner.displayName = "PriceConfigurationBanner";

export default PriceConfigurationBanner;
