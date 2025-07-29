import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "./Button";

interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    primaryButton?: {
        text: string;
        onPress: () => void;
        loading?: boolean;
        disabled?: boolean;
    };
    secondaryButton?: {
        text: string;
        onPress: () => void;
        disabled?: boolean;
    };
    showCloseIcon?: boolean;
    scrollable?: boolean;
    size?: "small" | "medium" | "large";
    animationType?: "slide" | "fade" | "none";
}

export default function BaseModal({
    visible,
    onClose,
    title,
    children,
    primaryButton,
    secondaryButton,
    showCloseIcon = true,
    scrollable = false,
    size = "medium",
    animationType = "slide",
}: BaseModalProps) {
    const { currentTheme } = useTheme();

    const getSizeStyles = () => {
        switch (size) {
            case "small":
                return {
                    width: "85%" as const,
                    maxWidth: 350,
                    maxHeight: "70%" as const,
                };
            case "large":
                return {
                    width: "100%" as const,
                    maxWidth: 600,
                    maxHeight: "95%" as const,
                    minHeight: 600,
                };
            default: // medium
                return {
                    width: "90%" as const,
                    maxWidth: 400,
                    maxHeight: "80%" as const,
                };
        }
    };

    const styles = getStyles(currentTheme, getSizeStyles(), scrollable);

    const ContentWrapper = scrollable ? ScrollView : View;
    const contentProps = scrollable
        ? {
              style: styles.content,
              showsVerticalScrollIndicator: true,
              contentContainerStyle: styles.scrollContent,
          }
        : { style: styles.content };

    return (
        <Modal visible={visible} animationType={animationType} transparent>
            <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        {showCloseIcon && (
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ContentWrapper {...contentProps}>{children}</ContentWrapper>

                    {(primaryButton || secondaryButton) && (
                        <View style={styles.buttonContainer}>
                            {secondaryButton && (
                                <Button
                                    title={secondaryButton.text}
                                    onPress={secondaryButton.onPress}
                                    variant="danger"
                                    disabled={secondaryButton.disabled}
                                    fullWidth
                                />
                            )}

                            {primaryButton && (
                                <Button
                                    title={primaryButton.text}
                                    onPress={primaryButton.onPress}
                                    variant="success"
                                    disabled={primaryButton.disabled}
                                    loading={primaryButton.loading}
                                    fullWidth
                                />
                            )}
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const getStyles = (currentTheme: any, sizeStyles: any, scrollable: boolean) => ({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center" as const,
        alignItems: "center" as const,
        padding: 20,
    },
    modalContent: {
        backgroundColor: currentTheme.background,
        borderRadius: 15,
        padding: 20,
        ...sizeStyles,
    },
    header: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold" as const,
        color: currentTheme.text,
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    content: {
        flex: scrollable ? 1 : undefined,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    buttonContainer: {
        flexDirection: "column" as const,
        gap: 10,
        marginTop: 20,
    },
});
