import styles from "@/assets/styles/badge";
import { Colors } from "@/constants/Colors";
import { BadgeProps } from "@/types";
import React from "react";
import { Text, View } from "react-native";

const Badge: React.FC<BadgeProps> = ({ text, color = Colors.primary, backgroundColor = Colors.blueLight }) => {
    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={[styles.badgeText, { color }]}>{text}</Text>
        </View>
    );
};

export default Badge;
