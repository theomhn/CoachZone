import Button from "@/components/Button";
import AuthFormContainer from "@/components/ui/AuthFormContainer";
import FormInput from "@/components/ui/FormInput";
import InstitutionSelector from "@/components/ui/InstitutionSelector";
import LoadingView from "@/components/ui/LoadingView";
import { useTheme } from "@/hooks/useTheme";
import { AuthService, InstitutionService } from "@/services";
import { InstitutionRegister } from "@/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type UserType = "ROLE_COACH" | "ROLE_INSTITUTION";

export default function RegisterScreen() {
    // Pour les coach
    const [userType, setUserType] = useState<UserType>("ROLE_COACH");
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

    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Charger la liste des institutions
    useEffect(() => {
        if (userType === "ROLE_INSTITUTION") {
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
            const data = await InstitutionService.getOpenDataInstitutions();
            
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

        let registerData;
        if (userType === "ROLE_COACH") {
            if (!firstName || !lastName || !work) {
                Alert.alert("Erreur", "Veuillez remplir tous les champs");
                return;
            }
            registerData = {
                name: `${firstName} ${lastName}`,
                email,
                password,
                type: "ROLE_COACH" as const,
            };
        } else {
            if (!selectedInstitution) {
                Alert.alert("Erreur", "Veuillez sélectionner votre établissement");
                return;
            }
            registerData = {
                name: selectedInstitution.name,
                email,
                password,
                type: "ROLE_INSTITUTION" as const,
                inst_numero: selectedInstitution.id,
            };
        }

        setIsLoading(true);
        try {
            await AuthService.register(registerData);
            Alert.alert("Succès", "Inscription réussie !", [{ text: "OK", onPress: () => router.replace("/login") }]);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchFocus = () => {
        if (userType === "ROLE_INSTITUTION" && !isLoadingInstitutions) {
            setShowModal(true);
        }
    };

    if (isLoadingInstitutions && userType === "ROLE_INSTITUTION") {
        return <LoadingView text="Chargement des établissements..." />;
    }

    return (
        <AuthFormContainer>
            <View style={styles.typeSelector}>
                <TouchableOpacity
                    style={[styles.typeButton, userType === "ROLE_COACH" && styles.selectedType]}
                    onPress={() => {
                        setUserType("ROLE_COACH");
                        setSelectedInstitution(null);
                        setSearchText("");
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.typeText, userType === "ROLE_COACH" && styles.selectedTypeText]}>
                        Coach
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeButton, userType === "ROLE_INSTITUTION" && styles.selectedType]}
                    onPress={() => setUserType("ROLE_INSTITUTION")}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.typeText, userType === "ROLE_INSTITUTION" && styles.selectedTypeText]}>
                        Institution
                    </Text>
                </TouchableOpacity>
            </View>

            {userType === "ROLE_COACH" && (
                <>
                    <FormInput
                        label="Prénom"
                        placeholder="Entrez votre prénom"
                        value={firstName}
                        onChangeText={setFirstName}
                        required
                    />
                    <FormInput
                        label="Nom"
                        placeholder="Entrez votre nom"
                        value={lastName}
                        onChangeText={setLastName}
                        required
                    />
                </>
            )}

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

            {userType === "ROLE_COACH" ? (
                <FormInput
                    label="Profession"
                    placeholder="Entrez votre profession"
                    value={work}
                    onChangeText={setWork}
                    required
                />
            ) : (
                <View>
                    <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: currentTheme.text }}>
                        Nom de l'établissement <Text style={{ color: currentTheme.danger }}>*</Text>
                    </Text>
                    <TouchableOpacity style={styles.institutionSelector} onPress={handleSearchFocus} activeOpacity={0.7}>
                        <Text style={selectedInstitution ? styles.selectedText : styles.placeholderText}>
                            {selectedInstitution
                                ? `${selectedInstitution.name} (${selectedInstitution.id})`
                                : "Sélectionner un établissement"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <Button
                title={isLoading ? "Chargement..." : "S'inscrire"}
                onPress={handleRegister}
                variant="primary"
                size="large"
                disabled={isLoading}
                loading={isLoading}
                fullWidth
                style={{ marginTop: 24 }}
            />

            <Button
                title="Déjà un compte ? Se connecter"
                onPress={() => router.replace("/login")}
                variant="link"
                style={{ marginTop: 20 }}
            />

            <InstitutionSelector
                visible={showModal}
                onClose={() => setShowModal(false)}
                institutions={institutions}
                filteredInstitutions={filteredInstitutions}
                searchText={searchText}
                onSearchChange={setSearchText}
                onSelectInstitution={handleSelectInstitution}
                isLoading={isLoadingInstitutions}
            />
        </AuthFormContainer>
    );
}

const getStyles = (currentTheme: any) => StyleSheet.create({
    typeSelector: {
        flexDirection: "row",
        marginBottom: 20,
        borderRadius: 30,
        backgroundColor: currentTheme.primary,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25,
    },
    selectedType: {
        backgroundColor: currentTheme.white,
    },
    typeText: {
        fontSize: 16,
        fontWeight: "bold",
        color: currentTheme.white,
        textTransform: "uppercase",
    },
    selectedTypeText: {
        color: currentTheme.black,
    },
    institutionSelector: {
        backgroundColor: currentTheme.inputBackground,
        borderWidth: 1,
        borderColor: currentTheme.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
        justifyContent: "center",
    },
    selectedText: {
        fontSize: 16,
        color: currentTheme.text,
    },
    placeholderText: {
        fontSize: 16,
        color: currentTheme.placeholder,
    },
});
