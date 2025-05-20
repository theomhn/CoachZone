import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        contentWrapper: {
            flex: 1,
        },
        modalContainer: {
            flex: 1,
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "100%", // Plein écran
            elevation: 5,
            backgroundColor: currentTheme.primary,
        },
        modalContent: {
            flex: 1,
            padding: 20,
            backgroundColor: currentTheme.background,
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: currentTheme.text,
        },
        themesContainer: {
            marginTop: 10,
            gap: 16,
            paddingBottom: 20, // Ajouter un peu d'espace en bas
        },
        themeOption: {
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            backgroundColor: currentTheme.backgroundButton,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "transparent",
            marginBottom: 10,
        },
        icons: {
            color: currentTheme.icon,
        },
        selectedOption: {
            borderColor: currentTheme.primary,
        },
        themeIconContainer: {
            marginRight: 15,
        },
        themeText: {
            fontSize: 16,
            flex: 1,
            color: currentTheme.textButton,
        },
        checkIconContainer: {
            width: 24,
            height: 24,
            justifyContent: "center",
            alignItems: "center",
        },
        checkIcon: {
            color: currentTheme.tint,
        },
        iconPrimary: {
            color: currentTheme.primary,
        },
        icon: {
            color: currentTheme.text,
        },
    });
}
