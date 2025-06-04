import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            flexDirection: "row",
            marginBottom: 16,
            alignItems: "center",
        },
        searchContainer: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: currentTheme.background,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },

        searchIcon: {
            marginRight: 8,
            color: currentTheme.placeholder,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: currentTheme.text, // Couleur du texte saisi (pas du placeholder)
        },
        filterButton: {
            marginLeft: 12,
            paddingHorizontal: 12,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentTheme.background,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        filterButtonContent: {
            flexDirection: "row",
            alignItems: "center",
        },

        downIcon: {
            marginLeft: 4,
        },
        filterBadge: {
            position: "absolute",
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: currentTheme.danger,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: currentTheme.background,
            paddingTop: 50,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
        },
        modalContent: {
            backgroundColor: currentTheme.background,
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 30,
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.lightBorder,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: currentTheme.text,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.lightBorder,
            marginBottom: 12,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: "500",
            color: currentTheme.text,
        },
        activitiesContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            paddingTop: 12,
            paddingBottom: 12,
        },
        activityChip: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 18,
            backgroundColor: currentTheme.lightBackground,
            marginBottom: 8,
        },
        selectedChip: {
            backgroundColor: currentTheme.primary,
        },
        activityChipText: {
            fontSize: 14,
            color: currentTheme.text,
        },
        selectedChipText: {
            color: currentTheme.text,
        },
        equipementsContainer: {
            flexDirection: "row",
            gap: 12,
            paddingTop: 12,
            paddingBottom: 12,
        },
        equipementChip: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 18,
            backgroundColor: currentTheme.lightBackground,
            marginBottom: 8,
        },
        equipementChipText: {
            fontSize: 14,
            marginLeft: 6,
            color: currentTheme.text,
        },
        modalFooter: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: currentTheme.lightBorder,
            marginTop: 16,
        },
        resetButton: {
            paddingVertical: 10,
            paddingHorizontal: 16,
        },
        resetButtonText: {
            color: currentTheme.text,
            fontSize: 16,
        },
        applyButton: {
            backgroundColor: currentTheme.primary,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
        },
        applyButtonText: {
            color: currentTheme.white,
            fontSize: 16,
            fontWeight: "600",
        },
        iconPrimary: {
            color: currentTheme.primary,
        },
        icon: {
            color: currentTheme.text,
        },
        // Ajouter ces styles
        iconFilterActive: {
            color: currentTheme.text,
        },
        iconFilterInactive: {
            color: currentTheme.primary,
        },
    });
}
