import { Place } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Badge from "./Badge";

interface PlaceCardProps {
    item: Place;
    onPress?: () => void;
    onClose?: () => void;
    onViewDetails?: () => void; // Nouvelle fonction pour afficher les détails
    variant?: "card" | "popup"; // "card" pour l'affichage en liste, "popup" pour la carte
    showDate?: boolean; // Afficher la date de mise à jour
    showActivities?: boolean; // Afficher les activités
    showDetailsButton?: boolean; // Afficher le bouton "Voir plus"
}

const PlaceCard: React.FC<PlaceCardProps> = ({ item, onPress, onClose, onViewDetails, variant = "card", showDate = true, showActivities = true, showDetailsButton = true }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isPopup = variant === "popup";

    return (
        <TouchableOpacity style={[styles.container, isPopup ? styles.popupContainer : styles.cardContainer]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            <View style={styles.content}>
                {/* Bouton de fermeture (uniquement pour popup) */}
                {isPopup && onClose && (
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                )}

                {/* Titre de l'établissement */}
                <Text style={styles.title}>{item.data.inst_nom}</Text>

                {/* Nom de l'équipement */}
                <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={18} color="#555" style={styles.infoIcon} />
                    <Text style={styles.infoValue}>{item.data.equip_nom}</Text>
                </View>

                {/* Adresse */}
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color="#555" style={styles.infoIcon} />
                    <Text style={styles.infoValue}>
                        {item.data.inst_adresse}, {item.data.inst_cp} {item.data.lib_bdv}
                    </Text>
                </View>

                {/* Activités (optionnel) */}
                {showActivities && item.data.equip_aps_nom && item.data.equip_aps_nom.length > 0 && (
                    <View style={styles.infoRow}>
                        <Ionicons name="fitness-outline" size={18} color="#555" style={styles.infoIcon} />
                        <Text style={[styles.infoValue, styles.activitiesText]}>{item.data.equip_aps_nom.join(", ")}</Text>
                    </View>
                )}

                {/* Surface */}
                {item.data.equip_surf > 0 && (
                    <View style={styles.infoRow}>
                        <Ionicons name="resize-outline" size={18} color="#555" style={styles.infoIcon} />
                        <Text style={styles.infoValue}>Surface : {item.data.equip_surf} m²</Text>
                    </View>
                )}

                {/* Équipements */}
                {(item.data.equip_douche || item.data.equip_sanit) && (
                    <View style={styles.facilitiesContainer}>
                        <View style={styles.infoRow}>
                            <Ionicons name="water-outline" size={18} color="#555" style={styles.infoIcon} />
                            <Text style={styles.facilitiesTitle}>Équipements :</Text>
                        </View>
                        <View style={styles.badgeContainer}>
                            {item.data.equip_douche && <Badge text="Douches" />}
                            {item.data.equip_sanit && <Badge text="Sanitaires" />}
                        </View>
                    </View>
                )}

                {/* Date de mise à jour (optionnel) */}
                {showDate && (
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#999" style={styles.infoIcon} />
                        <Text style={styles.dateText}>Dernière mise à jour : {formatDate(item.lastUpdate)}</Text>
                    </View>
                )}

                {/* Bouton "Voir plus" (optionnel) */}
                {showDetailsButton && onViewDetails && (
                    <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails} activeOpacity={0.7}>
                        <Text style={styles.detailsButtonText}>Voir plus de détails</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        color: "#333",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    infoIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    infoValue: {
        fontSize: 14,
        color: "#666",
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
        color: "#555",
    },
    badgeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 0,
        marginLeft: 26,
    },
    dateText: {
        fontSize: 12,
        marginTop: 2,
        color: "#999",
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "#ff3b30",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    detailsButton: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    detailsButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginRight: 4,
    },
});

export default PlaceCard;
