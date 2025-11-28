/**
 * @jest-environment node
 */
/**
 * Tests for User Profile Endpoints
 * GET /api/users/[id] - Get User Profile
 * PUT /api/users/[id] - Update User Profile
 */

import { GET, PUT } from '@/app/api/users/[id]/route';
import {
  createMockRequest,
  createAuthenticatedRequest,
  createMockUser,
  parseJsonResponse,
} from '@/__tests__/utils/test-helpers';
import { prismaMock, mockUser, mockReview } from '@/__tests__/utils/prisma-mock';

describe('GET /api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get user profile successfully', async () => {
    const userId = mockUser.id;

    // Mock database calls
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      reviews: [
        {
          ...mockReview,
          accommodation: {
            id: 'accom-1',
            name: 'Test Accom',
            slug: 'test-accom',
          },
        } as any,
      ],
    } as any);

    prismaMock.review.count.mockResolvedValue(1);

    const request = createMockRequest({
      method: 'GET',
    });

    const response = await GET(request, { params: { id: userId } });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.id).toBe(userId);
    expect(data.data.user.reviewCount).toBe(1);
  });

  it('should return 404 for non-existent user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const request = createMockRequest({
      method: 'GET',
    });

    const response = await GET(request, { params: { id: 'nonexistent' } });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('User not found');
  });
});

describe('PUT /api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user profile successfully', async () => {
    const user = createMockUser({ userId: mockUser.id });
    const updateData = {
      name: 'Updated Name',
      university: 'Updated University',
    };

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.user.update.mockResolvedValue({
      ...mockUser,
      ...updateData,
    });

    const request = createAuthenticatedRequest(user, {
      method: 'PUT',
      body: updateData,
    });

    const response = await PUT(request, { params: { id: user.userId } });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.name).toBe(updateData.name);
  });

  it('should reject update without authentication', async () => {
    const request = createMockRequest({
      method: 'PUT',
      body: { name: 'Updated Name' },
    });

    const response = await PUT(request, { params: { id: mockUser.id } });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Permission denied');
  });

  it('should reject update for different user', async () => {
    const user = createMockUser({ userId: 'different-user-id' });

    const request = createAuthenticatedRequest(user, {
      method: 'PUT',
      body: { name: 'Updated Name' },
    });

    const response = await PUT(request, { params: { id: mockUser.id } });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Permission denied');
  });

  it('should reject update with no fields', async () => {
    const user = createMockUser({ userId: mockUser.id });

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const request = createAuthenticatedRequest(user, {
      method: 'PUT',
      body: {},
    });

    const response = await PUT(request, { params: { id: user.userId } });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('No fields to update');
  });
});
