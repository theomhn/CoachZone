import { PlaceService } from "@/services";
import { useCallback, useEffect, useState } from "react";

export const usePriceStatus = (user: any) => {
    const [hasConfiguredPrices, setHasConfiguredPrices] = useState<boolean | null>(null);
    const [placesWithoutPrice, setPlacesWithoutPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const checkPriceStatus = useCallback(async () => {
        if (!user || user.type !== "ROLE_INSTITUTION") {
            setHasConfiguredPrices(true);
            return;
        }

        try {
            setIsLoading(true);
            const result = await PlaceService.checkPriceStatus(user.inst_numero);
            
            setPlacesWithoutPrice(result.placesWithoutPrice);
            setHasConfiguredPrices(result.hasConfiguredPrices);
        } catch (error) {
            // Si erreur 401, l'utilisateur n'est plus authentifié - pas d'alerte
            if (error instanceof Error && error.message.includes("401")) {
                setHasConfiguredPrices(true);
                return;
            }
            
            console.warn("Vérification des prix échouée:", error instanceof Error ? error.message : error);
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
