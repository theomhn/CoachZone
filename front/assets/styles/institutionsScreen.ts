import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
            padding: 16,
        },
        centered: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        listContainer: {
            paddingBottom: 80,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 32,
        },
        emptyText: {
            fontSize: 16,
            color: currentTheme.secondaryText,
            textAlign: "center",
        },
        floatingMapButton: {
            position: "absolute",
            bottom: 25,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: currentTheme.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 30,
            elevation: 5,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        icon: {
            color: currentTheme.white,
        },
        mapButtonText: {
            color: currentTheme.white,
            marginLeft: 8,
            fontWeight: "600",
            fontSize: 16,
        },
    });
}
