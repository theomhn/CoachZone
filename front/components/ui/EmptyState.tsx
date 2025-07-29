import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface EmptyStateProps {
    icon?: any;
    title: string;
    subtitle?: string;
    actionText?: string;
    onActionPress?: () => void;
    style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = "inbox-outline",
    title,
    subtitle,
    actionText,
    onActionPress,
    style,
}) => {
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    return (
        <View style={[styles.container, style]}>
            <Ionicons name={icon} size={64} style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {actionText && onActionPress && (
                <TouchableOpacity style={styles.actionButton} onPress={onActionPress} activeOpacity={0.7}>
                    <Text style={styles.actionButtonText}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const getStyles = (currentTheme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
        },
        icon: {
            color: currentTheme.icon,
            marginBottom: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: "600",
            color: currentTheme.text,
            textAlign: "center",
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: currentTheme.secondaryText,
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 24,
        },
        actionButton: {
            backgroundColor: currentTheme.primary,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 24,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
        },
        actionButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
        },
    });

export default EmptyState;
