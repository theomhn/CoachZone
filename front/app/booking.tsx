import styles from "@/assets/styles/bookingScreen";
import { API_BASE_URL } from "@/config";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

export default function BookingScreen() {
    const { placeId, placeName, placePrice } = useLocalSearchParams<{
        placeId: string;
        placeName: string;
        placePrice: string;
    }>();
    const router = useRouter();

    // Convertir le prix reçu en paramètre en nombre
    const pricePerSlot = placePrice ? parseFloat(placePrice) : 0;

    // États pour stocker les données du formulaire
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
    const [price, setPrice] = useState(0); // Prix calculé automatiquement
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAllTimeSlots, setShowAllTimeSlots] = useState(false);

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

    // Gestion de la sélection de date sur le calendrier
    const handleDayPress = (day: DateData): void => {
        setSelectedDate(day.dateString);
        // Réinitialiser les créneaux horaires lors du changement de date
        setSelectedTimeSlots([]);
    };

    // Gestion de la sélection des créneaux horaires
    const handleTimeSlotPress = (timeSlot: string): void => {
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

            // Le nouveau créneau doit être adjacent à la sélection actuelle
            if (hourToAdd === minHour - 1 || hourToAdd === maxHour + 1) {
                setSelectedTimeSlots([...selectedTimeSlots, timeSlot]);
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
                router.replace("/login");
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
            Alert.alert("Réservation confirmée", "Votre réservation a été enregistrée avec succès !", [{ text: "OK", onPress: () => router.back() }]);
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
              [selectedDate]: { selected: true, selectedColor: Colors.primary },
          }
        : {};

    // Obtenir la date minimale (aujourd'hui)
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    // Limiter le nombre de créneaux affichés si showAllTimeSlots est false
    const displayedTimeSlots = showAllTimeSlots ? timeSlots : timeSlots.slice(0, 6);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}>
            <ScrollView style={styles.scrollView}>
                {/* Informations sur l'installation */}
                <View style={styles.placeInfo}>
                    <Ionicons name="business-outline" size={24} color={Colors.grayDark} />
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
                            todayTextColor: Colors.primary,
                            arrowColor: Colors.primary,
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 14,
                        }}
                    />
                </View>

                {/* Sélection de l'heure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sélectionnez les horaires</Text>

                    {selectedDate ? (
                        <>
                            <Text style={styles.instructionText}>
                                {selectedTimeSlots.length === 0
                                    ? "Sélectionnez un ou plusieurs créneaux horaires consécutifs"
                                    : `${selectedTimeSlots.length} créneau(x) sélectionné(s)`}
                            </Text>

                            <View style={styles.timeSlotsContainer}>
                                {displayedTimeSlots.map((timeSlot) => {
                                    // Déterminer si ce créneau est sélectionné
                                    const isSelected = selectedTimeSlots.includes(timeSlot);

                                    return (
                                        <TouchableOpacity
                                            key={timeSlot}
                                            style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
                                            onPress={() => handleTimeSlotPress(timeSlot)}
                                        >
                                            <Text style={[styles.timeSlotText, isSelected && styles.selectedTimeSlotText]}>{timeSlot}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {timeSlots.length > 6 && (
                                <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllTimeSlots(!showAllTimeSlots)}>
                                    <Text style={styles.showMoreButtonText}>{showAllTimeSlots ? "Voir moins" : "Voir plus"}</Text>
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
                    style={[styles.submitButton, (!selectedDate || selectedTimeSlots.length === 0 || isSubmitting) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!selectedDate || selectedTimeSlots.length === 0 || isSubmitting}
                >
                    {isSubmitting ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.submitButtonText}>Confirmer la réservation</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
