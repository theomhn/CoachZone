import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Booking } from "@/types";
import { formatDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MyBookingsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [showUpcoming, setShowUpcoming] = useState(true);

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();

    const styles = getStyles(currentTheme);

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
    }, [showUpcoming, filterBookings]);

    // Basculer entre les réservations à venir et passées
    const toggleView = useCallback(() => {
        const newValue = !showUpcoming;
        setShowUpcoming(newValue);
        filterBookings(bookings, newValue);
    }, [showUpcoming, bookings, filterBookings]);

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

    // Fonction pour formater l'heure (sans conversion de fuseau horaire)
    const formatTime = (dateString: string): string => {
        // Parser manuellement la date ISO pour éviter la conversion de fuseau horaire
        // Format: YYYY-MM-DDTHH:MM:SS
        const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (isoMatch) {
            const [, , , , hour, minute] = isoMatch;
            return `${hour}:${minute}`;
        }

        // Fallback vers l'ancienne méthode si le format n'est pas reconnu
        const date = new Date(dateString);
        return date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Fonction pour annuler une réservation
    const cancelBooking = useCallback(
        async (booking: Booking) => {
            Alert.alert(
                "Confirmer l'annulation",
                `Êtes-vous sûr de vouloir annuler cette réservation du ${formatDate(booking.dateStart)} ?`,
                [
                    {
                        text: "Annuler",
                        style: "cancel",
                    },
                    {
                        text: "Confirmer l'annulation",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const token = await SecureStore.getItemAsync("userToken");
                                if (!token) {
                                    Alert.alert("Erreur", "Token d'authentification manquant");
                                    return;
                                }

                                const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}`, {
                                    method: "DELETE",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                    },
                                });

                                if (!response.ok) {
                                    throw new Error("Erreur lors de l'annulation de la réservation");
                                }

                                Alert.alert("Succès", "Votre réservation a été annulée avec succès");
                                fetchBookings(); // Recharger la liste
                            } catch (error) {
                                console.error("Erreur annulation:", error);
                                Alert.alert("Erreur", "Impossible d'annuler la réservation");
                            }
                        },
                    },
                ]
            );
        },
        [fetchBookings]
    );

    // Fonction pour modifier une réservation
    const modifyBooking = useCallback((booking: Booking) => {
        // Vérifier que les données nécessaires sont présentes
        if (!booking.place) {
            Alert.alert("Erreur", "Impossible de modifier cette réservation : informations de la place manquantes");
            return;
        }

        if (!booking.id) {
            Alert.alert("Erreur", "Impossible de modifier cette réservation : ID de réservation manquant");
            return;
        }

        // Extraire l'ID de la place depuis l'URL (ex: "/api/places/123" -> "123")
        let placeId;
        try {
            placeId = booking.place.toString().split("/").pop() || booking.place.toString();
        } catch {
            Alert.alert("Erreur", "Impossible d'extraire l'ID de la place");
            return;
        }

        // Construire les paramètres de façon sécurisée
        const params = {
            placeId: placeId,
            placeName: booking.placeEquipmentName || "Équipement",
            placePrice: booking.price?.toString() || "0",
            editMode: "true",
            bookingId: booking.id?.toString() || "",
            currentStartDate: booking.dateStart || "",
            currentEndDate: booking.dateEnd || "",
        };

        // Naviguer vers l'écran de modification de réservation
        try {
            router.push({
                pathname: "/booking",
                params: params,
            });
        } catch {
            Alert.alert("Erreur", "Impossible de naviguer vers l'écran de modification");
        }
    }, []);

    // Rendu d'une réservation
    const renderBookingItem = ({ item }: { item: Booking }) => {
        const currentUser = global.user;
        const now = new Date();
        const bookingEndDate = new Date(item.dateEnd);
        const isUpcoming = bookingEndDate >= now;
        const isCancelled = item.status === "cancelled";

        return (
            <View style={{ position: "relative", marginVertical: 8, marginTop: isCancelled ? 12 : 8 }}>
                {/* Badge "ANNULÉE" pour les réservations annulées */}
                {isCancelled && (
                    <View style={styles.cancelledBadge}>
                        <Text style={styles.cancelledBadgeText}>ANNULÉE</Text>
                    </View>
                )}

                <Card variant="booking" state={isCancelled ? "cancelled" : "normal"} margin="none">
                    <View style={styles.bookingHeader}>
                        <View style={styles.dateContainer}>
                            <Text style={[styles.dateText, isCancelled && styles.cancelledText]}>
                                {formatDate(item.dateStart).split(" à ")[0]}
                            </Text>
                            <Text style={[styles.timeText, isCancelled && styles.cancelledText]}>
                                {formatTime(item.dateStart)} - {formatTime(item.dateEnd)}
                            </Text>
                        </View>

                        {/* Prix de la réservation */}
                        <View style={styles.priceContainer}>
                            <Text style={[styles.priceText, isCancelled && styles.cancelledPriceText]}>
                                {isCancelled ? (
                                    <>
                                        <Text style={styles.strikethrough}>{item.price} €</Text>
                                        <Text style={styles.refundText}> • Remboursée</Text>
                                    </>
                                ) : (
                                    `${item.price} €`
                                )}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bookingDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons
                                name="location-outline"
                                size={18}
                                style={[styles.icon, isCancelled && styles.cancelledIcon]}
                            />
                            <Text style={[styles.detailText, isCancelled && styles.cancelledText]}>
                                {item.placeEquipmentName || "Lieu non disponible"}
                            </Text>
                        </View>

                        {/* Afficher le nom du coach pour les institutions */}
                        {currentUser && currentUser.type === "ROLE_INSTITUTION" && item.coachFullName && (
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="person-outline"
                                    size={18}
                                    style={[styles.icon, isCancelled && styles.cancelledIcon]}
                                />
                                <Text style={[styles.detailText, isCancelled && styles.cancelledText]}>
                                    {item.coachFullName}
                                </Text>
                            </View>
                        )}

                        {/* Afficher la date d'annulation si applicable */}
                        {isCancelled && item.cancelledAt && (
                            <View style={styles.detailRow}>
                                <Ionicons name="close-circle-outline" size={18} style={styles.cancelledIcon} />
                                <Text style={styles.cancelledDateText}>
                                    Annulée le {new Date(item.cancelledAt).toLocaleDateString("fr-FR")}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Boutons d'action pour les réservations à venir NON ANNULÉES */}
                    {isUpcoming && showUpcoming && !isCancelled && (
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.modifyButton]}
                                onPress={() => modifyBooking(item)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="create-outline" size={18} style={styles.actionIcon} />
                                <Text style={styles.actionText}>Modifier</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => cancelBooking(item)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="trash-outline" size={18} style={styles.actionIconCancel} />
                                <Text style={styles.actionTextCancel}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>
            </View>
        );
    };

    // Rendu de l'écran de chargement
    if (isLoading && !refreshing) {
        return <LoadingView />;
    }

    // Si pas d'utilisateur connecté après le chargement
    if (!global.user) {
        return (
            <EmptyState
                icon="person-outline"
                title="Connexion requise"
                subtitle="Vous devez être connecté pour voir vos réservations"
            />
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
                    <EmptyState
                        icon="calendar-outline"
                        title={showUpcoming ? "Aucune réservation à venir" : "Aucune réservation passée"}
                        subtitle={
                            showUpcoming
                                ? "Vous n'avez pas de réservations programmées"
                                : "Aucune réservation dans votre historique"
                        }
                    />
                }
            />
        </View>
    );
}

const getStyles = (currentTheme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: currentTheme.background,
    },
    toggleContainer: {
        flexDirection: "row",
        backgroundColor: currentTheme.lightBackground,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 8,
        overflow: "hidden",
        elevation: 2,
        shadowColor: currentTheme.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    toggleActive: {
        backgroundColor: currentTheme.primary,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: "600",
        color: currentTheme.text,
    },
    toggleActiveText: {
        color: currentTheme.white,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    bookingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    dateContainer: {
        flex: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: "700",
        color: currentTheme.text,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        color: currentTheme.secondaryText,
    },
    bookingDetails: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    icon: {
        color: currentTheme.secondaryText,
        marginRight: 8,
    },
    detailText: {
        fontSize: 14,
        color: currentTheme.text,
        flex: 1,
    },
    priceContainer: {
        alignItems: "flex-end",
    },
    priceText: {
        fontSize: 16,
        fontWeight: "600",
        color: currentTheme.success,
    },
    actionsContainer: {
        flexDirection: "row",
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: currentTheme.border,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
    },
    modifyButton: {
        backgroundColor: currentTheme.lightBackground,
        borderColor: currentTheme.primary,
    },
    cancelButton: {
        backgroundColor: currentTheme.lightBackground,
        borderColor: currentTheme.danger,
    },
    actionIcon: {
        color: currentTheme.primary,
        marginRight: 6,
    },
    actionIconCancel: {
        color: currentTheme.danger,
        marginRight: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: "500",
        color: currentTheme.primary,
    },
    actionTextCancel: {
        fontSize: 14,
        fontWeight: "500",
        color: currentTheme.danger,
    },
    cancelledBadge: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: currentTheme.danger,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        zIndex: 1,
        elevation: 3,
        shadowColor: currentTheme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    cancelledBadgeText: {
        color: currentTheme.white,
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    cancelledText: {
        color: currentTheme.secondaryText,
        textDecorationLine: "line-through",
    },
    cancelledIcon: {
        color: currentTheme.secondaryText,
        opacity: 0.6,
    },
    cancelledPriceText: {
        color: currentTheme.secondaryText,
    },
    strikethrough: {
        textDecorationLine: "line-through",
        color: currentTheme.secondaryText,
    },
    refundText: {
        color: currentTheme.success,
        fontSize: 14,
        fontWeight: "500",
    },
    cancelledDateText: {
        fontSize: 12,
        color: currentTheme.danger,
        fontStyle: "italic",
        flex: 1,
    },
});
