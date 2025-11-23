/**
 * API Route: GET /api/accommodations/[id]
 * Fetches a single accommodation by ID or slug
 * Now powered by PostgreSQL database via Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { Accommodation } from '@/types';
import { AccommodationType, PricePeriod } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Helper function to convert DB enum to frontend type
function convertAccommodationType(type: AccommodationType): Accommodation['type'] {
  return type.toLowerCase().replace('_', '-') as Accommodation['type'];
}

function convertPricePeriod(period: PricePeriod): Accommodation['pricing']['period'] {
  return period.toLowerCase() as Accommodation['pricing']['period'];
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Find by ID or slug
    const accommodation = await prisma.accommodation.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        reviews: {
          where: {
            status: 'PUBLISHED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                university: true,
                verified: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Limit to 10 most recent reviews
        },
      },
    });

    if (!accommodation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accommodation not found',
        },
        { status: 404 }
      );
    }

    // Transform to match frontend interface
    const transformedData: Accommodation = {
      id: accommodation.id,
      name: accommodation.name,
      slug: accommodation.slug,
      university: accommodation.university,
      location: {
        address: accommodation.address,
        suburb: accommodation.suburb,
        state: accommodation.state,
        postcode: accommodation.postcode,
        ...(accommodation.latitude && accommodation.longitude && {
          coordinates: {
            lat: accommodation.latitude,
            lng: accommodation.longitude,
          },
        }),
      },
      description: accommodation.description,
      type: convertAccommodationType(accommodation.type),
      images: accommodation.images,
      amenities: accommodation.amenities.map((aa) => ({
        id: aa.amenity.id,
        name: aa.amenity.name,
        ...(aa.amenity.icon && { icon: aa.amenity.icon }),
        available: aa.available,
      })),
      pricing: {
        min: accommodation.priceMin,
        max: accommodation.priceMax,
        currency: accommodation.currency,
        period: convertPricePeriod(accommodation.pricePeriod),
      },
      capacity: accommodation.capacity,
      roomTypes: accommodation.roomTypes,
      contactInfo: accommodation.contactInfo as { phone?: string; email?: string; website?: string },
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
      reviews: accommodation.reviews.map((review) => ({
        id: review.id,
        accommodationId: review.accommodationId,
        userId: review.userId,
        userName: review.user.name,
        userUniversity: review.user.university,
        rating: review.rating,
        ratingBreakdown: {
          cleanliness: review.ratingCleanliness,
          location: review.ratingLocation,
          value: review.ratingValue,
          amenities: review.ratingAmenities,
          management: review.ratingManagement,
          safety: review.ratingSafety,
        },
        title: review.title,
        text: review.text,
        pros: review.pros,
        cons: review.cons,
        verified: review.verified,
        roomType: review.roomType,
        stayDuration: review.stayDuration,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        helpful: review.helpful,
        reported: review.reported,
      })),
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
 * Update an accommodation
 * KAN-6
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const request = _request;
    const accommodationId = params.id;

    // Import auth middleware
    const { requireAuth } = await import('@/lib/auth/middleware');

    // Authenticate user (admin only)
    let user;
    try {
      user = await requireAuth(request);

      if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied',
            message: 'Only administrators can update accommodation listings',
          },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in as an administrator',
        },
        { status: 401 }
      );
    }

    // Check if accommodation exists
    const existingAccommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
    });

    if (!existingAccommodation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accommodation not found',
          message: 'The specified accommodation does not exist',
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      university,
      address,
      suburb,
      state,
      postcode,
      latitude,
      longitude,
      description,
      type,
      images,
      priceMin,
      priceMax,
      pricePeriod,
      capacity,
      roomTypes,
      contactInfo,
      distanceToCampus,
      distanceToTransport,
      verified,
      featured,
      active,
    } = body;

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (university !== undefined) updateData.university = university;
    if (address !== undefined) updateData.address = address;
    if (suburb !== undefined) updateData.suburb = suburb;
    if (state !== undefined) updateData.state = state;
    if (postcode !== undefined) updateData.postcode = postcode;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) {
      const typeMap: Record<string, any> = {
        'on-campus': 'ON_CAMPUS',
        'off-campus': 'OFF_CAMPUS',
        'private': 'PRIVATE',
        'college': 'COLLEGE',
      };
      updateData.type = typeMap[type.toLowerCase()] || type.toUpperCase().replace('-', '_');
    }
    if (images !== undefined) updateData.images = images;
    if (priceMin !== undefined) updateData.priceMin = priceMin;
    if (priceMax !== undefined) updateData.priceMax = priceMax;
    if (pricePeriod !== undefined) updateData.pricePeriod = pricePeriod;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (roomTypes !== undefined) updateData.roomTypes = roomTypes;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (distanceToCampus !== undefined) updateData.distanceToCampus = distanceToCampus;
    if (distanceToTransport !== undefined) updateData.distanceToTransport = distanceToTransport;
    if (verified !== undefined) updateData.verified = verified;
    if (featured !== undefined) updateData.featured = featured;
    if (active !== undefined) updateData.active = active;

    // Update accommodation
    const updatedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        university: true,
        address: true,
        suburb: true,
        state: true,
        postcode: true,
        description: true,
        type: true,
        priceMin: true,
        priceMax: true,
        verified: true,
        featured: true,
        active: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Accommodation updated successfully',
        data: updatedAccommodation,
      },
      { status: 200 }
    );
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
 * Delete an accommodation
 * KAN-7
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const request = _request;
    const accommodationId = params.id;

    // Import auth middleware
    const { requireAuth } = await import('@/lib/auth/middleware');

    // Authenticate user (admin only)
    let user;
    try {
      user = await requireAuth(request);

      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied',
            message: 'Only administrators can delete accommodation listings',
          },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in as an administrator',
        },
        { status: 401 }
      );
    }

    // Check if accommodation exists
    const accommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
    });

    if (!accommodation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accommodation not found',
          message: 'The specified accommodation does not exist',
        },
        { status: 404 }
      );
    }

    // Delete accommodation (cascade will handle related records)
    await prisma.accommodation.delete({
      where: { id: accommodationId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Accommodation deleted successfully',
      },
      { status: 200 }
    );
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
