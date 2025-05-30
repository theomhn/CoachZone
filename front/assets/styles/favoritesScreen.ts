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
            backgroundColor: currentTheme.background,
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: currentTheme.text,
        },
        loadingIndicator: {
            color: currentTheme.primary,
        },
        listContainer: {
            padding: 16,
        },
        institutionCard: {
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            backgroundColor: currentTheme.cardBackground,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        institutionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        institutionInfo: {
            flex: 1,
            marginRight: 12,
        },
        institutionName: {
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 4,
            color: currentTheme.text,
        },
        institutionNumber: {
            fontSize: 14,
            marginBottom: 4,
            color: currentTheme.secondaryText,
        },
        institutionAddress: {
            fontSize: 14,
            fontStyle: "italic",
            marginBottom: 4,
            color: currentTheme.secondaryText,
        },
        coordinates: {
            fontSize: 12,
            fontFamily: "monospace",
            color: currentTheme.secondaryText,
        },
        favoriteButton: {
            padding: 8,
        },
        activitiesContainer: {
            marginTop: 12,
        },
        activitiesList: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        equipmentsContainer: {
            marginTop: 8,
        },
        equipmentsList: {
            flexDirection: "row",
            gap: 16,
        },
        equipmentItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
        },
        equipmentText: {
            fontSize: 14,
            color: currentTheme.text,
        },
        successIcon: {
            color: currentTheme.success,
        },
        errorIcon: {
            color: currentTheme.danger,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
            color: currentTheme.text,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
        },
        emptyIcon: {
            color: currentTheme.secondaryText,
        },
        emptyTitle: {
            fontSize: 24,
            fontWeight: "bold",
            marginTop: 16,
            marginBottom: 8,
            color: currentTheme.text,
        },
        emptySubtitle: {
            fontSize: 16,
            textAlign: "center",
            lineHeight: 24,
            color: currentTheme.secondaryText,
        },
        refreshControl: {
            tintColor: currentTheme.primary,
        },
    });
}
