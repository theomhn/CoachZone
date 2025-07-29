import { BaseApiService } from "./BaseApiService";

export class ApiClient extends BaseApiService {
    static async get<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
        return super.get<T>(endpoint, requireAuth);
    }

    static async post<T = any>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
        return super.post<T>(endpoint, data, requireAuth);
    }

    static async put<T = any>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
        return super.put<T>(endpoint, data, requireAuth);
    }

    static async patch<T = any>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
        return super.patch<T>(endpoint, data, requireAuth);
    }

    static async delete<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
        return super.delete<T>(endpoint, requireAuth);
    }
}
