import getStyles from "@/assets/styles/myBookingsScreen";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Booking } from "@/types";
import { formatDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";

export default function MyBookingsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [showUpcoming, setShowUpcoming] = useState(true);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Récupérer les réservations
    const fetchBookings = useCallback(async () => {
        const currentUser = global.user;
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            // Récupérer le token d'authentification
            const token = await SecureStore.getItemAsync("userToken");
            if (!token) {
                Alert.alert("Erreur", "Vous devez être connecté pour voir vos réservations");
                setIsLoading(false);
                return;
            }

            // Endpoint unique qui retourne les réservations filtrées selon l'utilisateur authentifié
            const bookings = `${API_BASE_URL}/bookings`;

            const response = await fetch(bookings, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des réservations");
            }

            const data = await response.json();

            setBookings(data);
            filterBookings(data, showUpcoming);
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert("Erreur", "Impossible de récupérer vos réservations");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [showUpcoming]);

    // Filtrer les réservations (à venir ou passées)
    const filterBookings = useCallback((bookingsData: Booking[], upcoming: boolean) => {
        const now = new Date();
        const filtered = bookingsData.filter((booking) => {
            const endDate = new Date(booking.dateEnd);
            return upcoming ? endDate >= now : endDate < now;
        });

        // Trier par date (croissant pour à venir, décroissant pour passées)
        filtered.sort((a, b) => {
            const dateA = new Date(a.dateStart);
            const dateB = new Date(b.dateStart);
            return upcoming ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

        setFilteredBookings(filtered);
    }, []);

    // Basculer entre les réservations à venir et passées
    const toggleView = useCallback(() => {
        const newValue = !showUpcoming;
        setShowUpcoming(newValue);
        filterBookings(bookings, newValue);
    }, [showUpcoming, bookings]);

    // Rafraîchir les données
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBookings();
    }, [fetchBookings]);

    // Charger les réservations au démarrage
    useEffect(() => {
        if (global.user) {
            fetchBookings();
        } else {
            setIsLoading(false);
        }
    }, [fetchBookings]);

    // Recharger les données quand l'écran reprend le focus
    useFocusEffect(
        useCallback(() => {
            if (global.user) {
                fetchBookings();
            }
        }, [fetchBookings])
    );

    // Fonction pour formater l'heure
    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Rendu d'une réservation
    const renderBookingItem = ({ item }: { item: Booking }) => {
        const currentUser = global.user;

        return (
            <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{formatDate(item.dateStart).split(" à ")[0]}</Text>
                        <Text style={styles.timeText}>
                            {formatTime(item.dateStart)} - {formatTime(item.dateEnd)}
                        </Text>
                    </View>
                </View>

                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} style={styles.icon} />
                        <Text style={styles.detailText}>{item.placeEquipmentName || "Lieu non disponible"}</Text>
                    </View>

                    {/* Afficher le nom du coach pour les institutions */}
                    {currentUser && currentUser.type === "institution" && item.coachFullName && (
                        <View style={styles.detailRow}>
                            <Ionicons name="person-outline" size={18} style={styles.icon} />
                            <Text style={styles.detailText}>{item.coachFullName}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    // Rendu de l'écran de chargement
    if (isLoading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    // Si pas d'utilisateur connecté après le chargement
    if (!global.user) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="person-outline" size={48} style={styles.iconPrimary} />
                <Text style={styles.emptyText}>Vous devez être connecté pour voir vos réservations</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container]}>
            {/* Toggle entre réservations à venir et passées */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, showUpcoming && styles.toggleActive]}
                    onPress={() => (showUpcoming ? null : toggleView())}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.toggleText, showUpcoming && styles.toggleActiveText]}>À venir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, !showUpcoming && styles.toggleActive]}
                    onPress={() => (showUpcoming ? toggleView() : null)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.toggleText, !showUpcoming && styles.toggleActiveText]}>Passées</Text>
                </TouchableOpacity>
            </View>

            {/* Liste des réservations */}
            <FlatList
                data={filteredBookings}
                renderItem={renderBookingItem}
                keyExtractor={(item, index) => `booking-${item.id || index}`}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} style={styles.iconPrimary} />
                        <Text style={styles.emptyText}>
                            {showUpcoming ? "Aucune réservation à venir" : "Aucune réservation passée"}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
