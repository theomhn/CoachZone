import { useTheme } from "@/hooks/useTheme";
import { AuthService, PlaceService } from "@/services";
import { User } from "@/types";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function IndexScreen() {
    const { currentTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [hasConfiguredPrices, setHasConfiguredPrices] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkPriceStatus = async (userData: User) => {
        if (userData.type !== "ROLE_INSTITUTION" || !userData.inst_numero) {
            setHasConfiguredPrices(true);
            return;
        }

        try {
            // Vérifier à nouveau l'authentification avant de faire la requête
            const isStillAuthenticated = await AuthService.isAuthenticated();
            if (!isStillAuthenticated) {
                setHasConfiguredPrices(true);
                return;
            }

            const result = await PlaceService.checkPriceStatus(userData.inst_numero);
            setHasConfiguredPrices(result.hasConfiguredPrices);
        } catch (error) {
            // Si erreur 401, l'utilisateur n'est plus authentifié - pas d'alerte
            if (error instanceof Error && error.message.includes("401")) {
                setHasConfiguredPrices(true);
                return;
            }
            
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de la vérification des prix";
            console.warn("Vérification des prix échouée:", errorMessage);
            setHasConfiguredPrices(true);
        }
    };

    const checkAuth = async () => {
        try {
            const isAuthenticated = await AuthService.isAuthenticated();
            
            if (!isAuthenticated) {
                setUser(null);
                global.user = null;
                setIsLoading(false);
                return;
            }

            const userData = await AuthService.getCurrentUser();
            setUser(userData);
            global.user = userData;

            if (userData.type === "ROLE_INSTITUTION") {
                await checkPriceStatus(userData);
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de l'authentification:", error);
            await AuthService.clearToken();
            setUser(null);
            global.user = null;
        } finally {
            setIsLoading(false);
        }
    };

    // Afficher un loader pendant la vérification
    if (isLoading || (user?.type === "ROLE_INSTITUTION" && hasConfiguredPrices === null)) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: currentTheme.background,
                }}
            >
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    // Rediriger selon l'état de l'utilisateur
    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user.type === "ROLE_COACH") {
        return <Redirect href="/(coach)/institutions" />;
    }

    if (user.type === "ROLE_INSTITUTION") {
        // Vérifier si l'institution a configuré au moins un prix
        if (hasConfiguredPrices === false) {
            return <Redirect href="/(institution)/profile" />;
        }
        return <Redirect href="/(institution)/my-bookings" />;
    }

    // Par défaut, rediriger vers l'authentification
    return <Redirect href="/(auth)/login" />;
}
