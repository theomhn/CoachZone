import Themes from "@/constants/Themes";
import { ThemeContextType } from "@/types";
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// Définition du type pour les thèmes
export type ThemeType = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "app_theme";

// Création du contexte avec valeurs par défaut
export const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    setTheme: () => {},
    toggleTheme: () => {},
    currentTheme: Themes.dark,
});

// Props du ThemeProvider
interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const systemColorScheme = useColorScheme() as "light" | "dark" | null;
    const [theme, setThemeState] = useState<ThemeType>("dark"); // Changé de "light" à "dark"

    // Déterminer le thème actuel
    const getCurrentTheme = () => {
        if (theme === "system") {
            return systemColorScheme === "dark" ? Themes.dark : Themes.light;
        }
        return theme === "dark" ? Themes.dark : Themes.light;
    };

    const currentTheme = getCurrentTheme();

    useEffect(() => {
        loadSavedTheme();
    }, []);

    // Recharger si le thème système change
    useEffect(() => {
        if (theme === "system") {
            // Force un re-render quand le thème système change
            setThemeState("system");
        }
    }, [systemColorScheme]);

    const loadSavedTheme = async (): Promise<void> => {
        try {
            const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
            if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
                setThemeState(savedTheme as ThemeType);
            } else {
                // Utiliser le thème dark par défaut si pas de thème sauvegardé
                setThemeState("dark");
            }
        } catch (error) {
            console.error("Failed to load theme:", error);
        }
    };

    const setTheme = async (newTheme: ThemeType): Promise<void> => {
        setThemeState(newTheme);
        try {
            await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
    };

    const toggleTheme = async (): Promise<void> => {
        const newTheme: ThemeType = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, currentTheme }}>{children}</ThemeContext.Provider>
    );
}
