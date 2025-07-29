import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from "react-native";

interface LoadingViewProps {
    text?: string;
    size?: "small" | "large";
    style?: ViewStyle;
    showText?: boolean;
}

const LoadingView: React.FC<LoadingViewProps> = ({
    text = "Chargement...",
    size = "large",
    style,
    showText = true,
}) => {
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    if (style && !style.flex) {
        return (
            <View style={[styles.inline, style]}>
                <ActivityIndicator size={size} color={currentTheme.primary} />
                {showText && <Text style={styles.inlineText}>{text}</Text>}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={currentTheme.primary} />
            {showText && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

const getStyles = (currentTheme: any) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: currentTheme.background,
        padding: 20,
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: currentTheme.secondaryText,
        textAlign: "center",
    },
    inline: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    inlineText: {
        marginLeft: 12,
        fontSize: 16,
        color: currentTheme.secondaryText,
    },
});

export default LoadingView;
