import styles from "@/assets/styles/searchFilterBar";
import { SearchFilterBarProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onSearch, onFilterChange, activities, currentFilters, searchText: initialSearchText }) => {
    const [searchText, setSearchText] = useState(initialSearchText || "");
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [selectedActivities, setSelectedActivities] = useState<string[]>(currentFilters.activities || []);
    const [douchesFilter, setDouchesFilter] = useState(currentFilters.equipements.douches || false);
    const [sanitairesFilter, setSanitairesFilter] = useState(currentFilters.equipements.sanitaires || false);
    const [activitiesSectionExpanded, setActivitiesSectionExpanded] = useState(true);
    const [equipementsSectionExpanded, setEquipementsSectionExpanded] = useState(true);

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
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput style={styles.searchInput} placeholder="Rechercher par nom ou activité..." value={searchText} onChangeText={handleSearch} />
                {searchText !== "" && (
                    <TouchableOpacity onPress={() => handleSearch("")}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.filterButton} onPress={openModal}>
                <View style={styles.filterButtonContent}>
                    <Feather name="filter" size={18} color="#007AFF" />
                    <AntDesign name="down" size={12} color="#007AFF" style={styles.downIcon} />
                </View>
                {(selectedActivities.length > 0 || douchesFilter || sanitairesFilter) && <View style={styles.filterBadge} />}
            </TouchableOpacity>

            <Modal visible={isFilterModalVisible} animationType="none" transparent={true} onRequestClose={closeModal}>
                <Animated.View style={[styles.modalContainer, { transform: [{ translateX: slideAnim }] }]}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtres</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <AntDesign name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {/* Section Activités */}
                            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("activities")}>
                                <Text style={styles.sectionTitle}>Activités</Text>
                                <AntDesign name={activitiesSectionExpanded ? "up" : "down"} size={16} color="#333" />
                            </TouchableOpacity>

                            {activitiesSectionExpanded && (
                                <View style={styles.activitiesContainer}>
                                    {activities.map((activity) => (
                                        <TouchableOpacity
                                            key={activity}
                                            style={[styles.activityChip, selectedActivities.includes(activity) ? styles.selectedChip : {}]}
                                            onPress={() => toggleActivity(activity)}
                                        >
                                            <Text style={[styles.activityChipText, selectedActivities.includes(activity) ? styles.selectedChipText : {}]}>{activity}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Section Équipements */}
                            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("equipements")}>
                                <Text style={styles.sectionTitle}>Équipements</Text>
                                <AntDesign name={equipementsSectionExpanded ? "up" : "down"} size={16} color="#333" />
                            </TouchableOpacity>

                            {equipementsSectionExpanded && (
                                <View style={styles.equipementsContainer}>
                                    <TouchableOpacity style={[styles.equipementChip, douchesFilter ? styles.selectedChip : {}]} onPress={() => setDouchesFilter(!douchesFilter)}>
                                        <Ionicons name="water-outline" size={18} color={douchesFilter ? "#fff" : "#007AFF"} />
                                        <Text style={[styles.equipementChipText, douchesFilter ? styles.selectedChipText : {}]}>Douches</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.equipementChip, sanitairesFilter ? styles.selectedChip : {}]}
                                        onPress={() => setSanitairesFilter(!sanitairesFilter)}
                                    >
                                        <Ionicons name="medical-outline" size={18} color={sanitairesFilter ? "#fff" : "#007AFF"} />
                                        <Text style={[styles.equipementChipText, sanitairesFilter ? styles.selectedChipText : {}]}>Sanitaires</Text>
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
