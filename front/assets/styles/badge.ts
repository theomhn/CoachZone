import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        badge: {
            backgroundColor: currentTheme.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
        },
        badgeText: {
            color: currentTheme.white,
            fontSize: 12,
            fontWeight: "500",
        },
    });
}
