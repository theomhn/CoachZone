import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

interface CardProps {
    children: React.ReactNode;
    variant?: "default" | "popup" | "booking" | "selection";
    state?: "normal" | "cancelled" | "selected";
    onPress?: () => void;
    shadow?: boolean;
    margin?: "default" | "none" | "small" | "large";
    style?: ViewStyle | ViewStyle[];
    disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    variant = "default",
    state = "normal",
    onPress,
    shadow = true,
    margin = "default",
    style,
    disabled = false,
}) => {
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    const getVariantStyle = () => {
        switch (variant) {
            case "popup":
                return styles.popupCard;
            case "booking":
                return styles.bookingCard;
            case "selection":
                return styles.selectionCard;
            default:
                return styles.defaultCard;
        }
    };

    const getStateStyle = () => {
        switch (state) {
            case "cancelled":
                return styles.cancelled;
            case "selected":
                return styles.selected;
            default:
                return {};
        }
    };

    const getMarginStyle = () => {
        switch (margin) {
            case "none":
                return styles.marginNone;
            case "small":
                return styles.marginSmall;
            case "large":
                return styles.marginLarge;
            default:
                return styles.marginDefault;
        }
    };

    const getShadowStyle = () => {
        if (!shadow) return {};
        return variant === "popup" ? styles.popupShadow : styles.shadow;
    };

    const cardStyle = [
        styles.baseCard,
        getVariantStyle(),
        getShadowStyle(),
        variant !== "popup" && getMarginStyle(),
        getStateStyle(),
        disabled && styles.disabled,
        style,
    ];

    if (onPress && !disabled) {
        return (
            <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyle}>{children}</View>;
};

const getStyles = (currentTheme: any) =>
    StyleSheet.create({
        baseCard: {
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 12,
        },
        defaultCard: {
            padding: 16,
        },
        popupCard: {
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            borderRadius: 15,
            padding: 16,
        },
        bookingCard: {
            padding: 16,
            borderRadius: 10,
        },
        selectionCard: {
            padding: 12,
            borderRadius: 8,
        },
        shadow: {
            elevation: 2,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        popupShadow: {
            elevation: 4,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        marginDefault: {
            marginVertical: 8,
        },
        marginSmall: {
            marginVertical: 4,
        },
        marginLarge: {
            marginVertical: 12,
        },
        marginNone: {
            margin: 0,
        },
        cancelled: {
            backgroundColor: currentTheme.lightBackground,
            borderWidth: 1,
            borderColor: currentTheme.border,
            opacity: 0.7,
        },
        selected: {
            borderWidth: 2,
            borderColor: currentTheme.primary,
        },
        disabled: {
            opacity: 0.6,
        },
    });

export default Card;
