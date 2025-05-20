import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        centered: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        errorText: {
            fontSize: 16,
            color: currentTheme.secondaryText,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 30,
        },
        mapContainer: {
            height: 200,
            marginBottom: 16,
        },
        map: {
            width: "100%",
            height: "100%",
        },
        card: {
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            padding: 16,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },

        infoSection: {
            marginBottom: 20,
        },
        infoRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
        },
        infoIcon: {
            marginRight: 8,
            color: currentTheme.secondaryText, // Définir la couleur ici
        },
        infoLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: currentTheme.secondaryText,
            paddingRight: 5,
        },
        infoValue: {
            fontSize: 14,
            color: currentTheme.text,
            flex: 1,
        },
        sectionTitleContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },
        sectionTitleIcon: {
            marginRight: 8,
            color: currentTheme.secondaryText,
        },
        sectionTitleText: {
            fontSize: 16,
            fontWeight: "600",
            color: currentTheme.text,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: currentTheme.text,
            marginBottom: 16,
        },
        facilitiesSection: {
            marginBottom: 20,
        },
        badgeContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        activitiesSection: {
            marginBottom: 20,
        },
        activitiesList: {
            marginLeft: 4,
        },
        activityItem: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        activityIcon: {
            marginRight: 8,
            color: currentTheme.primary,
        },
        activityText: {
            fontSize: 14,
            color: currentTheme.text,
        },
        placesLoading: {
            marginVertical: 20,
            color: currentTheme.primary,
        },
        placesContainer: {
            marginBottom: 16,
        },
        placeCard: {
            backgroundColor: currentTheme.cardBackground,
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
            borderWidth: 2,
            position: "relative",
        },
        selectedPlaceCard: {
            borderColor: currentTheme.primary,
        },
        placeCardTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: currentTheme.text,
            marginBottom: 6,
        },
        placeCardSubtitle: {
            fontSize: 14,
            color: currentTheme.secondaryText,
            marginBottom: 8,
        },
        placeInfoRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
        },
        placeInfoIcon: {
            marginRight: 6,
        },
        placeInfoText: {
            fontSize: 14,
            color: currentTheme.secondaryText,
        },
        placeActivities: {
            marginTop: 4,
        },
        placeActivitiesLabel: {
            fontSize: 14,
            fontWeight: "500",
            color: currentTheme.secondaryText,
        },
        placeActivitiesText: {
            fontSize: 13,
            color: currentTheme.secondaryText,
            fontStyle: "italic",
            marginLeft: 22,
        },
        selectedIndicator: {
            position: "absolute",
            top: "50%",
            right: 12,
        },
        noPlacesText: {
            fontSize: 14,
            color: currentTheme.secondaryText,
            fontStyle: "italic",
            textAlign: "center",
            marginVertical: 10,
        },
        bookingButton: {
            backgroundColor: currentTheme.success,
            padding: 14,
            marginTop: 10,
            borderRadius: 8,
            elevation: 2,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
        },
        bookingButtonContent: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        bookingButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
        },
        bookingIcon: {
            marginRight: 4,
        },
        icon: {
            color: currentTheme.secondaryText,
        },
        iconWhite: {
            color: currentTheme.white,
        },
        iconPrimary: {
            color: currentTheme.icon,
        },
    });
}
