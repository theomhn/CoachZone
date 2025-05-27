import { getThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { InstitutionFiltersProvider } from "@/contexts/InstitutionFiltersContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useTheme } from "@/hooks/useTheme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

function ThemedLayout() {
    const { theme, currentTheme } = useTheme();
    const isDarkMode = theme === "dark";

    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    // Définir les styles globaux pour TOUS les écrans de l'application
    const globalScreenOptions = {
        headerBackButtonDisplayMode: "minimal" as const,
        ...getThemeToggleButton(),
        // Appliquer les couleurs du thème au header
        headerStyle: {
            backgroundColor: currentTheme.background,
        },
        headerTintColor: currentTheme.text,
    };

    return (
        <>
            <Stack screenOptions={globalScreenOptions}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(coach)" options={{ headerShown: false }} />
                <Stack.Screen name="(institution)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <InstitutionFiltersProvider>
                <ThemedLayout />
            </InstitutionFiltersProvider>
        </ThemeProvider>
    );
}
