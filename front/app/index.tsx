import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Place, User } from "@/types";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
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
        if (userData.type !== "ROLE_INSTITUTION") {
            setHasConfiguredPrices(true);
            return;
        }

        try {
            const userToken = await SecureStore.getItemAsync("userToken");
            if (!userToken) {
                setHasConfiguredPrices(true);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/places?inst_numero=${userData.inst_numero}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                setHasConfiguredPrices(true);
                return;
            }

            const places: Place[] = await response.json();
            const unconfiguredPlaces = places.filter((place) => place.price === null || place.price === undefined);

            setHasConfiguredPrices(unconfiguredPlaces.length === 0 || places.length === 0);
        } catch (error) {
            console.error("Erreur lors de la vérification des prix :", error);
            setHasConfiguredPrices(true);
        }
    };

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                setIsLoading(false);
                return;
            }

            // Récupération des données utilisateur
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                global.user = userData;

                // Vérifier les prix seulement pour les institutions
                if (userData.type === "ROLE_INSTITUTION") {
                    await checkPriceStatus(userData);
                }
            } else {
                // Si la requête échoue
                await SecureStore.deleteItemAsync("userToken");
            }
        } catch (error) {
            await Promise.all([SecureStore.deleteItemAsync("userToken"), SecureStore.deleteItemAsync("userData")]);
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
