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
        priceContainer: {
            alignItems: "flex-end",
        },
        priceText: {
            fontSize: 16,
            fontWeight: "600",
            color: currentTheme.success,
        },
        actionsContainer: {
            flexDirection: "row",
            marginTop: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: currentTheme.border,
            gap: 12,
        },
        actionButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            borderWidth: 1,
        },
        modifyButton: {
            backgroundColor: currentTheme.lightBackground,
            borderColor: currentTheme.primary,
        },
        cancelButton: {
            backgroundColor: currentTheme.lightBackground,
            borderColor: currentTheme.danger,
        },
        actionIcon: {
            color: currentTheme.primary,
            marginRight: 6,
        },
        actionIconCancel: {
            color: currentTheme.danger,
            marginRight: 6,
        },
        actionText: {
            fontSize: 14,
            fontWeight: "500",
            color: currentTheme.primary,
        },
        actionTextCancel: {
            fontSize: 14,
            fontWeight: "500",
            color: currentTheme.danger,
        },

        // Styles pour les réservations annulées
        cancelledBookingCard: {
            backgroundColor: currentTheme.lightBackground,
            borderWidth: 1,
            borderColor: currentTheme.border,
            opacity: 0.7,
        },
        cancelledBadge: {
            position: "absolute",
            top: -8,
            right: -8,
            backgroundColor: currentTheme.danger,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            zIndex: 1,
            elevation: 3,
            shadowColor: currentTheme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
        },
        cancelledBadgeText: {
            color: currentTheme.white,
            fontSize: 10,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 0.5,
        },
        cancelledText: {
            color: currentTheme.secondaryText,
            textDecorationLine: "line-through",
        },
        cancelledIcon: {
            color: currentTheme.secondaryText,
            opacity: 0.6,
        },
        cancelledPriceText: {
            color: currentTheme.secondaryText,
        },
        strikethrough: {
            textDecorationLine: "line-through",
            color: currentTheme.secondaryText,
        },
        refundText: {
            color: currentTheme.success,
            fontSize: 14,
            fontWeight: "500",
        },
        cancelledDateText: {
            fontSize: 12,
            color: currentTheme.danger,
            fontStyle: "italic",
            flex: 1,
        },
    });
}
