import { Colors } from "@/constants/Colors";
import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    searchFilterContainer: {
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 1,
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
    locationButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: Colors.white,
        borderRadius: 30,
        padding: 10,
        elevation: 5,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
