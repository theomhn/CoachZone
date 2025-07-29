import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";

interface AuthFormContainerProps {
    children: React.ReactNode;
    showLogo?: boolean;
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({ children, showLogo = true }) => {
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                <View style={styles.contentContainer}>
                    {showLogo && (
                        <View style={styles.logoContainer}>
                            <Image
                                source={require("@/assets/images/logo.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                    {children}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const getStyles = (currentTheme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        scrollContainer: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 40,
            paddingBottom: 40,
            justifyContent: "center",
        },
        logoContainer: {
            alignItems: "center",
            width: "100%",
            marginBottom: 20,
        },
        logo: {
            width: 150,
            height: 150,
        },
        contentContainer: {
            flex: 1,
            justifyContent: "center",
        },
    });

export default AuthFormContainer;
