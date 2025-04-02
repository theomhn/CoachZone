import { Institution } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Badge from "./Badge";

interface InstitutionCardProps {
    item: Institution;
    onPress?: () => void;
    onClose?: () => void;
    onViewDetails?: () => void;
    variant?: "card" | "popup";
    showActivities?: boolean;
    showDetailsButton?: boolean;
}

const InstitutionCard: React.FC<InstitutionCardProps> = ({ item, onPress, onClose, onViewDetails, variant = "card", showActivities = true, showDetailsButton = true }) => {
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

                {/* Nom de l'institution */}
                <Text style={styles.title}>{item.inst_name}</Text>

                {/* Adresse */}
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color="#555" style={styles.infoIcon} />
                    <Text style={styles.infoValue}>{item.adresse}</Text>
                </View>

                {/* Activités (optionnel) */}
                {showActivities && item.activites && item.activites.length > 0 && (
                    <View style={styles.infoRow}>
                        <Ionicons name="fitness-outline" size={18} color="#555" style={styles.infoIcon} />
                        <Text style={[styles.infoValue, styles.activitiesText]}>{item.activites.join(", ")}</Text>
                    </View>
                )}

                {/* Surface */}
                {item.surface_totale > 0 && (
                    <View style={styles.infoRow}>
                        <Ionicons name="resize-outline" size={18} color="#555" style={styles.infoIcon} />
                        <Text style={styles.infoValue}>Surface : {item.surface_totale} m²</Text>
                    </View>
                )}

                {/* Équipements */}
                {(item.equipements?.douches || item.equipements?.sanitaires) && (
                    <View style={styles.facilitiesContainer}>
                        <View style={styles.infoRow}>
                            <Ionicons name="water-outline" size={18} color="#555" style={styles.infoIcon} />
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

export default InstitutionCard;
