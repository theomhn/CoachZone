import getStyles from "@/assets/styles/authScreen";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
    const [email, setEmail] = useState("coach@test.com");
    const [password, setPassword] = useState("test123");
    const [isLoading, setIsLoading] = useState(false);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Une erreur est survenue");
            }

            await SecureStore.setItemAsync("userToken", data);

            // Rediriger vers la racine, le layout principal gérera la redirection selon le type d'utilisateur
            router.replace("/");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
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
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={currentTheme.placeholder}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? "Chargement..." : "Se connecter"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} onPress={() => router.replace("/(auth)/register")}>
                    <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
