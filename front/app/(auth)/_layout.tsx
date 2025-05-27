import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Pas d'en-tête pour les écrans d'authentification
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    );
}
