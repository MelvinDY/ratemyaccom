import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryProvider } from '@/providers/QueryProvider';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

/**
 * Custom render function with providers
 */
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>{children}</QueryProvider>
    </ErrorBoundary>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

/**
 * Mock data generators for testing
 */
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@unsw.edu.au',
  name: 'Test User',
  university: 'UNSW',
  verified: true,
  createdAt: new Date('2024-01-01'),
};

export const mockAccommodation = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Test Accommodation',
  slug: 'test-accommodation',
  university: 'UNSW',
  location: {
    address: '123 Test St',
    suburb: 'Kensington',
    postcode: '2052',
    coordinates: { lat: -33.9173, lng: 151.2313 },
  },
  amenities: [],
  pricing: { min: 300, max: 500, currency: 'AUD', period: 'week' as const },
  ratings: {
    overall: 4.5,
    count: 10,
    breakdown: {
      cleanliness: 4,
      location: 5,
      value: 4,
      amenities: 4,
      management: 5,
      safety: 5,
    },
  },
  type: 'apartment' as const,
  verified: true,
  featured: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockReview = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  accommodationId: mockAccommodation.id,
  userId: mockUser.id,
  userName: mockUser.name,
  userUniversity: mockUser.university,
  rating: 4,
  ratingBreakdown: {
    cleanliness: 4,
    location: 5,
    value: 4,
    amenities: 4,
    management: 5,
    safety: 5,
  },
  title: 'Great place to live',
  text: 'This is a wonderful accommodation with excellent facilities and friendly management.',
  verified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  helpful: 5,
  reported: 0,
};
