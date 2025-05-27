import { HapticTab } from "@/components/HapticTab";
import { getThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/hooks/useTheme";
import { Tabs } from "expo-router";
import React from "react";

export default function InstitutionLayout() {
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
            {/* Onglets visibles dans le menu */}
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
