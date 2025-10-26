/**
 * Application-wide constants
 */

export const APP_NAME = 'RateMyAccom';
export const APP_DESCRIPTION =
  'Student accommodation reviews for NSW universities - Find the perfect place to live';

/**
 * NSW Universities
 */
export const NSW_UNIVERSITIES = [
  { code: 'UNSW', name: 'University of New South Wales', city: 'Sydney' },
  { code: 'USYD', name: 'University of Sydney', city: 'Sydney' },
  { code: 'UTS', name: 'University of Technology Sydney', city: 'Sydney' },
  { code: 'MQ', name: 'Macquarie University', city: 'Sydney' },
  { code: 'WSU', name: 'Western Sydney University', city: 'Sydney' },
  { code: 'ACU', name: 'Australian Catholic University', city: 'Sydney' },
  { code: 'ND', name: 'University of Notre Dame Australia', city: 'Sydney' },
  { code: 'UOW', name: 'University of Wollongong', city: 'Wollongong' },
  { code: 'Newcastle', name: 'University of Newcastle', city: 'Newcastle' },
  { code: 'UNE', name: 'University of New England', city: 'Armidale' },
  { code: 'CSU', name: 'Charles Sturt University', city: 'Various' },
  { code: 'SCU', name: 'Southern Cross University', city: 'Lismore' },
  { code: 'UON', name: 'University of Newcastle', city: 'Newcastle' },
] as const;

/**
 * Accommodation types
 */
export const ACCOMMODATION_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio' },
  { value: 'shared', label: 'Shared House' },
  { value: 'purpose-built', label: 'Purpose-Built Student Accommodation' },
] as const;

/**
 * Rating categories
 */
export const RATING_CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { key: 'location', label: 'Location', icon: '📍' },
  { key: 'value', label: 'Value for Money', icon: '💰' },
  { key: 'amenities', label: 'Amenities', icon: '🏠' },
  { key: 'management', label: 'Management', icon: '👥' },
  { key: 'safety', label: 'Safety & Security', icon: '🔒' },
] as const;

/**
 * Common amenities
 */
export const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'laundry', label: 'Laundry', icon: '🧺' },
  { id: 'gym', label: 'Gym', icon: '💪' },
  { id: 'pool', label: 'Pool', icon: '🏊' },
  { id: 'security', label: '24/7 Security', icon: '🔐' },
  { id: 'furnished', label: 'Furnished', icon: '🛋️' },
  { id: 'aircon', label: 'Air Conditioning', icon: '❄️' },
  { id: 'heating', label: 'Heating', icon: '🔥' },
  { id: 'dishwasher', label: 'Dishwasher', icon: '🍽️' },
  { id: 'balcony', label: 'Balcony', icon: '🌇' },
  { id: 'study', label: 'Study Room', icon: '📚' },
  { id: 'common', label: 'Common Areas', icon: '👥' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
] as const;

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Review constraints
 */
export const REVIEW_MIN_LENGTH = 50;
export const REVIEW_MAX_LENGTH = 2000;
export const REVIEW_TITLE_MIN_LENGTH = 10;
export const REVIEW_TITLE_MAX_LENGTH = 100;

/**
 * File upload
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  auth: {
    points: 5,
    duration: 60 * 15, // 15 minutes
  },
  review: {
    points: 3,
    duration: 60 * 60 * 24, // 24 hours
  },
  search: {
    points: 60,
    duration: 60, // 1 minute
  },
  api: {
    points: 100,
    duration: 60, // 1 minute
  },
} as const;

/**
 * Routes
 */
export const ROUTES = {
  home: '/',
  search: '/search',
  accommodation: (slug: string) => `/accommodation/${slug}`,
  review: (id: string) => `/review/${id}`,
  login: '/login',
  register: '/register',
  profile: '/profile',
  dashboard: '/dashboard',
  about: '/about',
  contact: '/contact',
  terms: '/terms',
  privacy: '/privacy',
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  accommodations: '/api/accommodations',
  accommodation: (id: string) => `/api/accommodations/${id}`,
  reviews: '/api/reviews',
  review: (id: string) => `/api/reviews/${id}`,
  search: '/api/search',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
  },
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  searchFilters: 'search_filters',
  recentSearches: 'recent_searches',
  preferences: 'user_preferences',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  REVIEW_SUBMITTED: 'Your review has been submitted successfully!',
  PROFILE_UPDATED: 'Your profile has been updated.',
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully. Please verify your email.',
  LOGOUT_SUCCESS: 'You have been logged out.',
} as const;
