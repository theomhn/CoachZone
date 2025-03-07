import { User } from "./types";

declare global {
    var user: User | null;
}

global.user = null;

export {};
