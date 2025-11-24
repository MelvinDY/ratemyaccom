/**
 * API Route: GET /api/accommodations/[id]
 * Fetches a single accommodation by ID or slug from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { accommodationRepository } from '@/lib/database/repositories/accommodation.repository';
import { reviewRepository } from '@/lib/database/repositories/review.repository';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Fetch accommodation from database
    const accommodation = await accommodationRepository.findByIdOrSlug(id);

    if (!accommodation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accommodation not found',
        },
        { status: 404 }
      );
    }

    // Transform data to match frontend expectations
    const transformedData = {
      id: accommodation.id,
      name: accommodation.name,
      slug: accommodation.slug,
      university: accommodation.university,
      location: {
        address: accommodation.address,
        suburb: accommodation.suburb,
        state: accommodation.state,
        postcode: accommodation.postcode,
        coordinates: accommodation.latitude && accommodation.longitude
          ? { lat: accommodation.latitude, lng: accommodation.longitude }
          : undefined,
      },
      description: accommodation.description,
      type: mapAccommodationTypeToFrontend(accommodation.type),
      images: accommodation.images,
      amenities: accommodation.amenities.map(a => ({
        id: a.amenity.id,
        name: a.amenity.name,
        icon: a.amenity.icon,
        available: a.available,
      })),
      pricing: {
        min: accommodation.priceMin,
        max: accommodation.priceMax,
        currency: accommodation.currency,
        period: mapPricePeriodToFrontend(accommodation.pricePeriod),
      },
      capacity: accommodation.capacity,
      roomTypes: accommodation.roomTypes,
      contactInfo: accommodation.contactInfo as any,
      ratings: {
        overall: accommodation.ratingOverall,
        breakdown: {
          cleanliness: accommodation.ratingCleanliness,
          location: accommodation.ratingLocation,
          value: accommodation.ratingValue,
          amenities: accommodation.ratingAmenities,
          management: accommodation.ratingManagement,
          safety: accommodation.ratingSafety,
        },
        totalReviews: accommodation.totalReviews,
      },
      distance: {
        toCampus: accommodation.distanceToCampus || 0,
        toTransport: accommodation.distanceToTransport || 0,
      },
      verified: accommodation.verified,
      featured: accommodation.featured,
      createdAt: accommodation.createdAt,
      updatedAt: accommodation.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('Error fetching accommodation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accommodation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accommodations/[id]
 * Update an accommodation (admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication and authorization check
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = params;
    const body = await request.json();

    // Check if accommodation exists
    const existing = await accommodationRepository.findByIdOrSlug(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accommodation not found',
        },
        { status: 404 }
      );
    }

    // Update accommodation
    const accommodation = await accommodationRepository.update(existing.id, body);

    return NextResponse.json({
      success: true,
      data: accommodation,
    });
  } catch (error) {
    console.error('Error updating accommodation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update accommodation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accommodations/[id]
 * Delete an accommodation (admin only)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication and authorization check
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = params;

    // Soft delete by setting active = false
    const accommodation = await accommodationRepository.update(id, {
      active: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Accommodation deleted successfully',
      data: accommodation,
    });
  } catch (error) {
    console.error('Error deleting accommodation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete accommodation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function mapAccommodationTypeToFrontend(type: string): 'on-campus' | 'off-campus' | 'private' | 'college' {
  const mapping: Record<string, any> = {
    'ON_CAMPUS': 'on-campus',
    'OFF_CAMPUS': 'off-campus',
    'PRIVATE': 'private',
    'COLLEGE': 'college',
  };
  return mapping[type] || 'off-campus';
}

function mapPricePeriodToFrontend(period: string): 'week' | 'month' | 'semester' | 'year' {
  const mapping: Record<string, any> = {
    'WEEK': 'week',
    'MONTH': 'month',
    'SEMESTER': 'semester',
    'YEAR': 'year',
  };
  return mapping[period] || 'week';
}
