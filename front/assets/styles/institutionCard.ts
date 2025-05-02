import { StyleSheet } from "react-native";
export default StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        color: "#333",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    infoIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    infoValue: {
        fontSize: 14,
        color: "#666",
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
        color: "#555",
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
        backgroundColor: "#ff3b30",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    detailsButton: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    detailsButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginRight: 4,
    },
});
