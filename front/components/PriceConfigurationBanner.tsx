import { useTheme } from "@/hooks/useTheme";
import { PlaceService } from "@/services";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PriceConfigurationBannerProps {
    user: any;
    onPriceConfigured?: () => void;
}

const PriceConfigurationBanner = React.forwardRef<{ refresh: () => void }, PriceConfigurationBannerProps>(
    ({ user, onPriceConfigured }, ref) => {
        const [placesWithoutPrice, setPlacesWithoutPrice] = useState<number>(0);
        const [shouldShow, setShouldShow] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const { currentTheme } = useTheme();
        const styles = getStyles(currentTheme);

        const checkPriceStatus = useCallback(async () => {
            if (!user || user.type !== "ROLE_INSTITUTION") {
                setShouldShow(false);
                return;
            }

            try {
                setIsLoading(true);
                const result = await PlaceService.checkPriceStatus(user.inst_numero);
                
                setPlacesWithoutPrice(result.placesWithoutPrice);
                const hasUnconfiguredPrices = !result.hasConfiguredPrices;
                setShouldShow(hasUnconfiguredPrices);

                if (result.hasConfiguredPrices && onPriceConfigured) {
                    onPriceConfigured();
                }
            } catch (error) {
                // Si erreur 401, l'utilisateur n'est plus authentifié - pas d'alerte
                if (error instanceof Error && error.message.includes("401")) {
                    setShouldShow(false);
                    return;
                }
                
                console.warn("Vérification des prix échouée:", error instanceof Error ? error.message : error);
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
                    <Text style={styles.subtitle}>
                        {placesWithoutPrice > 1
                            ? `${placesWithoutPrice} équipements sans prix`
                            : `${placesWithoutPrice} équipement sans prix`}
                    </Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleNavigateToProfile}>
                    <Text style={styles.buttonText}>Configurer</Text>
                </TouchableOpacity>
            </View>
        );
    }
);

PriceConfigurationBanner.displayName = "PriceConfigurationBanner";

const getStyles = (currentTheme: any) => StyleSheet.create({
    banner: {
        backgroundColor: currentTheme.danger,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: currentTheme.border,
    },
    iconContainer: {
        marginRight: 12,
    },
    icon: {
        color: currentTheme.warning,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: currentTheme.white,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: currentTheme.white,
        opacity: 0.9,
    },
    button: {
        backgroundColor: currentTheme.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: "600",
        color: currentTheme.black,
    },
});

export default PriceConfigurationBanner;
