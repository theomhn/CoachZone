import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Places {
    id: string;
    data: {
        inst_nom: string;
        inst_adresse: string;
        inst_cp: number;
        lib_bdv: string;
        equip_nom: string;
        equip_aps_nom: string[];
        equip_douche: boolean;
        equip_sanit: boolean;
        equip_surf: number;
        equip_nature: string;
        coordonnees: {
            lat: number;
            lon: number;
        };
    };
    lastUpdate: string;
}

export default function PlacesScreen() {
    const [places, setPlaces] = useState<Places[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchPlaces = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/places");

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            const data = await response.json();
            setPlaces(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPlaces();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchPlaces();
    };

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

    const navigateToMap = () => {
        router.replace("/(tabs)/map");
    };

    const renderPlaceCard = ({ item }: { item: Places }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.data.inst_nom}</Text>
                <Text style={styles.cardSubtitle}>{item.data.equip_nom}</Text>
                <Text style={styles.cardAddress}>
                    {item.data.inst_adresse}, {item.data.inst_cp} {item.data.lib_bdv}
                </Text>
                <Text style={styles.cardActivities}>{item.data.equip_aps_nom.join(", ")}</Text>
                <Text style={styles.cardSurface}>Surface : {item.data.equip_surf} m²</Text>
                <View style={styles.cardFooter}>
                    {item.data.equip_douche && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Douches</Text>
                        </View>
                    )}
                    {item.data.equip_sanit && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Sanitaires</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.cardDate}>Dernière mise à jour : {formatDate(item.lastUpdate)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Installations Sportives</Text>
                <TouchableOpacity style={styles.mapButton} onPress={navigateToMap}>
                    <Ionicons name="map-outline" size={24} color="#007AFF" />
                    <Text style={styles.mapButtonText}>Voir sur la carte</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={places}
                renderItem={renderPlaceCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune installation disponible</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e1f5fe",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    mapButtonText: {
        color: "#007AFF",
        marginLeft: 6,
        fontWeight: "500",
    },
    listContainer: {
        paddingBottom: 16,
    },
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
    badge: {
        backgroundColor: "#e1f5fe",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: "#0288d1",
        fontSize: 12,
        fontWeight: "500",
    },
    cardDate: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
});
