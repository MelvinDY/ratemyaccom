/**
 * API Route: GET /api/accommodations
 * Fetches accommodations with filtering and pagination from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { accommodationRepository } from '@/lib/database/repositories/accommodation.repository';
import { SearchFilters } from '@/types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for query parameters
const SearchParamsSchema = z.object({
  university: z.string().optional(),
  location: z.string().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  type: z.string().optional(), // Comma-separated values
  amenities: z.string().optional(), // Comma-separated amenity IDs
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(12),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const rawParams = Object.fromEntries(searchParams.entries());
    const validationResult = SearchParamsSchema.safeParse(rawParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // Build filters object
    const filters: SearchFilters & { page: number; limit: number } = {
      page: params.page,
      limit: params.limit,
    };

    if (params.university) {
      filters.university = params.university;
    }

    if (params.location) {
      filters.location = params.location;
    }

    if (params.priceMin !== undefined) {
      filters.priceMin = params.priceMin;
    }

    if (params.priceMax !== undefined) {
      filters.priceMax = params.priceMax;
    }

    if (params.rating !== undefined) {
      filters.rating = params.rating;
    }

    if (params.type) {
      filters.type = params.type.split(',') as any;
    }

    if (params.amenities) {
      filters.amenities = params.amenities.split(',');
    }

    // Fetch accommodations from database
    const result = await accommodationRepository.search(filters);

    // Transform data to match frontend expectations
    const transformedData = result.data.map((accom) => ({
      id: accom.id,
      name: accom.name,
      slug: accom.slug,
      university: accom.university,
      location: {
        address: accom.address,
        suburb: accom.suburb,
        state: accom.state,
        postcode: accom.postcode,
        coordinates:
          accom.latitude && accom.longitude
            ? { lat: accom.latitude, lng: accom.longitude }
            : undefined,
      },
      description: accom.description,
      type: mapAccommodationTypeToFrontend(accom.type),
      images: accom.images,
      amenities: accom.amenities.map((a) => ({
        id: a.amenity.id,
        name: a.amenity.name,
        icon: a.amenity.icon,
        available: a.available,
      })),
      pricing: {
        min: accom.priceMin,
        max: accom.priceMax,
        currency: accom.currency,
        period: mapPricePeriodToFrontend(accom.pricePeriod),
      },
      capacity: accom.capacity,
      roomTypes: accom.roomTypes,
      contactInfo: accom.contactInfo as any,
      ratings: {
        overall: accom.ratingOverall,
        breakdown: {
          cleanliness: accom.ratingCleanliness,
          location: accom.ratingLocation,
          value: accom.ratingValue,
          amenities: accom.ratingAmenities,
          management: accom.ratingManagement,
          safety: accom.ratingSafety,
        },
        totalReviews: accom.totalReviews,
      },
      distance: {
        toCampus: accom.distanceToCampus || 0,
        toTransport: accom.distanceToTransport || 0,
      },
      verified: accom.verified,
      featured: accom.featured,
      createdAt: accom.createdAt,
      updatedAt: accom.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching accommodations:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accommodations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accommodations
 * Create a new accommodation (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication and authorization check
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();

    // Validate and create accommodation
    const accommodation = await accommodationRepository.create(body);

    return NextResponse.json(
      {
        success: true,
        data: accommodation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating accommodation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create accommodation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to map database enum to frontend type
function mapAccommodationTypeToFrontend(
  type: string
): 'on-campus' | 'off-campus' | 'private' | 'college' {
  const mapping: Record<string, 'on-campus' | 'off-campus' | 'private' | 'college'> = {
    ON_CAMPUS: 'on-campus',
    OFF_CAMPUS: 'off-campus',
    PRIVATE: 'private',
    COLLEGE: 'college',
  };
  return mapping[type] || 'off-campus';
}

// Helper function to map database enum to frontend type
function mapPricePeriodToFrontend(period: string): 'week' | 'month' | 'semester' | 'year' {
  const mapping: Record<string, 'week' | 'month' | 'semester' | 'year'> = {
    WEEK: 'week',
    MONTH: 'month',
    SEMESTER: 'semester',
    YEAR: 'year',
  };
  return mapping[period] || 'week';
}
