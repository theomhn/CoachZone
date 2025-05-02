import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("window");
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
        borderColor: "#ddd",
        alignItems: "center",
    },
    selectedType: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    typeText: {
        color: "#000",
        fontSize: 16,
    },
    selectedTypeText: {
        color: "#fff",
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#007AFF",
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    linkButton: {
        marginTop: 20,
        alignItems: "center",
        marginBottom: 20,
    },
    linkText: {
        color: "#007AFF",
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginLeft: 10,
        color: "#666",
        fontSize: 14,
    },
    placeholderText: {
        color: "#666",
        fontSize: 16,
    },
    selectedText: {
        color: "#333",
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.7,
    },
    modalHeader: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    closeButton: {
        marginLeft: 10,
        padding: 8,
    },
    closeButtonText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    institutionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    institutionName: {
        fontSize: 16,
        color: "#333",
    },
    institutionId: {
        color: "#777",
        fontSize: 14,
    },
    emptyListContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyListText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
});
