import styles from "@/assets/styles/badge";
import { BadgeProps } from "@/types";
import React from "react";
import { Text, View } from "react-native";

const Badge: React.FC<BadgeProps> = ({ text, color = "#0288d1", backgroundColor = "#e1f5fe" }) => {
    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={[styles.badgeText, { color }]}>{text}</Text>
        </View>
    );
};

export default Badge;
