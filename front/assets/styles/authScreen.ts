import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export default function (currentTheme: any) {
    return StyleSheet.create({
        // Styles communs
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        scrollContainer: {
            flexGrow: 1,
            padding: 20,
            justifyContent: "center",
        },
        logoContainer: {
            alignItems: "center",
            width: "100%",
        },
        logo: {
            width: 150,
            height: 150,
        },
        inputContainer: {
            marginBottom: 15,
        },
        label: {
            fontSize: 16,
            fontWeight: "600",
            color: currentTheme.text,
            marginBottom: 8,
        },
        input: {
            height: 50,
            color: currentTheme.text,
            borderWidth: 1,
            borderColor: currentTheme.lightBorder,
            borderRadius: 8,
            paddingHorizontal: 15,
            fontSize: 16,
            justifyContent: "center",
        },
        button: {
            backgroundColor: currentTheme.primary,
            height: 50,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
        },
        buttonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
        },
        linkButton: {
            marginTop: 20,
            alignItems: "center",
            marginBottom: 20,
        },
        linkText: {
            color: currentTheme.primary,
            fontSize: 16,
        },

        // Styles pour l'écran d'inscription
        typeSelector: {
            flexDirection: "row",
            marginBottom: 20,
            borderRadius: 30,
            backgroundColor: currentTheme.primary,
            padding: 4,
        },
        typeButton: {
            flex: 1,
            padding: 12,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 25,
        },
        selectedType: {
            backgroundColor: currentTheme.white,
        },
        typeText: {
            fontSize: 16,
            fontWeight: "bold",
            color: currentTheme.white,
            textTransform: "uppercase",
        },
        selectedTypeText: {
            color: currentTheme.black,
        },
        loadingContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        loadingText: {
            marginLeft: 10,
            color: currentTheme.secondaryText,
            fontSize: 14,
        },
        placeholderText: {
            color: currentTheme.secondaryText,
            fontSize: 16,
        },
        selectedText: {
            color: currentTheme.secondaryText,
            fontSize: 16,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
        },
        modalContent: {
            backgroundColor: currentTheme.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: height * 0.7,
        },
        modalHeader: {
            flexDirection: "row",
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.lightBorder,
            alignItems: "center",
        },
        searchInput: {
            flex: 1,
            height: 40,
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 8,
            paddingHorizontal: 15,
            fontSize: 16,
        },
        closeButton: {
            marginLeft: 10,
            padding: 8,
        },
        closeButtonText: {
            color: currentTheme.primary,
            fontSize: 16,
            fontWeight: "600",
        },
        institutionItem: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.lightBorder,
        },
        institutionName: {
            fontSize: 16,
            color: currentTheme.text,
        },
        institutionId: {
            color: currentTheme.secondaryText,
            fontSize: 14,
        },
        emptyListContainer: {
            padding: 20,
            alignItems: "center",
        },
        emptyListText: {
            fontSize: 16,
            color: currentTheme.grayMedium,
            textAlign: "center",
        },
    });
}
