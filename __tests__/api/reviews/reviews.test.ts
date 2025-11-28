/**
 * @jest-environment node
 */
/**
 * Tests for Review Endpoints
 * POST /api/accommodations/[id]/reviews - Create Review
 * PUT /api/reviews/[id] - Update Review
 * DELETE /api/reviews/[id] - Delete Review
 */

import { POST as CreateReview } from '@/app/api/accommodations/[id]/reviews/route';
import { PUT as UpdateReview, DELETE as DeleteReview } from '@/app/api/reviews/[id]/route';
import {
  createMockRequest,
  createAuthenticatedRequest,
  createMockUser,
  testData,
  parseJsonResponse,
} from '@/__tests__/utils/test-helpers';
import { prismaMock, mockUser, mockAccommodation, mockReview } from '@/__tests__/utils/prisma-mock';

describe('POST /api/accommodations/[id]/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create review successfully', async () => {
    const user = createMockUser({ userId: mockUser.id });

    // Mock user lookup for authentication middleware - must be first
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.accommodation.findUnique.mockResolvedValue(mockAccommodation as any);
    prismaMock.review.findFirst.mockResolvedValue(null); // No existing review
    prismaMock.review.create.mockResolvedValue({
      ...mockReview,
      user: mockUser,
    } as any);
    prismaMock.review.findMany.mockResolvedValue([mockReview]);
    prismaMock.accommodation.update.mockResolvedValue(mockAccommodation as any);

    const request = createAuthenticatedRequest(user, {
      method: 'POST',
      body: testData.review,
    });

    const response = await CreateReview(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.review.title).toBe(testData.review.title);
  });

  it('should reject review creation without authentication', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: testData.review,
    });

    const response = await CreateReview(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('should reject duplicate review', async () => {
    const user = createMockUser({ userId: mockUser.id });

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.accommodation.findUnique.mockResolvedValue(mockAccommodation as any);
    prismaMock.review.findFirst.mockResolvedValue(mockReview); // Existing review

    const request = createAuthenticatedRequest(user, {
      method: 'POST',
      body: testData.review,
    });

    const response = await CreateReview(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Review already exists');
  });

  it('should reject review with invalid rating', async () => {
    const user = createMockUser({ userId: mockUser.id });

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.accommodation.findUnique.mockResolvedValue(mockAccommodation as any);

    const request = createAuthenticatedRequest(user, {
      method: 'POST',
      body: {
        ...testData.review,
        rating: 6, // Invalid rating > 5
      },
    });

    const response = await CreateReview(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid rating');
  });
});

describe('PUT /api/reviews/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update review successfully', async () => {
    const user = createMockUser({ userId: mockUser.id });

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.review.findUnique.mockResolvedValue(mockReview);
    prismaMock.review.update.mockResolvedValue({
      ...mockReview,
      title: 'Updated Title',
      user: mockUser,
    } as any);
    prismaMock.review.findMany.mockResolvedValue([mockReview]);
    prismaMock.accommodation.update.mockResolvedValue(mockAccommodation as any);

    const request = createAuthenticatedRequest(user, {
      method: 'PUT',
      body: {
        title: 'Updated Title',
      },
    });

    const response = await UpdateReview(request, {
      params: { id: mockReview.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject update by non-author', async () => {
    const differentUser = createMockUser({ userId: 'different-user-id' });

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      id: 'different-user-id',
    } as any);
    prismaMock.review.findUnique.mockResolvedValue(mockReview);

    const request = createAuthenticatedRequest(differentUser, {
      method: 'PUT',
      body: { title: 'Updated Title' },
    });

    const response = await UpdateReview(request, {
      params: { id: mockReview.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});

describe('DELETE /api/reviews/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete review successfully', async () => {
    const user = createMockUser({ userId: mockUser.id });

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.review.findUnique.mockResolvedValue(mockReview);
    prismaMock.review.delete.mockResolvedValue(mockReview);
    prismaMock.review.findMany.mockResolvedValue([]);
    prismaMock.accommodation.update.mockResolvedValue(mockAccommodation as any);

    const request = createAuthenticatedRequest(user, {
      method: 'DELETE',
    });

    const response = await DeleteReview(request, {
      params: { id: mockReview.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should allow admin to delete any review', async () => {
    const admin = createMockUser({ userId: 'admin-id', role: 'ADMIN' });

    // Mock user lookup for authentication middleware
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      id: 'admin-id',
      role: 'ADMIN',
    } as any);
    prismaMock.review.findUnique.mockResolvedValue(mockReview);
    prismaMock.review.delete.mockResolvedValue(mockReview);
    prismaMock.review.findMany.mockResolvedValue([]);
    prismaMock.accommodation.update.mockResolvedValue(mockAccommodation as any);

    const request = createAuthenticatedRequest(admin, {
      method: 'DELETE',
    });

    const response = await DeleteReview(request, {
      params: { id: mockReview.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
