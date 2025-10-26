/**
 * Type guards for runtime type checking
 * These provide type safety when dealing with unknown data from API responses
 */

import type { User, Review, Accommodation, RatingBreakdown, PaginatedResponse } from '@/types';

/**
 * Type guard to check if a value is a valid rating (1-5)
 */
export const isValidRating = (value: unknown): value is number => {
  return typeof value === 'number' && value >= 1 && value <= 5 && Number.isInteger(value);
};

/**
 * Type guard to check if an object is a valid RatingBreakdown
 */
export const isRatingBreakdown = (obj: unknown): obj is RatingBreakdown => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const breakdown = obj as Record<string, unknown>;
  const requiredFields = ['cleanliness', 'location', 'value', 'amenities', 'management', 'safety'];

  return requiredFields.every((field) => isValidRating(breakdown[field]));
};

/**
 * Type guard to check if a value is a valid email
 */
export const isValidEmail = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value);
};

/**
 * Type guard to check if a value is a valid UUID
 */
export const isUUID = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Type guard to check if an object is a valid User
 */
export const isUser = (obj: unknown): obj is User => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const user = obj as Record<string, unknown>;

  return (
    isUUID(user.id) &&
    isValidEmail(user.email) &&
    typeof user.name === 'string' &&
    typeof user.verified === 'boolean' &&
    user.createdAt instanceof Date
  );
};

/**
 * Type guard to check if an object is a valid Review
 */
export const isReview = (obj: unknown): obj is Review => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const review = obj as Record<string, unknown>;

  return (
    isUUID(review.id) &&
    isUUID(review.accommodationId) &&
    isUUID(review.userId) &&
    typeof review.userName === 'string' &&
    isValidRating(review.rating) &&
    isRatingBreakdown(review.ratingBreakdown) &&
    typeof review.title === 'string' &&
    typeof review.text === 'string' &&
    typeof review.verified === 'boolean' &&
    review.createdAt instanceof Date &&
    review.updatedAt instanceof Date
  );
};

/**
 * Type guard to check if an object is a valid Accommodation
 */
export const isAccommodation = (obj: unknown): obj is Accommodation => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const accom = obj as Record<string, unknown>;

  return (
    isUUID(accom.id) &&
    typeof accom.name === 'string' &&
    typeof accom.slug === 'string' &&
    typeof accom.university === 'string' &&
    typeof accom.location === 'object' &&
    Array.isArray(accom.amenities) &&
    typeof accom.pricing === 'object' &&
    typeof accom.ratings === 'object' &&
    typeof accom.verified === 'boolean' &&
    accom.createdAt instanceof Date &&
    accom.updatedAt instanceof Date
  );
};

/**
 * Type guard to check if an object is a valid PaginatedResponse
 */
export const isPaginatedResponse = <T>(
  obj: unknown,
  itemGuard: (item: unknown) => item is T
): obj is PaginatedResponse<T> => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const response = obj as Record<string, unknown>;

  if (!Array.isArray(response.data)) {
    return false;
  }

  if (!response.data.every(itemGuard)) {
    return false;
  }

  const pagination = response.pagination as Record<string, unknown>;
  return (
    typeof pagination === 'object' &&
    pagination !== null &&
    typeof pagination.page === 'number' &&
    typeof pagination.limit === 'number' &&
    typeof pagination.total === 'number' &&
    typeof pagination.totalPages === 'number'
  );
};

/**
 * Type guard to check if a value is a valid date string
 */
export const isDateString = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Type guard to check if an object has required keys
 */
export const hasRequiredKeys = <T extends string>(
  obj: unknown,
  keys: readonly T[]
): obj is Record<T, unknown> => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return keys.every((key) => key in obj);
};

/**
 * Type guard to check if a value is a non-empty string
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Type guard to check if a value is a positive number
 */
export const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

/**
 * Type guard to check if a value is an array of strings
 */
export const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

/**
 * Helper function to safely parse JSON with type checking
 */
export const safeJsonParse = <T>(json: string, guard: (obj: unknown) => obj is T): T | null => {
  try {
    const parsed = JSON.parse(json);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Type assertion helper that throws if guard fails
 */
export const assertType = <T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage: string
): asserts value is T => {
  if (!guard(value)) {
    throw new TypeError(errorMessage);
  }
};
