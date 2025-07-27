import { useTheme } from "@/hooks/useTheme";
import { SearchFilterBarProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    onSearch,
    onFilterChange,
    activities,
    currentFilters,
    searchText: initialSearchText,
}) => {
    const [searchText, setSearchText] = useState(initialSearchText || "");
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [selectedActivities, setSelectedActivities] = useState<string[]>(currentFilters.activities || []);
    const [douchesFilter, setDouchesFilter] = useState(currentFilters.equipements.douches || false);
    const [sanitairesFilter, setSanitairesFilter] = useState(currentFilters.equipements.sanitaires || false);
    const [activitiesSectionExpanded, setActivitiesSectionExpanded] = useState(true);
    const [equipementsSectionExpanded, setEquipementsSectionExpanded] = useState(true);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            marginBottom: 16,
            alignItems: "center",
        },
        searchContainer: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: currentTheme.background,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        searchIcon: {
            marginRight: 8,
            color: currentTheme.placeholder,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: currentTheme.text,
        },
        filterButton: {
            marginLeft: 12,
            paddingHorizontal: 12,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentTheme.background,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        filterButtonContent: {
            flexDirection: "row",
            alignItems: "center",
        },
        downIcon: {
            marginLeft: 4,
        },
        filterBadge: {
            position: "absolute",
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: currentTheme.danger,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: currentTheme.background,
            paddingTop: 50,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
        },
        modalContent: {
            backgroundColor: currentTheme.background,
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 30,
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.lightBorder,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: currentTheme.text,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.lightBorder,
            marginBottom: 12,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: "500",
            color: currentTheme.text,
        },
        activitiesContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            paddingTop: 12,
            paddingBottom: 12,
        },
        activityChip: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 18,
            backgroundColor: currentTheme.lightBackground,
            marginBottom: 8,
        },
        selectedChip: {
            backgroundColor: currentTheme.primary,
        },
        activityChipText: {
            fontSize: 14,
            color: currentTheme.text,
        },
        selectedChipText: {
            color: currentTheme.text,
        },
        equipementsContainer: {
            flexDirection: "row",
            gap: 12,
            paddingTop: 12,
            paddingBottom: 12,
        },
        equipementChip: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 18,
            backgroundColor: currentTheme.lightBackground,
            marginBottom: 8,
        },
        equipementChipText: {
            fontSize: 14,
            marginLeft: 6,
            color: currentTheme.text,
        },
        modalFooter: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: currentTheme.lightBorder,
            marginTop: 16,
        },
        resetButton: {
            paddingVertical: 10,
            paddingHorizontal: 16,
        },
        resetButtonText: {
            color: currentTheme.text,
            fontSize: 16,
        },
        applyButton: {
            backgroundColor: currentTheme.primary,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
        },
        applyButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
        },
        iconPrimary: {
            color: currentTheme.primary,
        },
        icon: {
            color: currentTheme.text,
        },
        iconFilterActive: {
            color: currentTheme.text,
        },
        iconFilterInactive: {
            color: currentTheme.primary,
        },
    });

    // Animation
    const slideAnim = useRef(new Animated.Value(400)).current;

    // Mettre à jour les états locaux quand les filtres externes changent
    useEffect(() => {
        setSelectedActivities(currentFilters.activities || []);
        setDouchesFilter(currentFilters.equipements.douches || false);
        setSanitairesFilter(currentFilters.equipements.sanitaires || false);
    }, [currentFilters]);

    // Mettre à jour le texte de recherche quand il change en externe
    useEffect(() => {
        setSearchText(initialSearchText || "");
    }, [initialSearchText]);

    const openModal = () => {
        // Réinitialiser l'animation avant de l'afficher
        slideAnim.setValue(400);
        setIsFilterModalVisible(true);

        // Animer l'entrée
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        // Animer la sortie
        Animated.timing(slideAnim, {
            toValue: 400,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            // Après l'animation, masquer la modale
            setIsFilterModalVisible(false);
        });
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        onSearch(text);
    };

    const toggleActivity = (activity: string) => {
        if (selectedActivities.includes(activity)) {
            setSelectedActivities(selectedActivities.filter((item) => item !== activity));
        } else {
            setSelectedActivities([...selectedActivities, activity]);
        }
    };

    const applyFilters = () => {
        onFilterChange({
            activities: selectedActivities,
            equipements: {
                douches: douchesFilter,
                sanitaires: sanitairesFilter,
            },
        });
        closeModal();
    };

    const resetFilters = () => {
        setSelectedActivities([]);
        setDouchesFilter(false);
        setSanitairesFilter(false);
        onFilterChange({
            activities: [],
            equipements: {
                douches: false,
                sanitaires: false,
            },
        });
    };

    const toggleSection = (section: "activities" | "equipements") => {
        if (section === "activities") {
            setActivitiesSectionExpanded(!activitiesSectionExpanded);
        } else {
            setEquipementsSectionExpanded(!equipementsSectionExpanded);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher par nom ou activité..."
                    placeholderTextColor={currentTheme.placeholder}
                    value={searchText}
                    onChangeText={handleSearch}
                />
                {searchText !== "" && (
                    <TouchableOpacity onPress={() => handleSearch("")}>
                        <Ionicons name="close-circle" size={20} style={styles.iconPrimary} />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.filterButton} onPress={openModal}>
                <View style={styles.filterButtonContent}>
                    <Feather name="filter" size={18} style={styles.iconPrimary} />
                    <AntDesign name="down" size={12} style={[styles.downIcon, styles.iconPrimary]} />
                </View>
                {(selectedActivities.length > 0 || douchesFilter || sanitairesFilter) && (
                    <View style={styles.filterBadge} />
                )}
            </TouchableOpacity>

            <Modal visible={isFilterModalVisible} animationType="none" transparent={true} onRequestClose={closeModal}>
                <Animated.View style={[styles.modalContainer, { transform: [{ translateX: slideAnim }] }]}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtres</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <AntDesign name="close" size={24} style={styles.iconPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {/* Section Activités */}
                            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("activities")}>
                                <Text style={styles.sectionTitle}>Activités</Text>
                                <AntDesign
                                    name={activitiesSectionExpanded ? "up" : "down"}
                                    size={16}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>

                            {activitiesSectionExpanded && (
                                <View style={styles.activitiesContainer}>
                                    {activities.map((activity) => (
                                        <TouchableOpacity
                                            key={activity}
                                            style={[
                                                styles.activityChip,
                                                selectedActivities.includes(activity) ? styles.selectedChip : {},
                                            ]}
                                            onPress={() => toggleActivity(activity)}
                                        >
                                            <Text
                                                style={[
                                                    styles.activityChipText,
                                                    selectedActivities.includes(activity)
                                                        ? styles.selectedChipText
                                                        : {},
                                                ]}
                                            >
                                                {activity}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Section Équipements */}
                            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("equipements")}>
                                <Text style={styles.sectionTitle}>Équipements</Text>
                                <AntDesign
                                    name={equipementsSectionExpanded ? "up" : "down"}
                                    size={16}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>

                            {equipementsSectionExpanded && (
                                <View style={styles.equipementsContainer}>
                                    <TouchableOpacity
                                        style={[styles.equipementChip, douchesFilter ? styles.selectedChip : {}]}
                                        onPress={() => setDouchesFilter(!douchesFilter)}
                                    >
                                        <Ionicons
                                            name="water-outline"
                                            size={18}
                                            style={douchesFilter ? styles.iconFilterActive : styles.iconFilterInactive}
                                        />
                                        <Text
                                            style={[
                                                styles.equipementChipText,
                                                douchesFilter ? styles.selectedChipText : {},
                                            ]}
                                        >
                                            Douches
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.equipementChip, sanitairesFilter ? styles.selectedChip : {}]}
                                        onPress={() => setSanitairesFilter(!sanitairesFilter)}
                                    >
                                        <Ionicons
                                            name="medical-outline"
                                            size={18}
                                            style={
                                                sanitairesFilter ? styles.iconFilterActive : styles.iconFilterInactive
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.equipementChipText,
                                                sanitairesFilter ? styles.selectedChipText : {},
                                            ]}
                                        >
                                            Sanitaires
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                                <Text style={styles.resetButtonText}>Réinitialiser</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                                <Text style={styles.applyButtonText}>Appliquer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </Modal>
        </View>
    );
};

export default SearchFilterBar;
