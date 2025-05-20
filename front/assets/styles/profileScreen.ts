import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        header: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
            backgroundColor: currentTheme.background,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: currentTheme.text,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        iconContainer: {
            alignItems: "center",
            marginBottom: 20,
        },
        icon: {
            color: currentTheme.primary,
        },
        infoSection: {
            backgroundColor: currentTheme.lightBackground,
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            color: currentTheme.text,
            marginTop: 12,
        },
        value: {
            fontSize: 16,
            color: currentTheme.text,
            fontWeight: "500",
            marginTop: 4,
        },
        placesSection: {
            backgroundColor: currentTheme.lightBackground,
            padding: 15,
            borderRadius: 8,
            marginTop: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: currentTheme.text,
            marginBottom: 15,
        },
        priceExplanation: {
            color: currentTheme.text,
            fontStyle: "italic",
            marginBottom: 15,
            fontSize: 14,
        },
        placeItem: {
            marginBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
            paddingBottom: 15,
        },
        placeName: {
            fontSize: 16,
            fontWeight: "500",
            color: currentTheme.text,
            marginBottom: 8,
        },
        priceInputContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        priceInputWrapper: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: currentTheme.border,
            borderRadius: 4,
            backgroundColor: currentTheme.white,
            marginRight: 10,
            paddingRight: 8,
        },
        priceInput: {
            flex: 1,
            padding: 8,
        },
        euroSymbol: {
            fontSize: 16,
            color: currentTheme.secondaryText,
            fontWeight: "500",
        },
        updateButton: {
            backgroundColor: currentTheme.primary,
            padding: 10,
            borderRadius: 4,
            minWidth: 100,
            alignItems: "center",
        },
        updateButtonText: {
            color: currentTheme.white,
            fontWeight: "500",
        },
        noPlacesText: {
            color: currentTheme.secondaryText,
            fontStyle: "italic",
            textAlign: "center",
            marginVertical: 15,
        },
        loader: {
            marginVertical: 20,
        },
        logoutButton: {
            backgroundColor: currentTheme.danger,
            margin: 20,
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
        },
        logoutButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
        },
    });
}
