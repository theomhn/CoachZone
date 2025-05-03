import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.grayLightest,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        color: Colors.grayDark,
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
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.grayDark,
        paddingRight: 5,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.grayDarkest,
        flex: 1,
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitleIcon: {
        marginRight: 8,
    },
    sectionTitleText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.grayDarkest,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.grayDarkest,
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
    },
    activityText: {
        fontSize: 14,
        color: Colors.grayDarkest,
    },
    placesLoading: {
        marginVertical: 20,
    },
    placesContainer: {
        marginBottom: 16,
    },
    placeCard: {
        backgroundColor: Colors.grayLightest,
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: Colors.grayLight,
        position: "relative",
    },
    selectedPlaceCard: {
        borderColor: Colors.primary,
    },
    placeCardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.grayDarkest,
        marginBottom: 6,
    },
    placeCardSubtitle: {
        fontSize: 14,
        color: Colors.grayDark,
        marginBottom: 8,
    },
    selectedPlaceCardText: {
        // Style pour le texte de la carte sélectionnée
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
        color: Colors.grayDark,
    },
    placeActivities: {
        marginTop: 4,
    },
    placeActivitiesLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.grayDark,
    },
    placeActivitiesText: {
        fontSize: 13,
        color: Colors.grayDark,
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
        color: Colors.grayDark,
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
    bookingButton: {
        backgroundColor: Colors.success,
        padding: 14,
        marginTop: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: Colors.black,
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
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    bookingIcon: {
        marginRight: 4,
    },
});
