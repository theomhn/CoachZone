import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BadgeProps {
    text: string;
    color?: string;
    backgroundColor?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, color = "#0288d1", backgroundColor = "#e1f5fe" }) => {
    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={[styles.badgeText, { color }]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "500",
    },
});

export default Badge;
