declare global {
    var user: {
        email: string;
        id: number;
        type: "coach" | "institution";
        firstName?: string;
        lastName?: string;
        work?: string;
        name?: string;
    } | null;
}

global.user = null;

export {};
