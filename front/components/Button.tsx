import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "link" | "floating" | "selection";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
    title?: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconSize?: number;
    iconPosition?: "left" | "right";
    selected?: boolean;
    style?: StyleProp<ViewStyle>;
    fullWidth?: boolean;
    activeOpacity?: number;
}

export default function Button({
    title,
    onPress,
    variant = "primary",
    size = "medium",
    disabled = false,
    loading = false,
    icon,
    iconSize,
    iconPosition = "left",
    selected = false,
    style,
    fullWidth = false,
    activeOpacity = 0.7,
}: ButtonProps) {
    const { currentTheme } = useTheme();

    const styles = getStyles(currentTheme, variant, size, selected, disabled, fullWidth);
    const iconSizeValue = iconSize || getIconSize(size);

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="small" color={styles.text.color} />;
        }

        const textElement = title ? <Text style={styles.text}>{title}</Text> : null;
        const iconElement = icon ? (
            <Ionicons
                name={icon}
                size={iconSizeValue}
                color={styles.text.color}
                style={{
                    marginRight: iconPosition === "left" && title ? 8 : 0,
                    marginLeft: iconPosition === "right" && title ? 8 : 0,
                }}
            />
        ) : null;

        if (!icon) return textElement;
        if (!title) return iconElement;

        return iconPosition === "left" ? (
            <>
                {iconElement}
                {textElement}
            </>
        ) : (
            <>
                {textElement}
                {iconElement}
            </>
        );
    };

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={activeOpacity}
        >
            {renderContent()}
        </TouchableOpacity>
    );
}

const getIconSize = (size: ButtonSize): number => {
    switch (size) {
        case "small":
            return 16;
        case "large":
            return 24;
        default:
            return 20;
    }
};

const getStyles = (
    currentTheme: any,
    variant: ButtonVariant,
    size: ButtonSize,
    selected: boolean,
    disabled: boolean,
    fullWidth: boolean
) => {
    // Couleurs de base selon le variant
    const getColors = () => {
        switch (variant) {
            case "primary":
                return {
                    backgroundColor: selected ? currentTheme.primaryDark || currentTheme.primary : currentTheme.primary,
                    textColor: currentTheme.white,
                    borderColor: currentTheme.primary,
                };
            case "secondary":
                return {
                    backgroundColor: "transparent",
                    textColor: currentTheme.primary,
                    borderColor: currentTheme.border,
                };
            case "success":
                return {
                    backgroundColor: currentTheme.success,
                    textColor: currentTheme.white,
                    borderColor: currentTheme.success,
                };
            case "danger":
                return {
                    backgroundColor: currentTheme.danger,
                    textColor: currentTheme.white,
                    borderColor: currentTheme.danger,
                };
            case "link":
                return {
                    backgroundColor: "transparent",
                    textColor: currentTheme.primary,
                    borderColor: "transparent",
                };
            case "floating":
                return {
                    backgroundColor: currentTheme.primary,
                    textColor: currentTheme.white,
                    borderColor: currentTheme.primary,
                };
            case "selection":
                return {
                    backgroundColor: selected ? currentTheme.primary : currentTheme.cardBackground,
                    textColor: selected ? currentTheme.white : currentTheme.text,
                    borderColor: selected ? currentTheme.primary : currentTheme.border,
                };
            default:
                return {
                    backgroundColor: currentTheme.primary,
                    textColor: currentTheme.white,
                    borderColor: currentTheme.primary,
                };
        }
    };

    // Dimensions selon la taille
    const getDimensions = () => {
        switch (size) {
            case "small":
                return {
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: "500" as const,
                    height: undefined,
                };
            case "large":
                return {
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    fontSize: 18,
                    fontWeight: "600" as const,
                    height: variant === "primary" || variant === "success" || variant === "danger" ? 50 : undefined,
                };
            default: // medium
                return {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: "600" as const,
                    height: variant === "primary" || variant === "success" || variant === "danger" ? 50 : undefined,
                };
        }
    };

    // Styles spéciaux pour floating
    const getFloatingStyles = () => {
        if (variant === "floating") {
            return {
                position: "absolute" as const,
                elevation: 5,
                shadowColor: currentTheme.shadow || "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                borderRadius: 30,
                paddingVertical: 12,
                paddingHorizontal: 20,
            };
        }
        return {};
    };

    const colors = getColors();
    const dimensions = getDimensions();
    const floatingStyles = getFloatingStyles();

    // Application de l'opacité si disabled
    const finalBackgroundColor = disabled
        ? variant === "link" || variant === "secondary"
            ? colors.backgroundColor
            : `${colors.backgroundColor}80` // 50% d'opacité
        : colors.backgroundColor;

    const finalTextColor = disabled ? `${colors.textColor}80` : colors.textColor;

    return {
        button: {
            backgroundColor: finalBackgroundColor,
            borderWidth: variant === "secondary" || variant === "selection" ? 1 : 0,
            borderColor: colors.borderColor,
            borderRadius: dimensions.borderRadius,
            paddingVertical: dimensions.paddingVertical,
            paddingHorizontal: dimensions.paddingHorizontal,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            flexDirection: "row" as const,
            height: dimensions.height,
            width: fullWidth ? ("100%" as const) : undefined,
            ...floatingStyles,
        },
        text: {
            color: finalTextColor,
            fontSize: dimensions.fontSize,
            fontWeight: dimensions.fontWeight,
            textAlign: "center" as const,
        },
    };
};
