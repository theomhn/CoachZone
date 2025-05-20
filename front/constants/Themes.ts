import { Colors } from "./Colors";

const defaultColors = {
    primary: Colors.primary,
    danger: Colors.danger,
    success: Colors.success,
    greenLight: Colors.greenLight,
    white: Colors.white,
    black: Colors.black,
    border: Colors.primary,
    lightBorder: Colors.grayLight,
    placeholder: Colors.grayMedium,
    icon: Colors.primary,
    tabIconDefault: Colors.primary,
};

export default {
    light: {
        ...defaultColors,
        text: Colors.black,
        secondaryText: Colors.grayDark,
        background: Colors.white,
        textButton: Colors.black,
        backgroundButton: Colors.grayLight,
        shadow: Colors.black,
        tint: Colors.black,
        tabIconSelected: Colors.tintColorLight,
        lightBackground: Colors.grayLightest,
        cardBackground: Colors.white,
    },
    dark: {
        ...defaultColors,
        text: Colors.white,
        secondaryText: Colors.grayMedium,
        background: Colors.black,
        textButton: Colors.white,
        backgroundButton: Colors.grayDark,
        shadow: Colors.white,
        tint: Colors.tintColorDark,
        tabIconSelected: Colors.tintColorDark,
        lightBackground: Colors.grayDarkest,
        cardBackground: Colors.black,
    },
};
