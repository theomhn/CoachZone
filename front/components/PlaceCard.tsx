import { Place } from "@/types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Badge from "./Badge";

interface PlaceCardProps {
    item: Place;
    onPress?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ item, onPress }) => {
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

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.data.inst_nom}</Text>
                <Text style={styles.cardSubtitle}>{item.data.equip_nom}</Text>
                <Text style={styles.cardAddress}>
                    {item.data.inst_adresse}, {item.data.inst_cp} {item.data.lib_bdv}
                </Text>
                <Text style={styles.cardActivities}>{item.data.equip_aps_nom.join(", ")}</Text>
                <Text style={styles.cardSurface}>Surface : {item.data.equip_surf} m²</Text>
                <View style={styles.cardFooter}>
                    {item.data.equip_douche && <Badge text="Douches" />}
                    {item.data.equip_sanit && <Badge text="Sanitaires" />}
                </View>
                <Text style={styles.cardDate}>Dernière mise à jour : {formatDate(item.lastUpdate)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
        color: "#333",
    },
    cardSubtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    cardAddress: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    cardActivities: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        fontStyle: "italic",
    },
    cardSurface: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    cardDate: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
});

export default PlaceCard;
