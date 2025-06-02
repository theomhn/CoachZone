import { StyleSheet } from "react-native";

export default function getStyles(currentTheme: any) {
    return StyleSheet.create({
        banner: {
            backgroundColor: currentTheme.danger,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
        },
        iconContainer: {
            marginRight: 12,
        },
        icon: {
            color: currentTheme.warning,
        },
        textContainer: {
            flex: 1,
        },
        title: {
            fontSize: 14,
            fontWeight: "600",
            color: currentTheme.white,
            marginBottom: 2,
        },
        subtitle: {
            fontSize: 12,
            color: currentTheme.white,
            opacity: 0.9,
        },
        button: {
            backgroundColor: currentTheme.white,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            marginLeft: 8,
        },
        buttonText: {
            fontSize: 12,
            fontWeight: "600",
            color: currentTheme.black,
        },
    });
}
