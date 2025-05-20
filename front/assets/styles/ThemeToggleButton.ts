import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            marginRight: 16,
        },
        button: {
            padding: 0,
        },
        iconPrimary: {
            color: currentTheme.primary,
        },
    });
}
