import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    priceExplanation: {
        color: Colors.grayDark,
        fontStyle: "italic",
        marginBottom: 15,
        fontSize: 14,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grayLight,
        backgroundColor: Colors.grayLightest,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.grayDarkest,
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
        backgroundColor: Colors.grayLightest,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: Colors.grayDark,
        marginTop: 12,
    },
    value: {
        fontSize: 16,
        color: Colors.grayDarkest,
        fontWeight: "500",
        marginTop: 4,
    },
    placesSection: {
        backgroundColor: Colors.grayLightest,
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.grayDarkest,
        marginBottom: 15,
    },
    placeItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grayLight,
        paddingBottom: 15,
    },
    placeName: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.grayDarkest,
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
        borderColor: Colors.grayMedium,
        borderRadius: 4,
        backgroundColor: Colors.white,
        marginRight: 10,
        paddingRight: 8,
    },
    priceInput: {
        flex: 1,
        padding: 8,
    },
    euroSymbol: {
        fontSize: 16,
        color: Colors.grayDark,
        fontWeight: "500",
    },
    updateButton: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 4,
        minWidth: 100,
        alignItems: "center",
    },
    updateButtonText: {
        color: Colors.white,
        fontWeight: "500",
    },
    noPlacesText: {
        color: Colors.grayDark,
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 15,
    },
    loader: {
        marginVertical: 20,
    },
    logoutButton: {
        backgroundColor: Colors.danger,
        margin: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});
