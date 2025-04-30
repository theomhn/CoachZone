import { FilterOptions, Institution } from "@/types";
import React, { createContext, PropsWithChildren, useContext } from "react";
import { useInstitutionFilters } from "./useInstitutionFilters";

// Type pour le contexte
type InstitutionFiltersContextType = {
    institutions: Institution[];
    filteredInstitutions: Institution[];
    searchText: string;
    filters: FilterOptions;
    allActivities: string[];
    updateInstitutions: (newInstitutions: Institution[]) => void;
    handleSearch: (text: string) => void;
    handleFilterChange: (newFilters: FilterOptions) => void;
    resetAllFilters: () => void;
};

// Création du contexte
const InstitutionFiltersContext = createContext<InstitutionFiltersContextType | undefined>(undefined);

// Provider du contexte
export const InstitutionFiltersProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const filtersState = useInstitutionFilters();

    return <InstitutionFiltersContext.Provider value={filtersState}>{children}</InstitutionFiltersContext.Provider>;
};

// Hook pour utiliser le contexte
export const useInstitutionFiltersContext = () => {
    const context = useContext(InstitutionFiltersContext);

    if (context === undefined) {
        throw new Error("useInstitutionFiltersContext doit être utilisé à l'intérieur d'un InstitutionFiltersProvider");
    }

    return context;
};
