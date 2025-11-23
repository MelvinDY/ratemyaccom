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
 * Request interceptor - add CSRF token
 * Note: Auth token is sent automatically via httpOnly cookies
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Add CSRF token for state-changing requests
    if (typeof window !== 'undefined') {
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

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor - handle errors globally with automatic token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized - try to refresh token
      if (status === 401 && !originalRequest._retry) {
        // Don't retry auth endpoints to prevent loops
        if (originalRequest.url?.includes('/auth/')) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Queue this request to retry after refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the token
          await apiClient.post('/auth/refresh');
          isRefreshing = false;
          processQueue(null);
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError as Error);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
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
