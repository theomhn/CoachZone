import getStyles from "@/assets/styles/badge";
import { useTheme } from "@/hooks/useTheme";
import { BadgeProps } from "@/types";
import React from "react";
import { Text, View } from "react-native";

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

export default Badge;
