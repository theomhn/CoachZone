import { API_BASE_URL } from "@/config";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function BookingScreen() {
    const { placeId, placeName } = useLocalSearchParams<{ placeId: string; placeName: string }>();
    const router = useRouter();

    // États pour stocker les données du formulaire
    const [selectedDate, setSelectedDate] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [price, setPrice] = useState("50"); // Prix par défaut
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour les pickers de temps
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

    // Format les heures pour l'affichage
    const formatTime = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    // Fonction pour combiner la date et l'heure en ISO string
    const combineDateAndTime = (dateString: string, timeObject: Date): string | null => {
        if (!dateString) return null;

        const date = new Date(dateString);
        date.setHours(timeObject.getHours());
        date.setMinutes(timeObject.getMinutes());
        date.setSeconds(0);

        return date.toISOString();
    };

    // Gestion de la sélection de date sur le calendrier
    const handleDayPress = (day: DateData): void => {
        setSelectedDate(day.dateString);
    };

    // Fonctions pour les sélecteurs de temps
    const showStartTimePicker = () => setStartTimePickerVisibility(true);
    const hideStartTimePicker = () => setStartTimePickerVisibility(false);
    const showEndTimePicker = () => setEndTimePickerVisibility(true);
    const hideEndTimePicker = () => setEndTimePickerVisibility(false);

    const handleStartTimeConfirm = (time: Date): void => {
        setStartTime(time);
        hideStartTimePicker();

        // Si l'heure de fin est avant l'heure de début, ajuster l'heure de fin
        if (time >= endTime) {
            const newEndTime = new Date(time);
            newEndTime.setHours(time.getHours() + 1);
            setEndTime(newEndTime);
        }
    };

    const handleEndTimeConfirm = (time: Date): void => {
        // Vérifier que l'heure de fin est après l'heure de début
        if (time <= startTime) {
            Alert.alert("Erreur", "L'heure de fin doit être après l'heure de début");
            return;
        }

        setEndTime(time);
        hideEndTimePicker();
    };

    // Soumission du formulaire
    const handleSubmit = async () => {
        // Vérification des champs obligatoires
        if (!selectedDate) {
            Alert.alert("Erreur", "Veuillez sélectionner une date");
            return;
        }

        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            Alert.alert("Erreur", "Veuillez entrer un prix valide");
            return;
        }

        // Créer les dates ISO pour l'API
        const dateStart = combineDateAndTime(selectedDate, startTime);
        const dateEnd = combineDateAndTime(selectedDate, endTime);

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
            place: "/api/opendata/places/" + placeId,
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
              [selectedDate]: { selected: true, selectedColor: "#007AFF" },
          }
        : {};

    // Obtenir la date minimale (aujourd'hui)
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}>
            <ScrollView style={styles.scrollView}>
                {/* En-tête */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nouvelle réservation</Text>
                </View>

                {/* Informations sur l'installation */}
                <View style={styles.placeInfo}>
                    <Ionicons name="business-outline" size={24} color="#555" />
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
                            todayTextColor: "#007AFF",
                            arrowColor: "#007AFF",
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 14,
                        }}
                    />
                </View>

                {/* Sélection de l'heure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sélectionnez les horaires</Text>

                    <View style={styles.timeContainer}>
                        <View style={styles.timeInputContainer}>
                            <Text style={styles.timeLabel}>Heure de début</Text>
                            <TouchableOpacity style={styles.timeInput} onPress={showStartTimePicker}>
                                <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                                <Ionicons name="time-outline" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.timeInputContainer}>
                            <Text style={styles.timeLabel}>Heure de fin</Text>
                            <TouchableOpacity style={styles.timeInput} onPress={showEndTimePicker}>
                                <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                                <Ionicons name="time-outline" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* DateTimePickers modaux */}
                    <DateTimePickerModal
                        isVisible={isStartTimePickerVisible}
                        mode="time"
                        onConfirm={handleStartTimeConfirm}
                        onCancel={hideStartTimePicker}
                        date={startTime}
                        minuteInterval={30}
                    />

                    <DateTimePickerModal
                        isVisible={isEndTimePickerVisible}
                        mode="time"
                        onConfirm={handleEndTimeConfirm}
                        onCancel={hideEndTimePicker}
                        date={endTime}
                        minuteInterval={30}
                    />
                </View>

                {/* Prix */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prix</Text>
                    <View style={styles.priceContainer}>
                        <TextInput style={styles.priceInput} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Prix en €" />
                        <Text style={styles.priceCurrency}>€</Text>
                    </View>
                </View>

                {/* Résumé de la réservation */}
                {selectedDate && (
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
                            <Text style={styles.summaryLabel}>Horaire:</Text>
                            <Text style={styles.summaryValue}>
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Installation:</Text>
                            <Text style={styles.summaryValue}>{placeName}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Prix:</Text>
                            <Text style={styles.summaryValue}>{price} €</Text>
                        </View>
                    </View>
                )}

                {/* Bouton de soumission */}
                <TouchableOpacity
                    style={[styles.submitButton, (!selectedDate || isSubmitting) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!selectedDate || isSubmitting}
                >
                    {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Confirmer la réservation</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    placeInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    placeName: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 10,
        color: "#333",
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16,
        color: "#333",
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    timeInputContainer: {
        width: "47%",
    },
    timeLabel: {
        fontSize: 14,
        color: "#555",
        marginBottom: 8,
    },
    timeInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 50,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
    },
    timeText: {
        fontSize: 16,
        color: "#333",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    priceInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    priceCurrency: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
        color: "#333",
    },
    summaryContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
        textAlign: "center",
    },
    summaryItem: {
        flexDirection: "row",
        marginBottom: 8,
    },
    summaryLabel: {
        width: 100,
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
    },
    summaryValue: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    submitButton: {
        backgroundColor: "#28a745",
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 32,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    disabledButton: {
        backgroundColor: "#a0c7a9",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
