/**
 * Formate une date au format français (sans conversion de fuseau horaire)
 */
export const formatDate = (dateString: string) => {
    // Parser manuellement la date ISO pour éviter la conversion de fuseau horaire
    // Format: YYYY-MM-DDTHH:MM:SS
    const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (isoMatch) {
        const [, year, month, day, hour, minute, second] = isoMatch;
        return `${day}/${month}/${year} à ${hour}:${minute}`;
    }

    // Fallback vers l'ancienne méthode si le format n'est pas reconnu
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
