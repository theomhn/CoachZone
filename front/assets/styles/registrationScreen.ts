import { Colors } from "@/constants/Colors";
import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    typeSelector: {
        flexDirection: "row",
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.grayLight,
        alignItems: "center",
    },
    selectedType: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    typeText: {
        color: Colors.black,
        fontSize: 16,
    },
    selectedTypeText: {
        color: Colors.white,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.grayDarkest,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: Colors.grayLight,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        justifyContent: "center",
    },
    button: {
        backgroundColor: Colors.primary,
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    linkButton: {
        marginTop: 20,
        alignItems: "center",
        marginBottom: 20,
    },
    linkText: {
        color: Colors.primary,
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginLeft: 10,
        color: Colors.grayDark,
        fontSize: 14,
    },
    placeholderText: {
        color: Colors.grayDark,
        fontSize: 16,
    },
    selectedText: {
        color: Colors.grayDarkest,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.7,
    },
    modalHeader: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grayLight,
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: Colors.grayLightest,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    closeButton: {
        marginLeft: 10,
        padding: 8,
    },
    closeButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: "600",
    },
    institutionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grayLight,
    },
    institutionName: {
        fontSize: 16,
        color: Colors.grayDarkest,
    },
    institutionId: {
        color: Colors.grayDark,
        fontSize: 14,
    },
    emptyListContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyListText: {
        fontSize: 16,
        color: Colors.grayMedium,
        textAlign: "center",
    },
});
