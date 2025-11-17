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
        coordinates: accommodation.latitude && accommodation.longitude
          ? {
              lat: accommodation.latitude,
              lng: accommodation.longitude,
            }
          : undefined,
      },
      description: accommodation.description,
      type: convertAccommodationType(accommodation.type),
      images: accommodation.images,
      amenities: accommodation.amenities.map((aa) => ({
        id: aa.amenity.id,
        name: aa.amenity.name,
        icon: aa.amenity.icon || undefined,
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
