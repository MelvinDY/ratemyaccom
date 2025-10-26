import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ApiError } from '@/lib/errors/api-errors';
import { logApiError } from '@/lib/errors/error-logger';

/**
 * API client configuration
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For CSRF token cookies
});

/**
 * Request interceptor - add auth token and CSRF token
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add CSRF token for state-changing requests
      if (['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
        const csrfToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('csrf_token='))
          ?.split('=')[1];

        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized - redirect to login
      if (status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // Create ApiError from response
      const apiError = new ApiError(
        status,
        (data as { error?: { message?: string } })?.error?.message || 'An error occurred',
        (data as { error?: { code?: string } })?.error?.code
      );

      logApiError(apiError, error.config?.url || 'unknown');
      return Promise.reject(apiError);
    }

    // Network errors
    if (error.request) {
      const networkError = new ApiError(0, 'Network error - please check your connection');
      logApiError(networkError, 'network');
      return Promise.reject(networkError);
    }

    // Other errors
    logApiError(error as Error, 'unknown');
    return Promise.reject(error);
  }
);

/**
 * Type-safe API request wrapper
 */
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Convenience methods
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

export default api;
