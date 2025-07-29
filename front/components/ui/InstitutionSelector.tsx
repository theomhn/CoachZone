import Card from "@/components/ui/Card";
import LoadingView from "@/components/ui/LoadingView";
import { useTheme } from "@/hooks/useTheme";
import { InstitutionRegister } from "@/types";
import React from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "../Button";
import FormInput from "./FormInput";

interface InstitutionSelectorProps {
    visible: boolean;
    onClose: () => void;
    institutions: InstitutionRegister[];
    filteredInstitutions: InstitutionRegister[];
    searchText: string;
    onSearchChange: (text: string) => void;
    onSelectInstitution: (institution: InstitutionRegister) => void;
    isLoading?: boolean;
}

const InstitutionSelector: React.FC<InstitutionSelectorProps> = ({
    visible,
    onClose,
    institutions,
    filteredInstitutions,
    searchText,
    onSearchChange,
    onSelectInstitution,
    isLoading = false,
}) => {
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    if (isLoading) {
        return (
            <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <LoadingView text="Chargement des établissements..." />
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <FormInput
                            label=""
                            placeholder="Rechercher un établissement"
                            value={searchText}
                            onChangeText={onSearchChange}
                            autoFocus
                            containerStyle={styles.searchInput}
                        />
                        <Button title="Fermer" onPress={onClose} variant="secondary" size="small" />
                    </View>

                    <FlatList
                        data={searchText ? filteredInstitutions : institutions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => onSelectInstitution(item)} activeOpacity={0.7}>
                                <Card variant="selection" margin="none">
                                    <Text style={styles.institutionName}>
                                        {item.name} <Text style={styles.institutionId}>({item.id})</Text>
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchText ? "Aucun établissement trouvé" : "Commencez à taper pour rechercher"}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (currentTheme: any) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: currentTheme.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
    },
    institutionItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: currentTheme.border,
    },
    institutionName: {
        fontSize: 16,
        color: currentTheme.text,
    },
    institutionId: {
        fontSize: 14,
        color: currentTheme.secondaryText,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: currentTheme.secondaryText,
        textAlign: "center",
    },
});

export default InstitutionSelector;
