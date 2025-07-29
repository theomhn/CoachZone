import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from "react-native";

interface FormInputProps extends TextInputProps {
    label: string;
    containerStyle?: ViewStyle;
    error?: string;
    required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    containerStyle,
    error,
    required = false,
    style,
    secureTextEntry,
    ...textInputProps
}) => {
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    // État local pour gérer l'affichage du mot de passe
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Détermine si c'est un champ password
    const isPasswordField = secureTextEntry === true;

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, error && styles.inputError, isPasswordField && styles.inputWithIcon, style]}
                    placeholderTextColor={currentTheme.placeholder}
                    secureTextEntry={isPasswordField ? !isPasswordVisible : false}
                    {...textInputProps}
                />
                {isPasswordField && (
                    <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility} activeOpacity={0.7}>
                        <Ionicons
                            name={isPasswordVisible ? "eye-off" : "eye"}
                            size={20}
                            color={currentTheme.placeholder}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const getStyles = (currentTheme: any) =>
    StyleSheet.create({
        container: {
            marginBottom: 16,
        },
        label: {
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
            color: currentTheme.text,
        },
        required: {
            color: currentTheme.danger,
        },
        inputContainer: {
            position: "relative",
        },
        input: {
            backgroundColor: currentTheme.inputBackground,
            borderWidth: 1,
            borderColor: currentTheme.border,
            borderRadius: 8,
            paddingHorizontal: 15,
            paddingVertical: 12,
            fontSize: 16,
            color: currentTheme.text,
            height: 50,
        },
        inputWithIcon: {
            paddingRight: 50,
        },
        inputError: {
            borderColor: currentTheme.danger,
        },
        eyeIcon: {
            position: "absolute",
            right: 15,
            top: 15,
            justifyContent: "center",
            alignItems: "center",
            width: 20,
            height: 20,
        },
        errorText: {
            color: currentTheme.danger,
            fontSize: 14,
            marginTop: 4,
        },
    });

export default FormInput;
