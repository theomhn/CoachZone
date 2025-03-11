import { API_BASE_URL } from "@/config";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
    const [user, setUser] = useState(global.user);

    useEffect(() => {
        if (global.user) {
            setUser(global.user);
        } else {
            Alert.alert("Erreur", "Impossible de charger les données utilisateur");
        }
    }, []);

    const handleLogout = async () => {
        try {
            const userToken = await SecureStore.getItemAsync("userToken");

            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok || response.status === 204) {
                global.user = null;
                await SecureStore.deleteItemAsync("userToken");
                router.replace("/login");
            } else {
                try {
                    const errorData = await response.json();
                    Alert.alert("Erreur", errorData.message || "Erreur lors de la déconnexion");
                } catch {
                    Alert.alert("Erreur", "Erreur lors de la déconnexion");
                }
            }
        } catch (error) {
            console.error("Erreur de déconnexion :", error);
            global.user = null;
            await SecureStore.deleteItemAsync("userToken");
            router.replace("/login");
        }
    };

    if (!user) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mon Profil</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person-circle" size={80} color="#007AFF" />
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email}</Text>

                    {user.type === "coach" ? (
                        <>
                            <Text style={styles.label}>Prénom</Text>
                            <Text style={styles.value}>{user.firstName}</Text>

                            <Text style={styles.label}>Nom</Text>
                            <Text style={styles.value}>{user.lastName}</Text>

                            <Text style={styles.label}>Profession</Text>
                            <Text style={styles.value}>{user.work}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Code établissement</Text>
                            <Text style={styles.value}>{user.inst_numero}</Text>

                            <Text style={styles.label}>Nom de votre établissement</Text>
                            <Text style={styles.value}>{user.inst_name}</Text>
                        </>
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e1e1e1",
        backgroundColor: "#f8f8f8",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    infoSection: {
        backgroundColor: "#f8f8f8",
        padding: 15,
        borderRadius: 8,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginTop: 12,
    },
    value: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
        marginTop: 4,
    },
    logoutButton: {
        backgroundColor: "#ff3b30",
        margin: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
