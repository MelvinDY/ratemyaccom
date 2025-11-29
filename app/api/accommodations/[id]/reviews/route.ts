/**
 * API Routes: /api/accommodations/[id]/reviews
 * Review endpoints for specific accommodation
 * KAN-8: POST - Create Review
 * KAN-9: GET - Get Reviews with Pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/accommodations/[id]/reviews
 * Create a review for an accommodation
 * KAN-8
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accommodationId = params.id;

    // Authenticate user
    let user;
    try {
      user = await requireAuth(request);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to create a review',
        },
        { status: 401 }
      );
    }

    // Verify accommodation exists
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

    const body = await request.json();
    const {
      rating,
      ratingBreakdown,
      title,
      text,
      pros,
      cons,
      roomType,
      stayDuration,
      isAnonymous,
    } = body;

    // Validate required fields
    if (!rating || !ratingBreakdown || !title || !text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Rating, rating breakdown, title, and text are required',
        },
        { status: 400 }
      );
    }

    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid rating',
          message: 'Rating must be between 1 and 5',
        },
        { status: 400 }
      );
    }

    // Check if user already reviewed this accommodation
    const existingReview = await prisma.review.findFirst({
      where: {
        accommodationId,
        userId: user.userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review already exists',
          message: 'You have already submitted a review for this accommodation',
        },
        { status: 409 }
      );
    }

    // Get user's university to check if verified review
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    const isVerified =
      userRecord?.university &&
      accommodation.university.toLowerCase().includes(userRecord.university.toLowerCase());

    // Create review
    const review = await prisma.review.create({
      data: {
        accommodationId,
        userId: user.userId,
        rating,
        ratingCleanliness: ratingBreakdown.cleanliness,
        ratingLocation: ratingBreakdown.location,
        ratingValue: ratingBreakdown.value,
        ratingAmenities: ratingBreakdown.amenities,
        ratingManagement: ratingBreakdown.management,
        ratingSafety: ratingBreakdown.safety,
        title,
        text,
        pros: pros || [],
        cons: cons || [],
        roomType,
        stayDuration,
        verified: isVerified || false,
        isAnonymous: isAnonymous || false,
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
    });

    // Update accommodation ratings
    const allReviews = await prisma.review.findMany({
      where: {
        accommodationId,
        status: 'PUBLISHED',
      },
    });

    const totalReviews = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    const avgCleanliness =
      allReviews.reduce((sum, r) => sum + r.ratingCleanliness, 0) / totalReviews;
    const avgLocation = allReviews.reduce((sum, r) => sum + r.ratingLocation, 0) / totalReviews;
    const avgValue = allReviews.reduce((sum, r) => sum + r.ratingValue, 0) / totalReviews;
    const avgAmenities = allReviews.reduce((sum, r) => sum + r.ratingAmenities, 0) / totalReviews;
    const avgManagement = allReviews.reduce((sum, r) => sum + r.ratingManagement, 0) / totalReviews;
    const avgSafety = allReviews.reduce((sum, r) => sum + r.ratingSafety, 0) / totalReviews;

    await prisma.accommodation.update({
      where: { id: accommodationId },
      data: {
        ratingOverall: avgRating,
        ratingCleanliness: avgCleanliness,
        ratingLocation: avgLocation,
        ratingValue: avgValue,
        ratingAmenities: avgAmenities,
        ratingManagement: avgManagement,
        ratingSafety: avgSafety,
        totalReviews,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review created successfully',
        data: {
          review: {
            id: review.id,
            accommodationId: review.accommodationId,
            userId: review.isAnonymous ? null : review.userId,
            userName: review.isAnonymous ? 'Anonymous Student' : review.user.name,
            userUniversity: review.isAnonymous ? null : review.user.university,
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
            isAnonymous: review.isAnonymous,
            roomType: review.roomType,
            stayDuration: review.stayDuration,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/accommodations/[id]/reviews
 * Get reviews for an accommodation with filtering and pagination
 * KAN-9
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accommodationId = params.id;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const minRating = searchParams.get('minRating');

    // Verify accommodation exists
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

    // Build where clause
    const where: Prisma.ReviewWhereInput = {
      accommodationId,
      status: 'PUBLISHED',
    };

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating),
      };
    }

    // Determine sort order
    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpful: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Count total reviews
    const total = await prisma.review.count({ where });

    // Fetch reviews
    const reviews = await prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
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
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: reviews.map((review) => ({
          id: review.id,
          accommodationId: review.accommodationId,
          userId: review.isAnonymous ? null : review.userId,
          userName: review.isAnonymous ? 'Anonymous Student' : review.user.name,
          userUniversity: review.isAnonymous ? null : review.user.university,
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
          isAnonymous: review.isAnonymous,
          roomType: review.roomType,
          stayDuration: review.stayDuration,
          helpful: review.helpful,
          reported: review.reported,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
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
