import { useTheme } from "@/hooks/useTheme";
import { InstitutionCardProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Badge from "./Badge";

const InstitutionCard: React.FC<InstitutionCardProps> = ({
    item,
    onPress,
    onClose,
    onViewDetails,
    variant = "card",
    showActivities = true,
    showDetailsButton = true,
}) => {
    const isPopup = variant === "popup";

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 12,
        },
        cardContainer: {
            marginBottom: 12,
        },
        popupContainer: {
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            borderRadius: 15,
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        content: {
            padding: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 12,
            color: currentTheme.text,
        },
        infoRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 8,
        },
        icon: {
            color: currentTheme.white,
        },
        infoIcon: {
            marginRight: 8,
            marginTop: 2,
        },
        infoValue: {
            fontSize: 14,
            color: currentTheme.text,
            flex: 1,
        },
        activitiesText: {
            fontStyle: "italic",
        },
        facilitiesContainer: {
            marginTop: 4,
            marginBottom: 4,
        },
        facilitiesTitle: {
            fontSize: 14,
            marginTop: 3,
            color: currentTheme.text,
        },
        badgeContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 0,
            marginLeft: 26,
        },
        closeButton: {
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: currentTheme.danger,
            borderRadius: 15,
            width: 30,
            height: 30,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
        },
        detailsButton: {
            backgroundColor: currentTheme.primary,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        detailsButtonText: {
            color: currentTheme.white,
            fontSize: 14,
            fontWeight: "600",
            marginRight: 4,
        },
        reservationButton: {
            backgroundColor: currentTheme.success,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 16,
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        reservationButtonText: {
            color: currentTheme.white,
            fontSize: 14,
            fontWeight: "600",
            marginRight: 4,
        },
    });

    // Convertir l'objet activités en tableau avec map
    const activitesArray = item.activites ? Object.entries(item.activites).map(([, value]) => value) : [];

    return (
        <TouchableOpacity
            style={[styles.container, isPopup ? styles.popupContainer : styles.cardContainer]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
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
                    <Text style={styles.infoValue}>
                        {item.adresse}, {item.ville}
                    </Text>
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

                {/* Bouton de réservation */}
                {showDetailsButton && onViewDetails && (
                    <TouchableOpacity style={styles.reservationButton} onPress={onViewDetails} activeOpacity={0.7}>
                        <Ionicons name="calendar" size={16} style={[styles.icon, { marginRight: 4 }]} />
                        <Text style={styles.reservationButtonText}>Réserver maintenant une séance</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default InstitutionCard;
