import { Dimensions, StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        centered: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        searchFilterContainer: {
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 1,
        },
        map: {
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
        },
        locationButton: {
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: currentTheme.background,
            borderRadius: 30,
            padding: 10,
            elevation: 5,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        icon: {
            color: currentTheme.primary,
        },
    });
}
