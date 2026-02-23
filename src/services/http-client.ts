import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from '@/utils/constants';

// Flag to prevent multiple simultaneous redirects to login
let isRedirectingToLogin = false;

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
    // REQUEST interceptor — attach token if valid
    this.instance.interceptors.request.use(
      (config) => {
        // If we're already redirecting, abort new requests
        if (isRedirectingToLogin) {
          const controller = new AbortController();
          controller.abort();
          config.signal = controller.signal;
          return config;
        }

        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          // Quick client-side JWT expiry check (JWT = header.payload.signature)
          if (this.isTokenExpired(token)) {
            this.forceLogout();
            const controller = new AbortController();
            controller.abort();
            config.signal = controller.signal;
            return config;
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // RESPONSE interceptor — handle 401 / 403
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // If request was aborted (e.g. during logout redirect), silently reject
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
          return Promise.reject(error);
        }

        // Handle expired token / unauthorized
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.forceLogout();
          return Promise.reject(error);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Decode a JWT and check if it has expired.
   * Returns true if expired or unreadable.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false; // not a JWT, let the backend decide

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false; // no expiry claim, let the backend decide

      // exp is in seconds, Date.now() is in milliseconds
      // Add a 60-second buffer so we redirect BEFORE the actual expiry
      const expiresAt = payload.exp * 1000;
      return Date.now() >= expiresAt - 60_000;
    } catch {
      return false; // can't decode, let the backend decide
    }
  }

  /**
   * Clear auth state and redirect to login. 
   * Guarded to only run once even if many calls fail simultaneously.
   */
  private forceLogout(): void {
    if (isRedirectingToLogin) return;
    isRedirectingToLogin = true;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Small delay to let any in-flight renders settle, then redirect
    setTimeout(() => {
      window.location.href = '/login';
      // Reset flag after redirect (in case SPA doesn't do full reload)
      setTimeout(() => { isRedirectingToLogin = false; }, 2000);
    }, 100);
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
