/**
 * API Route: /api/reviews
 * Fetches reviews with filtering and pagination
 * Powered by PostgreSQL database via Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const accommodationId = searchParams.get('accommodationId');
    const userId = searchParams.get('userId');
    const minRating = searchParams.get('minRating');
    const verified = searchParams.get('verified');

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: Prisma.ReviewWhereInput = {
      status: 'PUBLISHED', // Only show published reviews
    };

    if (accommodationId) {
      where.accommodationId = accommodationId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating),
      };
    }

    if (verified === 'true') {
      where.verified = true;
    }

    // Count total reviews
    const total = await prisma.review.count({ where });

    // Fetch reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            university: true,
            verified: true,
          },
        },
        accommodation: {
          select: {
            id: true,
            name: true,
            slug: true,
            university: true,
          },
        },
      },
      orderBy: [{ helpful: 'desc' }, { createdAt: 'desc' }],
    });

    // Transform to match frontend interface
    const transformedData = reviews.map((review) => ({
      id: review.id,
      accommodationId: review.accommodationId,
      accommodationName: review.accommodation.name,
      accommodationSlug: review.accommodation.slug,
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
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
