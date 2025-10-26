'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/client';
import type { Review, PaginatedResponse } from '@/types';
import type { ReviewSubmission } from '@/lib/validation/schemas';

/**
 * Hook to fetch reviews for an accommodation
 */
export const useReviews = (accommodationId: string, page: number = 1) => {
  return useQuery({
    queryKey: ['reviews', accommodationId, page],
    queryFn: () =>
      api.get<PaginatedResponse<Review>>(`/accommodations/${accommodationId}/reviews?page=${page}`),
    enabled: !!accommodationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a single review
 */
export const useReview = (reviewId: string) => {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => api.get<Review>(`/reviews/${reviewId}`),
    enabled: !!reviewId,
  });
};

/**
 * Hook to submit a review
 */
export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewSubmission) => api.post<Review>('/reviews', data),
    onSuccess: (data) => {
      // Invalidate accommodation reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', data.accommodationId],
      });
      // Invalidate accommodation data (to update ratings)
      queryClient.invalidateQueries({
        queryKey: ['accommodation', data.accommodationId],
      });
    },
  });
};

/**
 * Hook to update a review
 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReviewSubmission> }) =>
      api.put<Review>(`/reviews/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['review', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['reviews', data.accommodationId],
      });
    },
  });
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

/**
 * Hook to mark review as helpful
 */
export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => api.post(`/reviews/${reviewId}/helpful`),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
    },
  });
};

/**
 * Hook to report a review
 */
export const useReportReview = () => {
  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      api.post(`/reviews/${reviewId}/report`, { reason }),
  });
};
