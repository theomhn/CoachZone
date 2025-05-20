import { StyleSheet } from "react-native";
export default function (currentTheme: any) {
    return StyleSheet.create({
        container: {
            backgroundColor: currentTheme.lightBackground,
            borderRadius: 12,
            /* shadowColor: currentTheme.shadow,
            shadowOffset: {
                width: 2,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4, */
            /* elevation: 3, */
        },
        cardContainer: {
            marginBottom: 12,
        },
        popupContainer: {
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            borderRadius: 15,
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        content: {
            padding: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 12,
            color: currentTheme.text,
        },
        infoRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 8,
        },
        icon: {
            color: currentTheme.white,
        },
        infoIcon: {
            marginRight: 8,
            marginTop: 2,
        },
        infoValue: {
            fontSize: 14,
            color: currentTheme.text,
            flex: 1,
        },
        activitiesText: {
            fontStyle: "italic",
        },
        facilitiesContainer: {
            marginTop: 4,
            marginBottom: 4,
        },
        facilitiesTitle: {
            fontSize: 14,
            marginTop: 3,
            color: currentTheme.text,
        },
        badgeContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 0,
            marginLeft: 26,
        },
        closeButton: {
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: currentTheme.danger,
            borderRadius: 15,
            width: 30,
            height: 30,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
        },
        detailsButton: {
            backgroundColor: currentTheme.primary,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        detailsButtonText: {
            color: currentTheme.white,
            fontSize: 14,
            fontWeight: "600",
            marginRight: 4,
        },
    });
}
