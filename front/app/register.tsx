import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type UserType = "coach" | "institution";

export default function RegisterScreen() {
    const [userType, setUserType] = useState<UserType>("coach");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [work, setWork] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
            return;
        }

        let body;
        if (userType === "coach") {
            if (!firstName || !lastName || !work) {
                Alert.alert("Erreur", "Veuillez remplir tous les champs");
                return;
            }
            body = {
                type: "coach",
                email,
                password,
                firstName,
                lastName,
                work,
            };
        } else {
            if (!name) {
                Alert.alert("Erreur", "Veuillez remplir tous les champs");
                return;
            }
            body = {
                type: "institution",
                email,
                password,
                name,
            };
        }

        setIsLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Une erreur est survenue");
            }

            Alert.alert("Succès", "Inscription réussie !", [{ text: "OK", onPress: () => router.replace("/login") }]);
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
                <Text style={styles.title}>Inscription</Text>

                <View style={styles.typeSelector}>
                    <TouchableOpacity style={[styles.typeButton, userType === "coach" && styles.selectedType]} onPress={() => setUserType("coach")}>
                        <Text style={[styles.typeText, userType === "coach" && styles.selectedTypeText]}>Coach</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.typeButton, userType === "institution" && styles.selectedType]} onPress={() => setUserType("institution")}>
                        <Text style={[styles.typeText, userType === "institution" && styles.selectedTypeText]}>Institution</Text>
                    </TouchableOpacity>
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
                        placeholderTextColor="#666"
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
                        placeholderTextColor="#666"
                    />
                </View>

                {userType === "coach" ? (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Prénom</Text>
                            <TextInput style={styles.input} placeholder="Entrez votre prénom" value={firstName} onChangeText={setFirstName} placeholderTextColor="#666" />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nom</Text>
                            <TextInput style={styles.input} placeholder="Entrez votre nom" value={lastName} onChangeText={setLastName} placeholderTextColor="#666" />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Profession</Text>
                            <TextInput style={styles.input} placeholder="Entrez votre profession" value={work} onChangeText={setWork} placeholderTextColor="#666" />
                        </View>
                    </>
                ) : (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nom de l'établissement</Text>
                        <TextInput style={styles.input} placeholder="Entrez le nom de votre établissement" value={name} onChangeText={setName} placeholderTextColor="#666" />
                    </View>
                )}

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? "Chargement..." : "S'inscrire"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} onPress={() => router.replace("/login")}>
                    <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    typeSelector: {
        flexDirection: "row",
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        padding: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
    },
    selectedType: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    typeText: {
        color: "#000",
        fontSize: 16,
    },
    selectedTypeText: {
        color: "#fff",
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007AFF",
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    linkButton: {
        marginTop: 20,
        alignItems: "center",
        marginBottom: 20,
    },
    linkText: {
        color: "#007AFF",
        fontSize: 16,
    },
});
