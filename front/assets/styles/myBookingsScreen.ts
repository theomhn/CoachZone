import { StyleSheet } from "react-native";

export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme.background,
        },
        centered: {
            justifyContent: "center",
            alignItems: "center",
        },
        toggleContainer: {
            flexDirection: "row",
            backgroundColor: currentTheme.lightBackground,
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            borderRadius: 8,
            overflow: "hidden",
            elevation: 2,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        toggleButton: {
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        toggleActive: {
            backgroundColor: currentTheme.primary,
        },
        toggleText: {
            fontSize: 14,
            fontWeight: "600",
            color: currentTheme.text,
        },
        toggleActiveText: {
            color: currentTheme.white,
        },
        listContainer: {
            paddingHorizontal: 16,
            paddingBottom: 20,
        },
        bookingCard: {
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 10,
            marginVertical: 8,
            padding: 16,
            elevation: 2,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        bookingHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
        },
        dateContainer: {
            flex: 1,
        },
        dateText: {
            fontSize: 16,
            fontWeight: "700",
            color: currentTheme.text,
            marginBottom: 4,
        },
        timeText: {
            fontSize: 14,
            color: currentTheme.secondaryText,
        },
        bookingDetails: {
            marginTop: 8,
        },
        detailRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        iconPrimary: {
            color: currentTheme.icon,
        },
        icon: {
            color: currentTheme.secondaryText,
            marginRight: 8,
        },
        detailText: {
            fontSize: 14,
            color: currentTheme.text,
            flex: 1,
        },
        emptyContainer: {
            paddingVertical: 60,
            alignItems: "center",
            justifyContent: "center",
        },
        emptyText: {
            marginTop: 16,
            fontSize: 16,
            color: currentTheme.secondaryText,
            textAlign: "center",
        },
    });
}
