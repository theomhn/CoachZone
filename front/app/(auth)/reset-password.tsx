import getStyles from "@/assets/styles/authScreen";
import { useTheme } from "@/hooks/useTheme";
import { AuthService } from "@/services";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ResetPasswordScreen() {
    const { email: prefilledEmail } = useLocalSearchParams();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    useEffect(() => {
        if (prefilledEmail && typeof prefilledEmail === "string") {
            setEmail(prefilledEmail);
        }
    }, [prefilledEmail]);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Erreur", "Veuillez entrer votre adresse email");
            return;
        }

        setIsLoading(true);
        try {
            await AuthService.forgotPassword({ email });
            Alert.alert(
                "Email envoyé",
                "Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/(auth)/login"),
                    },
                ]
            );
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Réinitialiser le mot de passe</Text>
                    <Text style={styles.subtitle}>
                        Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Entrez votre email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? "Envoi en cours..." : "Envoyer le lien"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} onPress={() => router.replace("/(auth)/login")}>
                    <Text style={styles.linkText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
