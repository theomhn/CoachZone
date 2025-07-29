import getStyles from "@/assets/styles/bookingScreen";
import Button from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { BookingService, PlaceService } from "@/services";
import { Booking } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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
            if (!global.user || global.user.type !== "ROLE_COACH") {
                router.replace("/(auth)/login" as any);
                return;
            }
        }, [])
    );

    // Paramètres pour création ET modification
    const {
        placeId,
        placeName,
        placePrice,
        // Paramètres spécifiques à la modification
        bookingId,
        currentStartDate,
        currentEndDate,
    } = useLocalSearchParams<{
        placeId: string;
        placeName: string;
        placePrice: string;
        // Paramètres optionnels pour l'édition
        bookingId?: string;
        currentStartDate?: string;
        currentEndDate?: string;
    }>();

    // Déterminer le mode : édition si bookingId est présent
    const isEditMode = !!bookingId;
    const router = useRouter();

    // Récupérer le thème actuel et les couleurs associées
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // Si pas coach, ne pas afficher l'écran
    if (!global.user || global.user.type !== "ROLE_COACH") {
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

    // En mode édition, pré-remplir les données
    useEffect(() => {
        if (isEditMode && currentStartDate && currentEndDate) {
            // Parser manuellement les dates ISO pour éviter la conversion de fuseau horaire
            const startMatch = currentStartDate.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
            const endMatch = currentEndDate.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

            if (startMatch && endMatch) {
                const [, year, month, day, startHour] = startMatch;
                const [, , , , endHour] = endMatch;

                // Définir la date sélectionnée en format YYYY-MM-DD
                const dateString = `${year}-${month}-${day}`;
                setSelectedDate(dateString);

                // Calculer les créneaux horaires
                const timeSlots = [];
                const currentHour = parseInt(startHour, 10);
                const finalHour = parseInt(endHour, 10);

                for (let hour = currentHour; hour < finalHour; hour++) {
                    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
                }
                setSelectedTimeSlots(timeSlots);
            }
        }
    }, [isEditMode, currentStartDate, currentEndDate]);

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
        if (!global.user || global.user.type !== "ROLE_COACH") return;

        try {
            const data = await BookingService.getMyBookings();
            const activeBookings = data.filter((booking) => booking.status !== "cancelled");
            setCoachBookings(activeBookings);
        } catch (error) {
            // Erreur silencieuse pour la récupération des réservations du coach
            setCoachBookings([]);
        }
    };

    // Fonction pour récupérer les réservations de la place
    const fetchPlaceBookings = async () => {
        if (!placeId) return;

        try {
            setIsLoadingBookings(true);
            const data = await PlaceService.getPlaceById(placeId);
            const bookings = Array.isArray(data.upcomingBookings) ? data.upcomingBookings : [];

            // Garder toutes les réservations (actives ET annulées) pour un affichage correct
            const allBookings = bookings.filter((booking: any) => booking);
            setPlaceBookings(allBookings);
        } catch (error) {
            // Erreur silencieuse pour la récupération des réservations de la place
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

    // Recharger les données quand l'écran reprend le focus
    useFocusEffect(
        useCallback(() => {
            fetchPlaceBookings();
            fetchCoachBookings();
        }, [placeId])
    );

    // Fonction pour trouver la réservation conflictuelle du coach
    const findConflictingCoachBooking = (date: string, timeSlot: string): Booking | null => {
        if (!Array.isArray(coachBookings) || coachBookings.length === 0) {
            return null;
        }

        const [hours] = timeSlot.split(":").map(Number);
        const [year, month, day] = date.split("-").map(Number);
        const slotStart = new Date(year, month - 1, day, hours, 0, 0, 0);
        const slotEnd = new Date(year, month - 1, day, hours + 1, 0, 0, 0);

        return (
            coachBookings.find((booking) => {
                // Parser manuellement les dates de réservation pour éviter les conversions de fuseau
                const startMatch = booking.dateStart.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
                const endMatch = booking.dateEnd.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

                if (!startMatch || !endMatch) return false;

                const [, bYear, bMonth, bDay, bStartHour, bStartMin] = startMatch;
                const [, , , , bEndHour, bEndMin] = endMatch;

                const bookingStart = new Date(
                    parseInt(bYear),
                    parseInt(bMonth) - 1,
                    parseInt(bDay),
                    parseInt(bStartHour),
                    parseInt(bStartMin),
                    0,
                    0
                );
                const bookingEnd = new Date(
                    parseInt(bYear),
                    parseInt(bMonth) - 1,
                    parseInt(bDay),
                    parseInt(bEndHour),
                    parseInt(bEndMin),
                    0,
                    0
                );

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
        const [year, month, day] = date.split("-").map(Number);
        const slotStart = new Date(year, month - 1, day, hours, 0, 0, 0);
        const slotEnd = new Date(year, month - 1, day, hours + 1, 0, 0, 0);

        // PRIORITÉ 1: Vérifier conflit avec réservations du coach connecté
        const conflictingBooking = findConflictingCoachBooking(date, timeSlot);
        if (conflictingBooking) {
            // En mode édition, exclure la réservation actuelle du conflit
            if (isEditMode && conflictingBooking.id?.toString() === bookingId) {
                // C'est la réservation qu'on est en train de modifier, pas un conflit
            } else {
                return { reason: "coach-booked", conflictingBooking };
            }
        }

        // PRIORITÉ 2: Vérifier conflit avec autres réservations de la place
        if (
            Array.isArray(placeBookings) &&
            placeBookings.some((booking) => {
                // En mode édition, exclure la réservation actuelle
                if (isEditMode && booking.id?.toString() === bookingId) {
                    return false;
                }

                // Parser manuellement les dates de réservation pour éviter les conversions de fuseau
                const startMatch = booking.dateStart.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
                const endMatch = booking.dateEnd.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

                if (!startMatch || !endMatch) return false;

                const [, bYear, bMonth, bDay, bStartHour, bStartMin] = startMatch;
                const [, , , , bEndHour, bEndMin] = endMatch;

                const bookingStart = new Date(
                    parseInt(bYear),
                    parseInt(bMonth) - 1,
                    parseInt(bDay),
                    parseInt(bStartHour),
                    parseInt(bStartMin),
                    0,
                    0
                );
                const bookingEnd = new Date(
                    parseInt(bYear),
                    parseInt(bMonth) - 1,
                    parseInt(bDay),
                    parseInt(bEndHour),
                    parseInt(bEndMin),
                    0,
                    0
                );
                const isSameDay = bookingStart.toDateString() === slotStart.toDateString();

                /**
                 * Ignorer les réservations annulées pour les conflits avec d'autres coachs
                 * SAUF si c'est le coach connecté (il doit voir ses propres réservations annulées)
                 */
                const isCurrentCoachBooking =
                    global.user &&
                    (booking.coachId === parseInt(global.user.id) ||
                        booking.coach === global.user.id.toString() ||
                        booking.coach === `/api/users/${global.user.id}`);

                // Si la réservation est annulée ET que ce n'est pas celle du coach connecté,
                // ne pas la considérer comme un conflit
                const isCancelledByOther =
                    (booking.status === "cancelled" || booking.status === "canceled") && !isCurrentCoachBooking;

                if (isCancelledByOther) {
                    return false;
                }

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

        // Parser manuellement la date pour éviter les conversions de fuseau
        const [year, month, day] = date.split("-").map(Number);
        const selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0);

        // Seulement pour aujourd'hui
        if (selectedDate.getTime() !== today.getTime()) {
            return false;
        }

        const [hours] = timeSlot.split(":").map(Number);
        const slotStart = new Date(year, month - 1, day, hours, 0, 0, 0);

        return slotStart <= now;
    };

    // Fonction pour vérifier si un créneau horaire est disponible
    const isTimeSlotAvailable = (date: string, timeSlot: string): boolean => {
        if (!date) return true;

        // EN MODE ÉDITION: Seuls les créneaux passés sont indisponibles
        if (isEditMode) {
            return !isTimeSlotInPast(date, timeSlot);
        }

        const [hours] = timeSlot.split(":").map(Number);
        const [year, month, day] = date.split("-").map(Number);
        const slotStart = new Date(year, month - 1, day, hours, 0, 0, 0);
        const slotEnd = new Date(year, month - 1, day, hours + 1, 0, 0, 0);

        // Vérifier si le créneau est dans le passé pour aujourd'hui
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0);

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
                // Ignorer les réservations annulées par d'autres coachs
                const isCurrentCoachBooking =
                    global.user &&
                    (booking.coachId === parseInt(global.user.id) ||
                        booking.coach === global.user.id.toString() ||
                        booking.coach === `/api/users/${global.user.id}`);

                const isCancelledByOther =
                    (booking.status === "cancelled" || booking.status === "canceled") && !isCurrentCoachBooking;

                if (isCancelledByOther) {
                    return false;
                }

                // Parser manuellement les dates de réservation pour éviter les conversions de fuseau
                const startMatch = booking.dateStart.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
                const endMatch = booking.dateEnd.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

                if (!startMatch || !endMatch) return false;

                const [, bYear, bMonth, bDay, bStartHour, bStartMin] = startMatch;
                const [, , , , bEndHour, bEndMin] = endMatch;

                const bookingStart = new Date(
                    parseInt(bYear),
                    parseInt(bMonth) - 1,
                    parseInt(bDay),
                    parseInt(bStartHour),
                    parseInt(bStartMin),
                    0,
                    0
                );
                const bookingEnd = new Date(
                    parseInt(bYear),
                    parseInt(bMonth) - 1,
                    parseInt(bDay),
                    parseInt(bEndHour),
                    parseInt(bEndMin),
                    0,
                    0
                );

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
        const isAvailable = isTimeSlotAvailable(selectedDate, timeSlot);

        // Si le créneau n'est pas disponible, ne rien faire (pas d'alerte)
        if (!isAvailable) {
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
                    Alert.alert(
                        "🚫 Plage indisponible",
                        `Impossible d'étendre votre sélection jusqu'à ${timeSlot}.\n\nUn ou plusieurs créneaux dans cette plage horaire sont déjà réservés.\n\n💡 Conseil : Sélectionnez des créneaux disponibles individuellement.`
                    );
                }
            } else {
                Alert.alert(
                    "⚠️ Sélection non consécutive",
                    `Le créneau ${timeSlot} n'est pas adjacent à votre sélection actuelle.\n\nVous devez sélectionner des créneaux horaires consécutifs pour former une réservation continue.\n\n💡 Conseil : Choisissez un créneau juste avant ou après votre sélection.`
                );
            }
        }
    };

    // Convertir les créneaux en objets Date pour l'API (en tenant compte du fuseau horaire local)
    const getTimeFromSlot = (dateString: string, timeSlot: string): Date | null => {
        if (!dateString) return null;

        const [hours, minutes] = timeSlot.split(":").map(Number);

        // Créer la date en utilisant les composants individuels pour éviter les problèmes de fuseau horaire
        const [year, month, day] = dateString.split("-").map(Number);
        const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

        return date;
    };

    // Fonction pour combiner la date et l'heure en ISO string (avec gestion du fuseau horaire)
    const combineDateAndTime = (dateString: string, timeSlot: string): string | null => {
        if (!dateString) return null;

        const dateTime = getTimeFromSlot(dateString, timeSlot);
        if (!dateTime) return null;

        // Créer une ISO string en gardant le fuseau horaire local
        // Utiliser la méthode qui préserve le fuseau horaire local
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, "0");
        const day = String(dateTime.getDate()).padStart(2, "0");
        const hour = String(dateTime.getHours()).padStart(2, "0");
        const minute = String(dateTime.getMinutes()).padStart(2, "0");
        const second = String(dateTime.getSeconds()).padStart(2, "0");

        // Format ISO simple sans fuseau horaire
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
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

        // Vérifier que l'utilisateur est bien un coach
        if (!global.user || global.user.type !== "ROLE_COACH") {
            Alert.alert("Erreur", "Vous devez être connecté en tant que coach pour réserver");
            return;
        }

        try {
            setIsSubmitting(true);

            if (isEditMode && bookingId) {
                await BookingService.updateBooking(bookingId, {
                    placeId,
                    date: dateStart.split("T")[0],
                    startTime: dateStart.split("T")[1],
                    endTime: dateEnd.split("T")[1],
                });
            } else {
                await BookingService.createBooking({
                    placeId,
                    date: dateStart.split("T")[0],
                    startTime: dateStart.split("T")[1],
                    endTime: dateEnd.split("T")[1],
                    price: Number(price),
                });
            }

            const successTitle = isEditMode ? "Réservation modifiée" : "Réservation confirmée";
            const successMessage = isEditMode
                ? "Votre réservation a été modifiée avec succès !"
                : "Votre réservation a été enregistrée avec succès !";

            Alert.alert(successTitle, successMessage, [
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
                {/* Bandeau d'information en mode édition */}
                {isEditMode && (
                    <View style={styles.editModeHeader}>
                        <Ionicons name="create-outline" size={20} style={styles.editModeIcon} />
                        <Text style={styles.editModeText}>✏️ Modification d'une réservation existante</Text>
                    </View>
                )}

                {/* Informations sur l'installation */}
                <View style={styles.placeInfo}>
                    <Ionicons name="business-outline" size={24} style={styles.placeInfoIcon} />
                    <Text style={styles.placeName}>{placeName}</Text>
                </View>

                {/* Sélecteur de date */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{isEditMode ? "Modifier la date" : "Sélectionnez une date"}</Text>
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
                    <Text style={styles.sectionTitle}>
                        {isEditMode ? "Modifier les horaires" : "Sélectionnez les horaires"}
                    </Text>

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
                                <Button
                                    title={showAllTimeSlots ? "Voir moins" : "Voir plus"}
                                    onPress={() => setShowAllTimeSlots(!showAllTimeSlots)}
                                    variant="secondary"
                                    size="small"
                                    style={{ marginTop: 10, alignSelf: "center" }}
                                />
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
                        <Text style={styles.summaryTitle}>
                            {isEditMode ? "Résumé des modifications" : "Résumé de votre réservation"}
                        </Text>
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
                <Button
                    title={isEditMode ? "Confirmer les modifications" : "Confirmer la réservation"}
                    onPress={handleSubmit}
                    variant="success"
                    disabled={!selectedDate || selectedTimeSlots.length === 0}
                    loading={isSubmitting}
                    fullWidth
                    style={styles.submitButton}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
