import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface User {
    email: string;
    id: number;
    type: "coach" | "institution";
    firstName?: string;
    lastName?: string;
    work?: string;
    name?: string;
}

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userJson = await AsyncStorage.getItem("userData");
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible de charger les données utilisateur");
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove(["userToken", "userData"]);
            router.replace("/login");
        } catch (error) {
            Alert.alert("Erreur", "Erreur lors de la déconnexion");
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
                            <Text style={styles.label}>Nom de l'établissement</Text>
                            <Text style={styles.value}>{user.name}</Text>
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
