import { HapticTab } from "@/components/HapticTab";
import { getThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function CoachLayout() {
    const { currentTheme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarButton: HapticTab,
                ...getThemeToggleButton(),

                // Styles pour l'en-tête (header)
                headerStyle: {
                    backgroundColor: currentTheme.background,
                },
                headerTintColor: currentTheme.text,

                // Styles pour la barre d'onglets (menu)
                tabBarStyle: {
                    backgroundColor: currentTheme.background,
                    borderTopColor: currentTheme.border,
                },
                tabBarActiveTintColor: currentTheme.icon,
            }}
        >
            <Tabs.Screen
                name="institutions"
                options={{
                    title: "Accueil",
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="my-bookings"
                options={{
                    title: "Mes réservations",
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Mes favoris",
                    tabBarIcon: ({ color }) => <Ionicons name="heart" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}
