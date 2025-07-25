import { API_BASE_URL } from "@/config";
import { Place } from "@/types";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

export const usePriceStatus = (user: any) => {
    const [hasConfiguredPrices, setHasConfiguredPrices] = useState<boolean | null>(null);
    const [placesWithoutPrice, setPlacesWithoutPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const checkPriceStatus = useCallback(async () => {
        if (!user || user.type !== "ROLE_INSTITUTION") {
            setHasConfiguredPrices(true); // Si ce n'est pas une institution, on considère que c'est OK
            return;
        }

        try {
            setIsLoading(true);
            const userToken = await SecureStore.getItemAsync("userToken");

            if (!userToken) {
                setHasConfiguredPrices(true);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/places?inst_numero=${user.inst_numero}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des équipements");
            }

            const places: Place[] = await response.json();
            const unconfiguredPlaces = places.filter((place) => place.price === null || place.price === undefined);

            setPlacesWithoutPrice(unconfiguredPlaces.length);
            setHasConfiguredPrices(unconfiguredPlaces.length === 0 || places.length === 0);
        } catch (error) {
            console.error("Erreur lors de la vérification des prix :", error);
            // En cas d'erreur, on laisse passer pour ne pas bloquer l'utilisateur
            setHasConfiguredPrices(true);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        checkPriceStatus();
    }, [user]);

    return {
        hasConfiguredPrices,
        placesWithoutPrice,
        isLoading,
        refreshPriceStatus: checkPriceStatus,
    };
};
