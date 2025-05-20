import getStyles from "@/assets/styles/institutionCard";
import { useTheme } from "@/hooks/useTheme";
import { InstitutionCardProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Badge from "./Badge";

const InstitutionCard: React.FC<InstitutionCardProps> = ({ item, onPress, onClose, onViewDetails, variant = "card", showActivities = true, showDetailsButton = true }) => {
    const isPopup = variant === "popup";

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Convertir l'objet activités en tableau de valeurs
    const activitesArray = item.activites ? Object.values(item.activites) : [];

    return (
        <TouchableOpacity style={[styles.container, isPopup ? styles.popupContainer : styles.cardContainer]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            <View style={styles.content}>
                {/* Bouton de fermeture (uniquement pour popup) */}
                {isPopup && onClose && (
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={20} style={styles.icon} />
                    </TouchableOpacity>
                )}

                {/* Nom de l'institution */}
                <Text style={styles.title}>{item.inst_name}</Text>

                {/* Adresse */}
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} style={[styles.icon, styles.infoIcon]} />
                    <Text style={styles.infoValue}>{item.adresse}</Text>
                </View>

                {/* Activités (optionnel) */}
                {showActivities && activitesArray.length > 0 && (
                    <View style={styles.infoRow}>
                        <Ionicons name="fitness-outline" size={18} style={[styles.icon, styles.infoIcon]} />
                        <Text style={[styles.infoValue, styles.activitiesText]}>{activitesArray.join(", ")}</Text>
                    </View>
                )}

                {/* Équipements */}
                {(item.equipements?.douches || item.equipements?.sanitaires) && (
                    <View style={styles.facilitiesContainer}>
                        <View style={styles.infoRow}>
                            <Ionicons name="water-outline" size={18} style={[styles.icon, styles.infoIcon]} />
                            <Text style={styles.facilitiesTitle}>Équipements :</Text>
                        </View>
                        <View style={styles.badgeContainer}>
                            {item.equipements?.douches && <Badge text="Douches" />}
                            {item.equipements?.sanitaires && <Badge text="Sanitaires" />}
                        </View>
                    </View>
                )}

                {/* Bouton "Voir plus" (optionnel) */}
                {showDetailsButton && onViewDetails && (
                    <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails} activeOpacity={0.7}>
                        <Text style={styles.detailsButtonText}>Voir plus de détails</Text>
                        <Ionicons name="chevron-forward" size={18} style={styles.icon} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default InstitutionCard;
