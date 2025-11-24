/**
 * Tests for POST /api/auth/register
 * User Registration Endpoint
 */

import { POST } from '@/app/api/auth/register/route';
import { createMockRequest, testData, parseJsonResponse } from '@/__tests__/utils/test-helpers';
import { prismaMock, mockUser } from '@/__tests__/utils/prisma-mock';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const requestBody = testData.user;

    // Mock database calls
    prismaMock.user.findUnique.mockResolvedValue(null); // No existing user
    prismaMock.user.create.mockResolvedValue({
      ...mockUser,
      email: requestBody.email,
      name: requestBody.name,
      verified: false,
    });

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Registration successful');
    expect(data.data.user.email).toBe(requestBody.email);
    expect(data.data.user.verified).toBe(false);
  });

  it('should reject registration with non-university email', async () => {
    const requestBody = {
      ...testData.user,
      email: 'test@gmail.com',
    };

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email');
  });

  it('should reject registration with weak password', async () => {
    const requestBody = {
      ...testData.user,
      password: '123', // Too short
    };

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Weak password');
  });

  it('should reject registration with existing email', async () => {
    const requestBody = testData.user;

    // Mock existing user
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email already registered');
  });

  it('should reject registration with missing fields', async () => {
    const requestBody = {
      email: 'test@unsw.edu.au',
      // Missing password and name
    };

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing required fields');
  });
});
