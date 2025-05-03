/**
 * Système de couleurs de l'application
 */

// Conservation des valeurs de teinte originales
const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
    // Couleurs principales
    primary: "#007AFF",
    success: "#28a745",
    danger: "#ff3b30",
    tealPrimary: "#0a7ea4",

    // Blanc et noir
    white: "#fff",
    black: "#000",

    // Nuances de gris
    grayLightest: "#f5f5f5", // Arrière-plans, fonds clairs
    grayLight: "#eee", // Bordures légères, éléments désactivés
    grayMedium: "#ccc", // Bordures, éléments interactifs
    grayDark: "#777", // Texte secondaire, placeholders
    grayDarkest: "#333", // Texte principal

    // Variations de bleu
    blueLight: "#e1f5fe",
    blueLighter: "#f0f8ff",

    // Variations de vert
    greenLight: "#a0c7a9",

    // Thèmes
    light: {
        text: "#11181C",
        background: "#fff",
        tint: tintColorLight,
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: "#ECEDEE",
        background: "#151718",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,
    },
};
