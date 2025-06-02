import PriceConfigurationBanner from "@/components/PriceConfigurationBanner";
import MyBookingsScreen from "@/components/screens/MyBookingsScreen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function InstitutionMyBookingsScreen() {
    const [user, setUser] = useState(global.user);

    useEffect(() => {
        // S'assurer que l'utilisateur est bien chargé
        if (global.user) {
            setUser(global.user);
        }
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {user && <PriceConfigurationBanner user={user} />}
            <MyBookingsScreen />
        </View>
    );
}
