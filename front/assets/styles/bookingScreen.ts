import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        scrollView: {
            flex: 1,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: currentTheme.background,
            elevation: 2,
            shadowColor: currentTheme.shadow,
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
            color: currentTheme.text,
        },
        placeInfo: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: currentTheme.lightBackground,
            padding: 16,
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
        },
        placeInfoIcon: {
            color: currentTheme.secondaryText,
            marginRight: 10,
        },
        placeName: {
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 10,
            marginRight: 10,
            color: currentTheme.text,
        },
        editModeHeader: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: currentTheme.warning + "20", // Couleur warning avec opacité
            padding: 12,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: currentTheme.warning,
        },
        editModeIcon: {
            color: currentTheme.warning,
            marginRight: 8,
        },
        editModeText: {
            fontSize: 14,
            fontWeight: "500",
            color: currentTheme.warning,
        },
        section: {
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginBottom: 16,
            elevation: 2,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 16,
            color: currentTheme.text,
        },
        instructionText: {
            fontSize: 14,
            color: currentTheme.text,
            marginBottom: 16,
            fontStyle: "italic",
        },
        noDateSelectedText: {
            fontSize: 14,
            color: currentTheme.secondaryText,
            fontStyle: "italic",
            textAlign: "center",
            padding: 20,
        },
        // Styles pour le conteneur de chargement
        loadingContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            paddingVertical: 10,
        },
        loadingText: {
            fontSize: 14,
            color: currentTheme.secondaryText,
            marginLeft: 8,
            fontStyle: "italic",
        },
        timeSlotsContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            gap: 10,
        },
        timeSlot: {
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 8,
            backgroundColor: currentTheme.cardBackground,
            borderWidth: 1,
            borderColor: currentTheme.border,
            minWidth: "30%",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            flexDirection: "row",
        },
        timeSlotText: {
            fontSize: 14,
            color: currentTheme.text,
        },
        selectedTimeSlot: {
            backgroundColor: currentTheme.primary,
            borderColor: currentTheme.primary,
        },
        selectedTimeSlotText: {
            color: currentTheme.white,
            fontWeight: "600",
        },
        // Styles pour les créneaux indisponibles (place réservée)
        unavailableTimeSlot: {
            backgroundColor: currentTheme.lightBackground,
            borderColor: currentTheme.border,
            opacity: 0.5,
        },
        unavailableTimeSlotText: {
            color: currentTheme.secondaryText,
            textDecorationLine: "line-through",
        },
        // Styles pour les créneaux passés
        pastTimeSlot: {
            backgroundColor: currentTheme.lightBackground,
            borderColor: currentTheme.border,
            opacity: 0.3,
        },
        pastTimeSlotText: {
            color: currentTheme.secondaryText,
            fontSize: 12,
        },
        // Styles pour les créneaux où le coach a déjà une réservation
        coachBookedTimeSlot: {
            backgroundColor: currentTheme.lightBackground,
            borderColor: currentTheme.warning,
            opacity: 0.6,
        },
        coachBookedTimeSlotText: {
            color: currentTheme.warning,
            fontSize: 12,
            fontWeight: "500",
        },
        // Icônes pour les créneaux verrouillés
        lockIcon: {
            marginLeft: 4,
        },
        // Icône pour les créneaux passés
        pastIcon: {
            marginLeft: 4,
            color: currentTheme.secondaryText,
        },
        // Icône pour les créneaux réservés (place)
        placeBookedIcon: {
            marginLeft: 4,
            color: currentTheme.secondaryText,
        },
        // Icône pour les créneaux où le coach a déjà une réservation
        coachBookedIcon: {
            marginLeft: 4,
            color: currentTheme.warning,
        },
        showMoreButton: {
            alignSelf: "center",
            marginTop: 16,
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 20,
        },
        showMoreButtonText: {
            fontSize: 14,
            color: currentTheme.primary,
            fontWeight: "500",
        },
        priceContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 10,
        },
        priceText: {
            fontSize: 14,
            color: currentTheme.text,
        },
        priceValue: {
            fontSize: 18,
            fontWeight: "bold",
            color: currentTheme.success,
        },
        priceInfo: {
            fontSize: 12,
            color: currentTheme.secondaryText,
            fontStyle: "italic",
            marginTop: 10,
        },
        summaryContainer: {
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginBottom: 24,
            elevation: 2,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        summaryTitle: {
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 16,
            color: currentTheme.text,
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
            color: currentTheme.text,
        },
        summaryValue: {
            flex: 1,
            fontSize: 14,
            color: currentTheme.text,
        },
        submitButton: {
            backgroundColor: currentTheme.success,
            padding: 16,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 32,
            alignItems: "center",
            elevation: 2,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
        },
        disabledButton: {
            backgroundColor: currentTheme.greenLight,
        },
        submitButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
        },
    });
}
