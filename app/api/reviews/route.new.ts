/**
 * API Route: /api/reviews
 * Handles review creation and listing
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewRepository } from '@/lib/database/repositories/review.repository';
import { accommodationRepository } from '@/lib/database/repositories/accommodation.repository';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for creating reviews
const CreateReviewSchema = z.object({
  accommodationId: z.string().min(1, 'Accommodation ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  rating: z.number().min(1).max(5),
  ratingBreakdown: z.object({
    cleanliness: z.number().min(1).max(5),
    location: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
    amenities: z.number().min(1).max(5),
    management: z.number().min(1).max(5),
    safety: z.number().min(1).max(5),
  }),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  text: z.string().min(20, 'Review must be at least 20 characters').max(5000),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  roomType: z.string().optional(),
  stayDuration: z.string().optional(),
});

/**
 * GET /api/reviews
 * Get reviews with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accommodationId = searchParams.get('accommodationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!accommodationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accommodation ID is required',
        },
        { status: 400 }
      );
    }

    const result = await reviewRepository.findByAccommodationId(accommodationId, {
      page,
      limit,
    });

    // Transform data for frontend
    const transformedData = result.data.map(review => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: result.pagination,
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

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid review data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if user has already reviewed this accommodation
    const hasReviewed = await reviewRepository.hasUserReviewed(
      data.userId,
      data.accommodationId
    );

    if (hasReviewed) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already reviewed this accommodation',
        },
        { status: 409 }
      );
    }

    // Create review
    const review = await reviewRepository.create({
      accommodation: {
        connect: { id: data.accommodationId },
      },
      user: {
        connect: { id: data.userId },
      },
      rating: data.rating,
      ratingCleanliness: data.ratingBreakdown.cleanliness,
      ratingLocation: data.ratingBreakdown.location,
      ratingValue: data.ratingBreakdown.value,
      ratingAmenities: data.ratingBreakdown.amenities,
      ratingManagement: data.ratingBreakdown.management,
      ratingSafety: data.ratingBreakdown.safety,
      title: data.title,
      text: data.text,
      pros: data.pros,
      cons: data.cons,
      roomType: data.roomType,
      stayDuration: data.stayDuration,
      status: 'PUBLISHED', // or 'PENDING' if you want moderation
    });

    // Update accommodation ratings
    await accommodationRepository.updateRatings(data.accommodationId);

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Review created successfully',
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
