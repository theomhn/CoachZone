import getStyles from "@/assets/styles/authScreen";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { InstitutionRegister } from "@/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type UserType = "coach" | "institution";

export default function RegisterScreen() {
    // Pour les coach
    const [userType, setUserType] = useState<UserType>("coach");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [work, setWork] = useState("");

    // Pour les institutions
    const [institutions, setInstitutions] = useState<InstitutionRegister[]>([]);
    const [filteredInstitutions, setFilteredInstitutions] = useState<InstitutionRegister[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedInstitution, setSelectedInstitution] = useState<InstitutionRegister | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Charger la liste des institutions
    useEffect(() => {
        if (userType === "institution") {
            fetchInstitutions();
        }
    }, [userType]);

    // Filtrer les institutions quand le texte de recherche change
    useEffect(() => {
        if (searchText) {
            const filtered = institutions.filter((institution) =>
                institution.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredInstitutions(filtered);
        } else {
            setFilteredInstitutions([]);
        }
    }, [searchText, institutions]);

    const fetchInstitutions = async () => {
        setIsLoadingInstitutions(true);
        try {
            const response = await fetch(`${API_BASE_URL}/opendata/institutions`);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des institutions");
            }
            const data = await response.json();

            // Transformer l'objet en tableau d'objets pour faciliter la manipulation
            const institutionsArray = Object.entries(data).map(([id, name]) => ({
                id,
                name: name as string,
            }));

            setInstitutions(institutionsArray);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de charger la liste des institutions");
            console.error(error);
        } finally {
            setIsLoadingInstitutions(false);
        }
    };

    const handleSelectInstitution = (institution: InstitutionRegister) => {
        setSelectedInstitution(institution);
        setSearchText(institution.name);
        setShowModal(false);
    };

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
            if (!selectedInstitution) {
                Alert.alert("Erreur", "Veuillez sélectionner votre établissement");
                return;
            }
            body = {
                type: "institution",
                email,
                password,
                inst_numero: selectedInstitution.id,
                inst_name: selectedInstitution.name,
            };
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
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

    const handleSearchFocus = () => {
        if (userType === "institution" && !isLoadingInstitutions) {
            setShowModal(true);
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

                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeButton, userType === "coach" && styles.selectedType]}
                        onPress={() => {
                            setUserType("coach");
                            setSelectedInstitution(null);
                            setSearchText("");
                        }}
                    >
                        <Text style={[styles.typeText, userType === "coach" && styles.selectedTypeText]}>Coach</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, userType === "institution" && styles.selectedType]}
                        onPress={() => setUserType("institution")}
                    >
                        <Text style={[styles.typeText, userType === "institution" && styles.selectedTypeText]}>
                            Institution
                        </Text>
                    </TouchableOpacity>
                </View>

                {userType === "coach" && (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Prénom</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Entrez votre prénom"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholderTextColor={currentTheme.placeholder}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nom</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Entrez votre nom"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholderTextColor={currentTheme.placeholder}
                            />
                        </View>
                    </>
                )}

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

                {userType === "coach" ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Profession</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Entrez votre profession"
                            value={work}
                            onChangeText={setWork}
                            placeholderTextColor={currentTheme.placeholder}
                        />
                    </View>
                ) : (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nom de l'établissement</Text>
                        {isLoadingInstitutions ? (
                            <View style={[styles.input, styles.loadingContainer]}>
                                <ActivityIndicator size="small" color={currentTheme.primary} />
                                <Text style={styles.loadingText}>Chargement des établissements...</Text>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.input} onPress={handleSearchFocus} activeOpacity={0.7}>
                                <Text style={selectedInstitution ? styles.selectedText : styles.placeholderText}>
                                    {selectedInstitution
                                        ? `${selectedInstitution.name} (${selectedInstitution.id})`
                                        : "Sélectionner un établissement"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? "Chargement..." : "S'inscrire"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton} onPress={() => router.replace("/login")}>
                    <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal pour la recherche d'établissements */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher un établissement"
                                value={searchText}
                                onChangeText={setSearchText}
                                autoFocus
                                placeholderTextColor={currentTheme.placeholder}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                                <Text style={styles.closeButtonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={searchText ? filteredInstitutions : institutions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.institutionItem}
                                    onPress={() => handleSelectInstitution(item)}
                                >
                                    <Text style={styles.institutionName}>
                                        {item.name} <Text style={styles.institutionId}>({item.id})</Text>
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyListContainer}>
                                    {searchText ? (
                                        <Text style={styles.emptyListText}>Aucun établissement trouvé</Text>
                                    ) : (
                                        <Text style={styles.emptyListText}>Commencez à taper pour rechercher</Text>
                                    )}
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
