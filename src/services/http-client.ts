import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from '@/utils/constants';

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Backend doesn't support token refresh - redirect to login on 401
        if (error.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
          return Promise.reject(error);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as any;
      // Handle wrapped error response {success: false, message: "...", data: null}
      const message = data?.message || 
                     data?.data?.message ||
                     'An error occurred while processing your request';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    } else {
      return new Error('An unexpected error occurred');
    }
  }

  private unwrapResponse<T>(response: AxiosResponse): T {
    // Backend wraps responses in {success, data, message} format
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
      return response.data.data as T;
    }
    
    return response.data as T;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config);
    return this.unwrapResponse<T>(response);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return this.unwrapResponse<T>(response);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return this.unwrapResponse<T>(response);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return this.unwrapResponse<T>(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config);
    return this.unwrapResponse<T>(response);
  }
}

export const httpClient = new HttpClient();
