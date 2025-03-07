import { Institution } from "@/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
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
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Charger la liste des institutions
    useEffect(() => {
        if (userType === "institution") {
            fetchInstitutions();
        }
    }, [userType]);

    // Filtrer les institutions quand le texte de recherche change
    useEffect(() => {
        if (searchText) {
            const filtered = institutions.filter((institution) => institution.name.toLowerCase().includes(searchText.toLowerCase()));
            setFilteredInstitutions(filtered);
        } else {
            setFilteredInstitutions([]);
        }
    }, [searchText, institutions]);

    const fetchInstitutions = async () => {
        setIsLoadingInstitutions(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/opendata/institutions");
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

    const handleSelectInstitution = (institution: Institution) => {
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

    const handleSearchFocus = () => {
        if (userType === "institution" && !isLoadingInstitutions) {
            setShowModal(true);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Inscription</Text>

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
                        {isLoadingInstitutions ? (
                            <View style={[styles.input, styles.loadingContainer]}>
                                <ActivityIndicator size="small" color="#007AFF" />
                                <Text style={styles.loadingText}>Chargement des établissements...</Text>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.input} onPress={handleSearchFocus} activeOpacity={0.7}>
                                <Text style={selectedInstitution ? styles.selectedText : styles.placeholderText}>
                                    {selectedInstitution ? `${selectedInstitution.name} (${selectedInstitution.id})` : "Sélectionner un établissement"}
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
            <Modal visible={showModal} transparent={true} animationType="slide" onRequestClose={() => setShowModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher un établissement"
                                value={searchText}
                                onChangeText={setSearchText}
                                autoFocus
                                placeholderTextColor="#666"
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                                <Text style={styles.closeButtonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={searchText ? filteredInstitutions : institutions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.institutionItem} onPress={() => handleSelectInstitution(item)}>
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

const { width, height } = Dimensions.get("window");

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
        justifyContent: "center",
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
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginLeft: 10,
        color: "#666",
        fontSize: 14,
    },
    placeholderText: {
        color: "#666",
        fontSize: 16,
    },
    selectedText: {
        color: "#333",
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.7,
    },
    modalHeader: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    closeButton: {
        marginLeft: 10,
        padding: 8,
    },
    closeButtonText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    institutionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    institutionName: {
        fontSize: 16,
        color: "#333",
    },
    institutionId: {
        color: "#777",
        fontSize: 14,
    },
    emptyListContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyListText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
});
