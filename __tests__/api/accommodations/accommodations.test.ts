/**
 * Tests for Accommodation Endpoints
 * GET /api/accommodations - List Accommodations
 * POST /api/accommodations - Create Accommodation
 * PUT /api/accommodations/[id] - Update Accommodation
 * DELETE /api/accommodations/[id] - Delete Accommodation
 */

import {
  GET as ListAccommodations,
  POST as CreateAccommodation,
} from '@/app/api/accommodations/route';
import {
  PUT as UpdateAccommodation,
  DELETE as DeleteAccommodation,
} from '@/app/api/accommodations/[id]/route';
import {
  createMockRequest,
  createAuthenticatedRequest,
  createMockAdmin,
  createMockUser,
  testData,
  parseJsonResponse,
} from '@/__tests__/utils/test-helpers';
import { prismaMock, mockAccommodation } from '@/__tests__/utils/prisma-mock';

describe('GET /api/accommodations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list accommodations with pagination', async () => {
    prismaMock.accommodation.count.mockResolvedValue(1);
    prismaMock.accommodation.findMany.mockResolvedValue([
      {
        ...mockAccommodation,
        amenities: [],
      } as any,
    ]);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/accommodations?page=1&limit=10',
    });

    const response = await ListAccommodations(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.length).toBe(1);
    expect(data.pagination.page).toBe(1);
  });

  it('should filter accommodations by university', async () => {
    prismaMock.accommodation.count.mockResolvedValue(1);
    prismaMock.accommodation.findMany.mockResolvedValue([
      {
        ...mockAccommodation,
        amenities: [],
      } as any,
    ]);

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/accommodations?university=UNSW',
    });

    const response = await ListAccommodations(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('POST /api/accommodations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create accommodation as admin', async () => {
    const admin = createMockAdmin();

    prismaMock.accommodation.findUnique.mockResolvedValue(null);
    prismaMock.accommodation.create.mockResolvedValue(mockAccommodation as any);

    const request = createAuthenticatedRequest(admin, {
      method: 'POST',
      body: testData.accommodation,
    });

    const response = await CreateAccommodation(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe(testData.accommodation.name);
  });

  it('should reject creation by non-admin', async () => {
    const user = createMockUser();

    const request = createAuthenticatedRequest(user, {
      method: 'POST',
      body: testData.accommodation,
    });

    const response = await CreateAccommodation(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('should reject creation without authentication', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: testData.accommodation,
    });

    const response = await CreateAccommodation(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });
});

describe('PUT /api/accommodations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update accommodation as admin', async () => {
    const admin = createMockAdmin();

    prismaMock.accommodation.findUnique.mockResolvedValue(mockAccommodation as any);
    prismaMock.accommodation.update.mockResolvedValue({
      ...mockAccommodation,
      name: 'Updated Name',
    } as any);

    const request = createAuthenticatedRequest(admin, {
      method: 'PUT',
      body: { name: 'Updated Name' },
    });

    const response = await UpdateAccommodation(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject update by non-admin', async () => {
    const user = createMockUser();

    const request = createAuthenticatedRequest(user, {
      method: 'PUT',
      body: { name: 'Updated Name' },
    });

    const response = await UpdateAccommodation(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});

describe('DELETE /api/accommodations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete accommodation as admin', async () => {
    const admin = createMockAdmin();

    prismaMock.accommodation.findUnique.mockResolvedValue(mockAccommodation as any);
    prismaMock.accommodation.delete.mockResolvedValue(mockAccommodation as any);

    const request = createAuthenticatedRequest(admin, {
      method: 'DELETE',
    });

    const response = await DeleteAccommodation(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject deletion by non-admin', async () => {
    const moderator = createMockUser({ role: 'MODERATOR' });

    const request = createAuthenticatedRequest(moderator, {
      method: 'DELETE',
    });

    const response = await DeleteAccommodation(request, {
      params: { id: mockAccommodation.id },
    });
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});
