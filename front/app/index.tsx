import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { User } from "@/types";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function IndexScreen() {
    const { currentTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

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
    if (isLoading) {
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

    if (user.type === "coach") {
        return <Redirect href="/(coach)/institutions" />;
    }

    if (user.type === "institution") {
        return <Redirect href="/(institution)/my-bookings" />;
    }

    // Par défaut, rediriger vers l'authentification
    return <Redirect href="/(auth)/login" />;
}
