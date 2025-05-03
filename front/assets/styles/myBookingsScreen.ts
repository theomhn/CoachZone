import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.grayLightest,
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    toggleContainer: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 8,
        overflow: "hidden",
        elevation: 2,
        shadowColor: Colors.black,
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
        backgroundColor: Colors.primary,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.grayDarkest,
    },
    toggleActiveText: {
        color: Colors.white,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    bookingCard: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        marginVertical: 8,
        padding: 16,
        elevation: 2,
        shadowColor: Colors.black,
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
        color: Colors.grayDarkest,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        color: Colors.grayDark,
    },
    priceContainer: {
        backgroundColor: Colors.blueLighter,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        justifyContent: "center",
    },
    priceText: {
        color: Colors.primary,
        fontWeight: "600",
        fontSize: 16,
    },
    bookingDetails: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    icon: {
        marginRight: 8,
    },
    detailText: {
        fontSize: 14,
        color: Colors.grayDarkest,
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
        color: Colors.grayDark,
        textAlign: "center",
    },
});
