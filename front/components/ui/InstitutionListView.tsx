import FavoriteButton from "@/components/FavoriteButton";
import InstitutionCard from "@/components/InstitutionCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingView from "@/components/ui/LoadingView";
import { useTheme } from "@/hooks/useTheme";
import { Institution } from "@/types";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

interface InstitutionListViewProps {
    institutions: Institution[];
    isLoading?: boolean;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    onFavoriteChange?: (instNumero: string, isFavorite: boolean) => void;
    sourceScreen?: "list" | "favorites";
    emptyStateConfig?: {
        icon?: any;
        title: string;
        subtitle?: string;
        actionText?: string;
        onActionPress?: () => void;
    };
    favoritesRefreshKey?: number;
}

const InstitutionListView: React.FC<InstitutionListViewProps> = ({
    institutions,
    isLoading = false,
    isRefreshing = false,
    onRefresh,
    onFavoriteChange,
    sourceScreen = "list",
    emptyStateConfig,
    favoritesRefreshKey = 0,
}) => {
    const { currentTheme } = useTheme();
    const styles = getStyles(currentTheme);

    const navigateToInstitutionDetails = (institutionId: string) => {
        router.push({
            pathname: "/institution-details" as any,
            params: {
                id: institutionId,
                source: sourceScreen,
            },
        });
    };

    const handleFavoriteChange = (instNumero: string, isFavorite: boolean) => {
        if (onFavoriteChange) {
            onFavoriteChange(instNumero, isFavorite);
        }
    };

    const renderInstitutionItem = ({ item }: { item: Institution }) => (
        <View style={styles.cardContainer}>
            <InstitutionCard
                item={item}
                variant="card"
                showActivities={true}
                showDetailsButton={true}
                onViewDetails={() => navigateToInstitutionDetails(item.inst_numero)}
            />
            <View style={styles.favoriteButtonOverlay}>
                <FavoriteButton
                    key={`${item.inst_numero}-${favoritesRefreshKey}`}
                    instNumero={item.inst_numero}
                    size={22}
                    onFavoriteChange={(isFavorite) => handleFavoriteChange(item.inst_numero, isFavorite)}
                    style={styles.favoriteButton}
                />
            </View>
        </View>
    );

    if (isLoading && !isRefreshing) {
        return <LoadingView />;
    }

    const defaultEmptyConfig = {
        icon: "business-outline",
        title: "Aucune institution disponible",
        subtitle: "Il n'y a actuellement aucune institution à afficher.",
        actionText: undefined,
        onActionPress: undefined,
    };

    const finalEmptyConfig = emptyStateConfig || defaultEmptyConfig;

    return (
        <View style={styles.container}>
            <FlatList
                data={institutions}
                renderItem={renderInstitutionItem}
                keyExtractor={(item) => item.inst_numero}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> : undefined
                }
                ListEmptyComponent={
                    <EmptyState
                        icon={finalEmptyConfig.icon}
                        title={finalEmptyConfig.title}
                        subtitle={finalEmptyConfig.subtitle}
                        actionText={finalEmptyConfig.actionText}
                        onActionPress={finalEmptyConfig.onActionPress}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const getStyles = (currentTheme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: currentTheme.background,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    cardContainer: {
        marginBottom: 12,
    },
    favoriteButtonOverlay: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
        backgroundColor: currentTheme.background,
        borderRadius: 20,
        shadowColor: currentTheme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    favoriteButton: {
        backgroundColor: "transparent",
        padding: 6,
    },
});

export default InstitutionListView;
