/**
 * Prisma Mock Utilities
 * Mock database operations for testing
 */

import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

// Use the global mock created in jest.setup.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prismaMock = (global as any).__prismaMock as DeepMockProxy<PrismaClient>;

/**
 * Mock user data
 */
export const mockUser = {
  id: 'user-test-id-1',
  email: 'test@unsw.edu.au',
  name: 'Test User',
  password: '$2b$12$hashedpassword',
  university: 'University of New South Wales (UNSW)',
  studentId: 'z1234567',
  verified: true,
  role: 'USER' as const,
  provider: null,
  providerId: null,
  failedLoginAttempts: 0,
  lastFailedLogin: null,
  lockedUntil: null,
  lockoutCount: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Mock accommodation data
 */
export const mockAccommodation = {
  id: 'accom-test-id-1',
  name: 'Test Accommodation',
  slug: 'test-accommodation',
  university: 'UNSW',
  address: '123 Test St',
  suburb: 'Kensington',
  state: 'NSW',
  postcode: '2033',
  latitude: -33.9173,
  longitude: 151.2313,
  description: 'A great place to live',
  type: 'ON_CAMPUS' as const,
  images: [],
  priceMin: 300,
  priceMax: 500,
  currency: 'AUD',
  pricePeriod: 'WEEK' as const,
  capacity: 1,
  roomTypes: [],
  contactInfo: {},
  ratingOverall: 4.5,
  ratingCleanliness: 4.5,
  ratingLocation: 5,
  ratingValue: 4,
  ratingAmenities: 4.5,
  ratingManagement: 4,
  ratingSafety: 5,
  totalReviews: 1,
  distanceToCampus: 0.5,
  distanceToTransport: 0.2,
  verified: true,
  featured: false,
  active: true,
  sourceUrl: null,
  scrapedAt: null,
  lastVerified: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Mock review data
 */
export const mockReview = {
  id: 'review-test-id-1',
  accommodationId: mockAccommodation.id,
  userId: mockUser.id,
  rating: 4.5,
  ratingCleanliness: 4.5,
  ratingLocation: 5,
  ratingValue: 4,
  ratingAmenities: 4.5,
  ratingManagement: 4,
  ratingSafety: 5,
  title: 'Great place!',
  text: 'Really enjoyed staying here.',
  pros: ['Close to campus', 'Clean'],
  cons: ['Bit expensive'],
  verified: true,
  isAnonymous: false,
  roomType: 'Single',
  stayDuration: '1 year',
  helpful: 5,
  reported: 0,
  status: 'PUBLISHED' as const,
  moderatedBy: null,
  moderatedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
