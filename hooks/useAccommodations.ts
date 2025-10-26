'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/client';
import type { Accommodation, SearchFilters, PaginatedResponse } from '@/types';

/**
 * Hook to fetch accommodations with search filters
 */
export const useAccommodations = (filters?: SearchFilters, page: number = 1) => {
  return useQuery({
    queryKey: ['accommodations', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters as Record<string, string>),
      });
      return api.get<PaginatedResponse<Accommodation>>(`/accommodations?${params}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single accommodation by ID
 */
export const useAccommodation = (id: string) => {
  return useQuery({
    queryKey: ['accommodation', id],
    queryFn: () => api.get<Accommodation>(`/accommodations/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch featured accommodations
 */
export const useFeaturedAccommodations = () => {
  return useQuery({
    queryKey: ['accommodations', 'featured'],
    queryFn: () => api.get<Accommodation[]>('/accommodations/featured'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to create an accommodation (admin only)
 */
export const useCreateAccommodation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Accommodation>) => api.post<Accommodation>('/accommodations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] });
    },
  });
};
