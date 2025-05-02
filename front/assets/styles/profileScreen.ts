import { StyleSheet } from "react-native";
export default StyleSheet.create({
    priceExplanation: {
        color: "#666",
        fontStyle: "italic",
        marginBottom: 15,
        fontSize: 14,
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e1e1e1",
        backgroundColor: "#f8f8f8",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    infoSection: {
        backgroundColor: "#f8f8f8",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginTop: 12,
    },
    value: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
        marginTop: 4,
    },
    placesSection: {
        backgroundColor: "#f8f8f8",
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 15,
    },
    placeItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e1e1e1",
        paddingBottom: 15,
    },
    placeName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        marginBottom: 8,
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    priceInputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        backgroundColor: "#fff",
        marginRight: 10,
        paddingRight: 8,
    },
    priceInput: {
        flex: 1,
        padding: 8,
    },
    euroSymbol: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    updateButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 4,
        minWidth: 100,
        alignItems: "center",
    },
    updateButtonText: {
        color: "#fff",
        fontWeight: "500",
    },
    noPlacesText: {
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 15,
    },
    loader: {
        marginVertical: 20,
    },
    logoutButton: {
        backgroundColor: "#ff3b30",
        margin: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
