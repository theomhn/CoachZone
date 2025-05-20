import getStyles from "@/assets/styles/ThemeToggleButton";
import { useTheme } from "@/hooks/useTheme";
import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import ThemeSelector from "./ThemeSelector";
/**
 * Composant à placer dans le Header des écrans
 * Intègre directement le bouton de thème et la gestion du modal
 */
export const ThemeToggleButton: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={openModal} style={styles.button} accessibilityLabel="Ouvrir les paramètres de thème" accessibilityRole="button">
                    <Feather name="settings" size={20} style={styles.iconPrimary} />
                </TouchableOpacity>
            </View>

            <ThemeSelector isVisible={isModalVisible} onClose={closeModal} />
        </>
    );
};

/**
 * Helper pour obtenir les options du header
 */
export const getThemeToggleButton = () => ({
    headerRight: () => <ThemeToggleButton />,
});
