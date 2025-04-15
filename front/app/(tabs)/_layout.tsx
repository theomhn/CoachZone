import { Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import { API_BASE_URL } from "@/config";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        checkAuth();
    });

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
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: true,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                /* tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: "absolute",
                    },
                    default: {},
                }), */
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
                name="map"
                options={{
                    title: "Carte",
                    tabBarIcon: ({ color }) => <IconSymbol name="map" size={28} color={color} />,
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
