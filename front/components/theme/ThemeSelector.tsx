import getStyles from "@/assets/styles/ThemeSelector";
import { ThemeContext, ThemeType } from "@/contexts/ThemeContext";
import { useTheme } from "@/hooks/useTheme";
import { ThemeSelectorProps } from "@/types";
import { Feather, Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useContext, useRef } from "react";
import {
    Animated,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isVisible, onClose }) => {
    // On utilise directement le contexte pour avoir accès à setTheme
    const { theme, setTheme } = useContext(ThemeContext);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    const systemColorScheme = useColorScheme() as "light" | "dark";
    const insets = useSafeAreaInsets();

    // Animation - exactement comme dans SearchFilterBar
    const slideAnim = useRef(new Animated.Value(400)).current;

    // Ouvrir le modal avec animation
    React.useEffect(() => {
        if (isVisible) {
            // Reset animation value
            slideAnim.setValue(400);

            // Animer l'entrée
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    // Fermer le modal avec animation
    const closeModal = () => {
        // Animer la sortie
        Animated.timing(slideAnim, {
            toValue: 400,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            // Après l'animation, appeler la fonction de fermeture
            onClose();
        });
    };

    // Sélectionner et appliquer le thème immédiatement sans fermer la modale
    const selectTheme = (newTheme: ThemeType) => {
        setTheme(newTheme);
    };

    // Calculer la hauteur de la barre d'état
    const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? insets.top : 0);

    return (
        <Modal
            visible={isVisible}
            animationType="none"
            transparent={true}
            onRequestClose={closeModal}
            statusBarTranslucent={false}
        >
            {/* Le contenu principal commence sous la barre d'état */}
            <View style={[styles.contentWrapper, { marginTop: statusBarHeight }]}>
                <Animated.View style={[styles.modalContainer, { transform: [{ translateX: slideAnim }] }]}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thème</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <AntDesign name="close" size={24} style={styles.icon} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View style={styles.themesContainer}>
                                {/* Option Thème clair */}
                                <TouchableOpacity
                                    style={[styles.themeOption, theme === "light" && styles.selectedOption]}
                                    onPress={() => selectTheme("light")}
                                >
                                    <View style={styles.themeIconContainer}>
                                        <Feather name="sun" size={18} style={styles.iconPrimary} />
                                    </View>
                                    <Text style={styles.themeText}>Clair</Text>

                                    {theme === "light" && (
                                        <View style={styles.checkIconContainer}>
                                            <AntDesign name="check" size={18} style={styles.icon} />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Option Thème sombre */}
                                <TouchableOpacity
                                    style={[styles.themeOption, theme === "dark" && styles.selectedOption]}
                                    onPress={() => selectTheme("dark")}
                                >
                                    <View style={styles.themeIconContainer}>
                                        <Ionicons name="moon" size={24} style={styles.iconPrimary} />
                                    </View>
                                    <Text style={styles.themeText}>Sombre</Text>

                                    {theme === "dark" && (
                                        <View style={styles.checkIconContainer}>
                                            <AntDesign name="check" size={18} style={styles.icon} />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Option Thème système */}
                                <TouchableOpacity
                                    style={[styles.themeOption, theme === "system" && styles.selectedOption]}
                                    onPress={() => selectTheme("system")}
                                >
                                    <View style={styles.themeIconContainer}>
                                        <Ionicons name="settings-sharp" size={24} style={styles.iconPrimary} />
                                    </View>
                                    <Text style={styles.themeText}>
                                        Système {systemColorScheme === "dark" ? "(sombre)" : "(clair)"}
                                    </Text>

                                    {theme === "system" && (
                                        <View style={styles.checkIconContainer}>
                                            <AntDesign name="check" size={18} style={styles.icon} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default ThemeSelector;
