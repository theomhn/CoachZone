import Button from "@/components/Button";
import AuthFormContainer from "@/components/ui/AuthFormContainer";
import FormInput from "@/components/ui/FormInput";
import { API_BASE_URL } from "@/config";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Alert } from "react-native";

export default function LoginScreen() {
    const [email, setEmail] = useState("coach@test.com");
    const [password, setPassword] = useState("test123");
    const [isLoading, setIsLoading] = useState(false);


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
        <AuthFormContainer>
            <FormInput
                label="Email"
                placeholder="Entrez votre email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                required
            />

            <FormInput
                label="Mot de passe"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                required
            />

            <Button
                title={isLoading ? "Chargement..." : "Se connecter"}
                onPress={handleLogin}
                variant="primary"
                size="large"
                disabled={isLoading}
                loading={isLoading}
                fullWidth
            />

            <Button
                title="Mot de passe oublié ?"
                onPress={() => router.push({ pathname: "/(auth)/reset-password", params: { email } })}
                variant="link"
                style={{ marginTop: 20 }}
            />

            <Button
                title="Pas encore de compte ? S'inscrire"
                onPress={() => router.replace("/(auth)/register")}
                variant="link"
            />
        </AuthFormContainer>
    );
}
