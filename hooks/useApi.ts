'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/errors/api-errors';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Custom hook for API requests with loading and error states
 */
export const useApi = <T>(apiFunction: () => Promise<T>, options: UseApiOptions = {}) => {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiFunction();
      setState({ data, loading: false, error: null });

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(500, 'Unknown error');
      setState({ data: null, loading: false, error: apiError });

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
