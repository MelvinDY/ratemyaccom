/**
 * @jest-environment node
 */
/**
 * Tests for POST /api/auth/verify
 * Email Verification Endpoint
 */

import { POST } from '@/app/api/auth/verify/route';
import { createMockRequest, parseJsonResponse } from '@/__tests__/utils/test-helpers';
import { prismaMock, mockUser } from '@/__tests__/utils/prisma-mock';
import { generateVerificationToken } from '@/lib/auth/jwt';

describe('POST /api/auth/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should verify email successfully with valid token', async () => {
    const email = 'test@unsw.edu.au';
    const token = generateVerificationToken(email);

    // Mock database calls
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      email,
      verified: false,
    });

    prismaMock.user.update.mockResolvedValue({
      ...mockUser,
      email,
      verified: true,
    });

    const request = createMockRequest({
      method: 'POST',
      body: { token },
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Email verified successfully');
    expect(data.data.user.verified).toBe(true);
  });

  it('should handle already verified email', async () => {
    const email = 'test@unsw.edu.au';
    const token = generateVerificationToken(email);

    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      email,
      verified: true, // Already verified
    });

    const request = createMockRequest({
      method: 'POST',
      body: { token },
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('already verified');
  });

  it('should reject invalid token', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { token: 'invalid-token' },
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid or expired token');
  });

  it('should reject missing token', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {},
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing token');
  });

  it('should return 404 for non-existent user', async () => {
    const email = 'nonexistent@unsw.edu.au';
    const token = generateVerificationToken(email);

    prismaMock.user.findUnique.mockResolvedValue(null);

    const request = createMockRequest({
      method: 'POST',
      body: { token },
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('User not found');
  });
});
