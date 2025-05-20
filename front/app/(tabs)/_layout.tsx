import { HapticTab } from "@/components/HapticTab";
import { getThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { router, Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";

export default function TabLayout() {
    // Utiliser notre hook de thème personnalisé à la place
    const { currentTheme } = useTheme();
    const [user, setUser] = useState(global.user);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                router.replace("/login");
            } else {
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
                    router.replace("/login");
                }
            }
        } catch (error) {
            await Promise.all([SecureStore.deleteItemAsync("userToken"), SecureStore.deleteItemAsync("userData")]);
            router.replace("/login");
        }
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: true, // Détermine si l'en-tête (header) est visible ou non
                tabBarButton: HapticTab,
                ...getThemeToggleButton(), // Ajoute un bouton de basculement de thème dans le header pour tous les écrans

                // Styles pour l'en-tête (header)
                headerStyle: {
                    backgroundColor: currentTheme.background, // Couleur d'arrière-plan de l'en-tête
                },
                headerTintColor: currentTheme.text, // Couleur du texte et des icônes dans l'en-tête, affecte le titre et les boutons de navigation

                // Styles pour la barre d'onglets (menu)
                tabBarStyle: {
                    backgroundColor: currentTheme.background, // Couleur d'arrière-plan de la barre d'onglets
                    borderTopColor: currentTheme.border, // Couleur de la bordure supérieure de la barre d'onglets
                },
                tabBarActiveTintColor: currentTheme.icon, // Définit la couleur des icônes et du texte des onglets actifs
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Accueil",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="my-bookings"
                options={{
                    title: "Mes réservations",
                    tabBarIcon: ({ color }) => <IconSymbol name="calendar" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />
        </Tabs>
    );
}
