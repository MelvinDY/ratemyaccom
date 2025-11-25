/**
 * Test Utilities and Helpers
 * Common utilities for API testing
 */

import { NextRequest } from 'next/server';
import { JWTPayload, generateAccessToken } from '@/lib/auth/jwt';

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    headers = {},
    cookies = {},
  } = options;

  const initHeaders = new Headers(headers);
  if (body) {
    initHeaders.set('Content-Type', 'application/json');
  }

  const init: any = {
    method,
    headers: initHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const request = new NextRequest(url, init);

  // Add cookies
  Object.entries(cookies).forEach(([key, value]) => {
    request.cookies.set(key, value);
  });

  return request;
}

/**
 * Create an authenticated request with JWT token
 */
export function createAuthenticatedRequest(
  user: JWTPayload,
  options: Omit<Parameters<typeof createMockRequest>[0], 'headers' | 'cookies'> = {}
): NextRequest {
  const token = generateAccessToken(user);

  return createMockRequest({
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cookies: {
      'auth-token': token,
    },
  });
}

/**
 * Create a mock user payload
 */
export function createMockUser(overrides?: Partial<JWTPayload>): JWTPayload {
  return {
    userId: 'test-user-id',
    email: 'test@unsw.edu.au',
    role: 'USER',
    verified: true,
    ...overrides,
  };
}

/**
 * Create a mock admin user payload
 */
export function createMockAdmin(overrides?: Partial<JWTPayload>): JWTPayload {
  return createMockUser({
    role: 'ADMIN',
    ...overrides,
  });
}

/**
 * Parse JSON response
 */
export async function parseJsonResponse(response: Response) {
  return await response.json();
}

/**
 * Assert response status
 */
export function assertResponseStatus(
  response: Response,
  expectedStatus: number
) {
  expect(response.status).toBe(expectedStatus);
}

/**
 * Assert response has JSON content type
 */
export function assertJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  expect(contentType).toContain('application/json');
}

/**
 * Common test data
 */
export const testData = {
  user: {
    email: 'test@unsw.edu.au',
    password: 'TestPass123',
    name: 'Test User',
    university: 'University of New South Wales (UNSW)',
  },
  accommodation: {
    name: 'Test Accommodation',
    university: 'UNSW',
    address: '123 Test St',
    suburb: 'Kensington',
    state: 'NSW',
    postcode: '2033',
    description: 'A great place to live',
    type: 'on-campus',
    priceMin: 300,
    priceMax: 500,
  },
  review: {
    rating: 4.5,
    ratingBreakdown: {
      cleanliness: 4.5,
      location: 5,
      value: 4,
      amenities: 4.5,
      management: 4,
      safety: 5,
    },
    title: 'Great place!',
    text: 'Really enjoyed staying here.',
    pros: ['Close to campus', 'Clean'],
    cons: ['Bit expensive'],
  },
};
