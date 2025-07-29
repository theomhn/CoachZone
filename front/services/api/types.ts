export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface ApiError {
    message: string;
    status: number;
    data?: any;
}

export interface AuthHeaders {
    Authorization: string;
    "Content-Type": string;
}

export interface RequestConfig {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: HeadersInit;
    body?: string;
    requireAuth?: boolean;
}
