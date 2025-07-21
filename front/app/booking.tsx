import getStyles from "@/assets/styles/bookingScreen";
import { API_BASE_URL } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { Booking } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";

export default function BookingScreen() {
    // Protection : Rediriger si pas coach
    useFocusEffect(
        useCallback(() => {
            if (!global.user || global.user.type !== "coach") {
                router.replace("/(auth)/login" as any);
                return;
            }
        }, [])
    );

    const { placeId, placeName, placePrice } = useLocalSearchParams<{
        placeId: string;
        placeName: string;
        placePrice: string;
    }>();
    const router = useRouter();

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Si pas coach, ne pas afficher l'écran
    if (!global.user || global.user.type !== "coach") {
        return null;
    }

    // Convertir le prix reçu en paramètre en nombre
    const pricePerSlot = placePrice ? parseFloat(placePrice) : 0;

    // États pour stocker les données du formulaire
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
    const [price, setPrice] = useState(0); // Prix calculé automatiquement
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAllTimeSlots, setShowAllTimeSlots] = useState(false);

    // Nouveaux états pour la gestion des réservations
    const [placeBookings, setPlaceBookings] = useState<Booking[]>([]);
    const [coachBookings, setCoachBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    // Mise à jour du prix lorsque les créneaux changent
    useEffect(() => {
        setPrice(selectedTimeSlots.length * pricePerSlot);
    }, [selectedTimeSlots, pricePerSlot]);

    // Création des créneaux horaires
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 8; hour <= 22; hour++) {
            slots.push(`${hour.toString().padStart(2, "0")}:00`);
        }
        return slots;
    }, []);

    // Fonction pour récupérer les réservations du coach connecté
    const fetchCoachBookings = async () => {
        if (!global.user || global.user.type !== "coach") return;

        try {
            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                console.warn("Pas de token disponible pour récupérer les réservations du coach");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.warn("Erreur lors de la récupération des réservations du coach");
                return;
            }

            const data = await response.json();

            // Les données sont directement un tableau de réservations
            const bookings = Array.isArray(data) ? data : [];
            setCoachBookings(bookings);
        } catch (error) {
            console.error("Erreur lors de la récupération des réservations du coach:", error);
            setCoachBookings([]);
        }
    };

    // Fonction pour récupérer les réservations de la place
    const fetchPlaceBookings = async () => {
        if (!placeId) return;

        try {
            setIsLoadingBookings(true);
            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                console.warn("Pas de token disponible pour récupérer les réservations");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des réservations");
            }

            const data = await response.json();

            // S'assurer que upcomingBookings est bien un tableau
            const bookings = Array.isArray(data.upcomingBookings) ? data.upcomingBookings : [];
            setPlaceBookings(bookings);
        } catch (error) {
            console.error("Erreur lors de la récupération des réservations:", error);
            // On ne montre pas d'alerte à l'utilisateur pour ne pas être intrusif
            setPlaceBookings([]);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    // Récupérer les réservations au chargement du composant
    useEffect(() => {
        fetchPlaceBookings();
        fetchCoachBookings();
    }, [placeId]);

    // Fonction pour trouver la réservation conflictuelle du coach
    const findConflictingCoachBooking = (date: string, timeSlot: string): Booking | null => {
        if (!Array.isArray(coachBookings) || coachBookings.length === 0) {
            return null;
        }

        const [hours] = timeSlot.split(":").map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, 0, 0, 0);

        const slotEnd = new Date(date);
        slotEnd.setHours(hours + 1, 0, 0, 0);

        return (
            coachBookings.find((booking) => {
                const bookingStart = new Date(booking.dateStart);
                const bookingEnd = new Date(booking.dateEnd);

                // Vérifier si les dates sont le même jour
                const isSameDay = bookingStart.toDateString() === slotStart.toDateString();

                if (!isSameDay) return false;

                // Vérifier le chevauchement
                return slotStart < bookingEnd && slotEnd > bookingStart;
            }) || null
        );
    };

    // Fonction pour déterminer pourquoi un créneau est indisponible
    const getUnavailabilityReason = (
        date: string,
        timeSlot: string
    ): { reason: "past" | "place-booked" | "coach-booked" | "available"; conflictingBooking?: Booking } => {
        if (!date) return { reason: "available" };

        // Vérifier si c'est dans le passé
        if (isTimeSlotInPast(date, timeSlot)) {
            return { reason: "past" };
        }

        const [hours] = timeSlot.split(":").map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, 0, 0, 0);

        const slotEnd = new Date(date);
        slotEnd.setHours(hours + 1, 0, 0, 0);

        // PRIORITÉ 1: Vérifier conflit avec réservations du coach connecté
        const conflictingBooking = findConflictingCoachBooking(date, timeSlot);
        if (conflictingBooking) {
            return { reason: "coach-booked", conflictingBooking };
        }

        // PRIORITÉ 2: Vérifier conflit avec autres réservations de la place
        if (
            Array.isArray(placeBookings) &&
            placeBookings.some((booking) => {
                const bookingStart = new Date(booking.dateStart);
                const bookingEnd = new Date(booking.dateEnd);
                const isSameDay = bookingStart.toDateString() === slotStart.toDateString();

                /**
                 * S'assurer que ce n'est pas une réservation du coach connecté
                 * (au cas où elle serait incluse dans placeBookings)
                 */
                const isCurrentCoachBooking =
                    global.user &&
                    booking.coach &&
                    (booking.coach === global.user.id.toString() || booking.coach === `/api/users/${global.user.id}`);

                return isSameDay && slotStart < bookingEnd && slotEnd > bookingStart && !isCurrentCoachBooking;
            })
        ) {
            return { reason: "place-booked" };
        }

        return { reason: "available" };
    };

    // Fonction pour vérifier si un créneau est dans le passé (pour aujourd'hui uniquement)
    const isTimeSlotInPast = (date: string, timeSlot: string): boolean => {
        if (!date) return false;

        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        // Seulement pour aujourd'hui
        if (selectedDate.getTime() !== today.getTime()) {
            return false;
        }

        const [hours] = timeSlot.split(":").map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, 0, 0, 0);

        return slotStart <= now;
    };

    // Fonction pour vérifier si un créneau horaire est disponible
    const isTimeSlotAvailable = (date: string, timeSlot: string): boolean => {
        if (!date) return true;

        const [hours] = timeSlot.split(":").map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, 0, 0, 0);

        const slotEnd = new Date(date);
        slotEnd.setHours(hours + 1, 0, 0, 0);

        // Vérifier si le créneau est dans le passé pour aujourd'hui
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        // Si c'est aujourd'hui et que le créneau est dans le passé
        if (selectedDate.getTime() === today.getTime()) {
            if (slotStart <= now) {
                return false; // Créneau dans le passé
            }
        }

        // Fonction helper pour vérifier les conflits avec une liste de réservations
        const hasConflictWithBookings = (bookings: Booking[]) => {
            if (!Array.isArray(bookings) || bookings.length === 0) {
                return false;
            }

            return bookings.some((booking) => {
                const bookingStart = new Date(booking.dateStart);
                const bookingEnd = new Date(booking.dateEnd);

                // Vérifier si les dates sont le même jour
                const isSameDay = bookingStart.toDateString() === slotStart.toDateString();

                if (!isSameDay) return false;

                // Vérifier le chevauchement
                return slotStart < bookingEnd && slotEnd > bookingStart;
            });
        };

        // Vérifier les conflits avec les réservations de la place
        if (hasConflictWithBookings(placeBookings)) {
            return false;
        }

        // Vérifier les conflits avec les réservations du coach
        if (hasConflictWithBookings(coachBookings)) {
            return false;
        }

        return true;
    };

    // Gestion de la sélection de date sur le calendrier
    const handleDayPress = (day: DateData): void => {
        setSelectedDate(day.dateString);
        // Réinitialiser les créneaux horaires lors du changement de date
        setSelectedTimeSlots([]);
    };

    // Gestion de la sélection des créneaux horaires
    const handleTimeSlotPress = (timeSlot: string): void => {
        // Vérifier si le créneau est disponible
        if (!isTimeSlotAvailable(selectedDate, timeSlot)) {
            const unavailabilityInfo = getUnavailabilityReason(selectedDate, timeSlot);
            let title = "Créneau indisponible";
            let message = "Ce créneau horaire n'est pas disponible";

            switch (unavailabilityInfo.reason) {
                case "past":
                    title = "Créneau passé";
                    message = "Ce créneau est dans le passé";
                    break;
                case "place-booked":
                    title = "Installation occupée";
                    message = "Ce créneau est déjà réservé sur cette installation";
                    break;
                case "coach-booked":
                    title = "Vous avez déjà une réservation";
                    if (unavailabilityInfo.conflictingBooking) {
                        const booking = unavailabilityInfo.conflictingBooking;
                        const startTime = new Date(booking.dateStart).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        const endTime = new Date(booking.dateEnd).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        message = `Vous avez déjà une réservation de ${startTime} à ${endTime} sur :\n\n${booking.placeEquipmentName}`;
                    } else {
                        message = "Vous avez déjà une réservation à ce moment-là";
                    }
                    break;
            }

            Alert.alert(title, message);
            return;
        }

        // Vérifier si le créneau est déjà sélectionné
        if (selectedTimeSlots.includes(timeSlot)) {
            // Trier les créneaux pour trouver la position de celui qui est cliqué
            const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
                return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]);
            });

            const clickedIndex = sortedSlots.indexOf(timeSlot);

            // Si c'est le premier créneau ou un créneau du milieu
            if (clickedIndex >= 0) {
                // Garder tous les créneaux avant celui-ci et supprimer celui-ci et tous ceux qui suivent
                const newSelection = sortedSlots.slice(0, clickedIndex);
                setSelectedTimeSlots(newSelection);
            }
        } else {
            // Essayer d'ajouter le nouveau créneau
            const hourToAdd = parseInt(timeSlot.split(":")[0]);

            // Si aucun créneau n'est sélectionné, l'ajouter simplement
            if (selectedTimeSlots.length === 0) {
                setSelectedTimeSlots([timeSlot]);
                return;
            }

            // Trouver les heures min et max actuellement sélectionnées
            const hours = selectedTimeSlots.map((slot) => parseInt(slot.split(":")[0]));
            const minHour = Math.min(...hours);
            const maxHour = Math.max(...hours);

            // Le nouveau créneau doit être adjacent à la sélection actuelle et disponible
            if (hourToAdd === minHour - 1 || hourToAdd === maxHour + 1) {
                // Vérifier que tous les créneaux entre min et max sont disponibles
                const startHour = Math.min(minHour, hourToAdd);
                const endHour = Math.max(maxHour, hourToAdd);

                let allAvailable = true;
                for (let h = startHour; h <= endHour; h++) {
                    const checkSlot = `${h.toString().padStart(2, "0")}:00`;
                    if (!isTimeSlotAvailable(selectedDate, checkSlot) && !selectedTimeSlots.includes(checkSlot)) {
                        allAvailable = false;
                        break;
                    }
                }

                if (allAvailable) {
                    setSelectedTimeSlots([...selectedTimeSlots, timeSlot]);
                } else {
                    Alert.alert("Créneau indisponible", "Un ou plusieurs créneaux dans cette plage sont déjà réservés");
                }
            } else {
                Alert.alert("Erreur", "Vous devez sélectionner des créneaux consécutifs");
            }
        }
    };

    // Convertir les créneaux en objets Date pour l'API
    const getTimeFromSlot = (dateString: string, timeSlot: string): Date | null => {
        if (!dateString) return null;

        const [hours, minutes] = timeSlot.split(":").map(Number);
        const date = new Date(dateString);
        date.setHours(hours, minutes, 0, 0);

        return date;
    };

    // Fonction pour combiner la date et l'heure en ISO string
    const combineDateAndTime = (dateString: string, timeSlot: string): string | null => {
        if (!dateString) return null;

        const dateTime = getTimeFromSlot(dateString, timeSlot);
        return dateTime ? dateTime.toISOString() : null;
    };

    // Soumission du formulaire
    const handleSubmit = async () => {
        // Vérification des champs obligatoires
        if (!selectedDate) {
            Alert.alert("Erreur", "Veuillez sélectionner une date");
            return;
        }

        if (selectedTimeSlots.length === 0) {
            Alert.alert("Erreur", "Veuillez sélectionner au moins un créneau horaire");
            return;
        }

        // Trier les créneaux et obtenir le premier et le dernier
        const sortedTimeSlots = [...selectedTimeSlots].sort((a, b) => {
            return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]);
        });

        const firstTimeSlot = sortedTimeSlots[0];
        const lastTimeSlot = sortedTimeSlots[sortedTimeSlots.length - 1];

        // Pour l'heure de fin, ajouter une heure au dernier créneau
        const lastHour = parseInt(lastTimeSlot.split(":")[0]);
        const endTimeSlot = `${(lastHour + 1).toString().padStart(2, "0")}:00`;

        // Créer les dates ISO pour l'API
        const dateStart = combineDateAndTime(selectedDate, firstTimeSlot);
        const dateEnd = combineDateAndTime(selectedDate, endTimeSlot);

        if (!dateStart || !dateEnd) {
            Alert.alert("Erreur", "Dates invalides");
            return;
        }

        // Récupérer l'ID du coach à partir des données utilisateur globales
        if (!global.user || global.user.type !== "coach") {
            Alert.alert("Erreur", "Vous devez être connecté en tant que coach pour réserver");
            return;
        }

        const coachId = global.user.id;

        // Préparer les données pour l'API
        const bookingData = {
            dateStart,
            dateEnd,
            price: Number(price),
            place: "/api/places/" + placeId,
            coach: "/api/users/" + coachId,
        };

        try {
            setIsSubmitting(true);

            // Récupérer le token d'authentification
            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                Alert.alert("Erreur", "Vous devez être connecté pour effectuer une réservation");
                router.replace("/(auth)/login" as any);
                return;
            }

            // Envoyer la demande à l'API
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la création de la réservation");
            }

            // Succès
            Alert.alert("Réservation confirmée", "Votre réservation a été enregistrée avec succès !", [
                { text: "OK", onPress: () => router.push("/(coach)/my-bookings" as any) },
            ]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Définir les dates marquées pour le calendrier
    const markedDates = selectedDate
        ? {
              [selectedDate]: { selected: true, selectedColor: currentTheme.primary },
          }
        : {};

    // Obtenir la date minimale (aujourd'hui)
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    // Limiter le nombre de créneaux affichés si showAllTimeSlots est false
    const displayedTimeSlots = showAllTimeSlots ? timeSlots : timeSlots.slice(0, 6);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
        >
            <ScrollView style={styles.scrollView}>
                {/* Informations sur l'installation */}
                <View style={styles.placeInfo}>
                    <Ionicons name="business-outline" size={24} style={styles.placeInfoIcon} />
                    <Text style={styles.placeName}>{placeName}</Text>
                </View>

                {/* Sélecteur de date */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sélectionnez une date</Text>
                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        minDate={minDate}
                        enableSwipeMonths={true}
                        theme={{
                            calendarBackground: currentTheme.lightBackground,
                            arrowColor: currentTheme.primary, // Couleur des flèches de navigation (mois précédent/suivant)

                            todayTextColor: currentTheme.primary, // Couleur du jour actuel (aujourd'hui)
                            todayBackgroundColor: "transparent", // Fond transparent
                            // Autres propriétés du thème
                            textSectionTitleColor: currentTheme.text,
                            monthTextColor: currentTheme.text,
                            selectedDayTextColor: currentTheme.white,
                            selectedDayBackgroundColor: currentTheme.primary,
                            dayTextColor: currentTheme.text,
                            textDisabledColor: currentTheme.secondaryText,
                        }}
                    />
                </View>

                {/* Sélection de l'heure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sélectionnez les horaires</Text>

                    {selectedDate ? (
                        <>
                            {isLoadingBookings && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={currentTheme.primary} />
                                    <Text style={styles.loadingText}>Chargement des disponibilités...</Text>
                                </View>
                            )}

                            <Text style={styles.instructionText}>
                                {selectedTimeSlots.length === 0
                                    ? "Sélectionnez un ou plusieurs créneaux horaires consécutifs"
                                    : `${selectedTimeSlots.length} créneau(x) sélectionné(s)`}
                            </Text>

                            <View style={styles.timeSlotsContainer}>
                                {displayedTimeSlots.map((timeSlot) => {
                                    // Déterminer l'état du créneau
                                    const isSelected = selectedTimeSlots.includes(timeSlot);
                                    const isAvailable = isTimeSlotAvailable(selectedDate, timeSlot);
                                    const unavailabilityInfo = getUnavailabilityReason(selectedDate, timeSlot);

                                    // Déterminer l'icône et le style à utiliser
                                    let icon = null;
                                    let additionalStyle = {};
                                    let additionalTextStyle = {};

                                    if (!isAvailable) {
                                        switch (unavailabilityInfo.reason) {
                                            case "past":
                                                icon = (
                                                    <Ionicons name="time-outline" size={12} style={styles.pastIcon} />
                                                );
                                                additionalStyle = styles.pastTimeSlot;
                                                additionalTextStyle = styles.pastTimeSlotText;
                                                break;
                                            case "place-booked":
                                                icon = (
                                                    <Ionicons
                                                        name="lock-closed"
                                                        size={12}
                                                        style={styles.placeBookedIcon}
                                                    />
                                                );
                                                additionalStyle = styles.unavailableTimeSlot;
                                                additionalTextStyle = styles.unavailableTimeSlotText;
                                                break;
                                            case "coach-booked":
                                                icon = (
                                                    <Ionicons name="person" size={12} style={styles.coachBookedIcon} />
                                                );
                                                additionalStyle = styles.coachBookedTimeSlot;
                                                additionalTextStyle = styles.coachBookedTimeSlotText;
                                                break;
                                        }
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={timeSlot}
                                            style={[
                                                styles.timeSlot,
                                                isSelected && styles.selectedTimeSlot,
                                                !isAvailable && additionalStyle,
                                            ]}
                                            onPress={() => handleTimeSlotPress(timeSlot)}
                                            disabled={!isAvailable}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeSlotText,
                                                    isSelected && styles.selectedTimeSlotText,
                                                    !isAvailable && additionalTextStyle,
                                                ]}
                                            >
                                                {timeSlot}
                                            </Text>
                                            {icon}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {timeSlots.length > 6 && (
                                <TouchableOpacity
                                    style={styles.showMoreButton}
                                    onPress={() => setShowAllTimeSlots(!showAllTimeSlots)}
                                >
                                    <Text style={styles.showMoreButtonText}>
                                        {showAllTimeSlots ? "Voir moins" : "Voir plus"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <Text style={styles.noDateSelectedText}>Veuillez d'abord sélectionner une date</Text>
                    )}
                </View>

                {/* Prix */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prix</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>Prix calculé automatiquement :</Text>
                        <Text style={styles.priceValue}>{price} €</Text>
                    </View>
                    <Text style={styles.priceInfo}>Tarif : {pricePerSlot} € par créneau horaire</Text>
                </View>

                {/* Résumé de la réservation */}
                {selectedDate && selectedTimeSlots.length > 0 && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>Résumé de votre réservation</Text>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Date:</Text>
                            <Text style={styles.summaryValue}>
                                {new Date(selectedDate).toLocaleDateString("fr-FR", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Horaires:</Text>
                            <Text style={styles.summaryValue}>
                                {(() => {
                                    if (selectedTimeSlots.length === 0) return "";
                                    const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
                                        return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]);
                                    });
                                    const firstSlot = sortedSlots[0];
                                    const lastSlot = sortedSlots[sortedSlots.length - 1];
                                    const lastHour = parseInt(lastSlot.split(":")[0]) + 1;
                                    const endTime = `${lastHour.toString().padStart(2, "0")}:00`;
                                    return `${firstSlot} - ${endTime}`;
                                })()}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Durée:</Text>
                            <Text style={styles.summaryValue}>{selectedTimeSlots.length} heure(s)</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Installation:</Text>
                            <Text style={styles.summaryValue}>{placeName}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Prix:</Text>
                            <Text style={styles.summaryValue}>
                                {price} € ({selectedTimeSlots.length} × {pricePerSlot} €)
                            </Text>
                        </View>
                    </View>
                )}

                {/* Bouton de soumission */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!selectedDate || selectedTimeSlots.length === 0 || isSubmitting) && styles.disabledButton,
                    ]}
                    onPress={handleSubmit}
                    disabled={!selectedDate || selectedTimeSlots.length === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={currentTheme.white} size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Confirmer la réservation</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
