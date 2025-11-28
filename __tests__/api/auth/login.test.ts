/**
 * @jest-environment node
 */
/**
 * Tests for POST /api/auth/login
 * User Login Endpoint
 */

import { POST } from '@/app/api/auth/login/route';
import { createMockRequest, testData, parseJsonResponse } from '@/__tests__/utils/test-helpers';
import { prismaMock, mockUser } from '@/__tests__/utils/prisma-mock';
import { hashPassword } from '@/lib/auth/password';

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const requestBody = {
      email: testData.user.email,
      password: testData.user.password,
    };

    // Hash the password for comparison
    const hashedPassword = await hashPassword(testData.user.password);

    // Mock database call
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      email: requestBody.email,
      password: hashedPassword,
      verified: true,
    });

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Login successful');
    expect(data.data.accessToken).toBeDefined();
    expect(data.data.user.email).toBe(requestBody.email);

    // Check cookies are set
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('auth-token');
  });

  it('should reject login with invalid email', async () => {
    const requestBody = {
      email: 'nonexistent@unsw.edu.au',
      password: testData.user.password,
    };

    // Mock no user found
    prismaMock.user.findUnique.mockResolvedValue(null);

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should reject login with invalid password', async () => {
    const requestBody = {
      email: testData.user.email,
      password: 'WrongPassword123',
    };

    const hashedPassword = await hashPassword(testData.user.password);

    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      email: requestBody.email,
      password: hashedPassword,
    });

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should reject login for unverified account', async () => {
    const requestBody = {
      email: testData.user.email,
      password: testData.user.password,
    };

    const hashedPassword = await hashPassword(testData.user.password);

    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      email: requestBody.email,
      password: hashedPassword,
      verified: false, // Unverified
    });

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Account not verified');
  });

  it('should reject login with missing credentials', async () => {
    const requestBody = {
      email: testData.user.email,
      // Missing password
    };

    const request = createMockRequest({
      method: 'POST',
      body: requestBody,
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing credentials');
  });
});
