import { useTheme } from "@/hooks/useTheme";
import { BadgeProps } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Badge: React.FC<BadgeProps> = ({ text }) => {
    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{text}</Text>
        </View>
    );
};

const getStyles = (currentTheme: any) => StyleSheet.create({
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

export default Badge;
