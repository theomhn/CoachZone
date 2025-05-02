import { StyleSheet } from "react-native";
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        color: "#666",
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
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoSection: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center", // Centrer verticalement le texte avec les icônes
        marginBottom: 12,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
        paddingRight: 5,
    },
    infoValue: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    // Nouveaux styles pour les titres de section avec alignement
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
        color: "#333",
    },
    // Ancien style maintenu pour la compatibilité
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
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
        color: "#333",
    },
    placesLoading: {
        marginVertical: 20,
    },
    placesContainer: {
        marginBottom: 16,
    },
    placeCard: {
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#eaeaea",
        position: "relative",
    },
    selectedPlaceCard: {
        borderColor: "#007AFF",
    },
    placeCardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
    },
    placeCardSubtitle: {
        fontSize: 14,
        color: "#666",
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
        color: "#555",
    },
    placeActivities: {
        marginTop: 4,
    },
    placeActivitiesLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#555",
    },
    placeActivitiesText: {
        fontSize: 13,
        color: "#666",
        fontStyle: "italic",
        marginLeft: 22, // Aligner avec l'icône
    },
    selectedIndicator: {
        position: "absolute",
        top: "50%",
        right: 12,
    },
    noPlacesText: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
    bookingButton: {
        backgroundColor: "#28a745",
        padding: 14,
        marginTop: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
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
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    bookingIcon: {
        marginRight: 4,
    },
});
