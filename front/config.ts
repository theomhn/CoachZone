// Configuration globale de l'application

import { Platform } from "react-native";

const LOCAL_API = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://127.0.0.1:8000/api";

const PROD_API = "https://coachzone.theomenchon.fr/api";

export const API_BASE_URL = LOCAL_API;
