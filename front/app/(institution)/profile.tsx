import PriceConfigurationBanner from "@/components/PriceConfigurationBanner";
import ProfileScreen from "@/components/screens/ProfileScreen";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";

export default function InstitutionProfileScreen() {
    const [user, setUser] = useState(global.user);
    const bannerRef = useRef<any>(null);

    useEffect(() => {
        // S'assurer que l'utilisateur est bien chargé
        if (global.user) {
            setUser(global.user);
        }
    }, []);

    const handlePriceUpdated = () => {
        // Rafraîchir la bannière quand un prix est mis à jour
        if (bannerRef.current?.refresh) {
            bannerRef.current.refresh();
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {user && <PriceConfigurationBanner user={user} ref={bannerRef} onPriceConfigured={handlePriceUpdated} />}
            <ProfileScreen onPriceUpdated={handlePriceUpdated} />
        </View>
    );
}
