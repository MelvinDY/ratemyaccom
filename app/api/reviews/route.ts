/**
 * API Route: /api/reviews
 * GET: Fetch reviews for an accommodation
 * POST: Create a new review
 */

import { NextRequest, NextResponse } from 'next/server';
import { placeholderReviews } from '@/lib/data/placeholder';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews?accommodationId=xxx
 * Fetch reviews for a specific accommodation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accommodationId = searchParams.get('accommodationId');

    if (!accommodationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'accommodationId is required',
        },
        { status: 400 }
      );
    }

    const reviews = placeholderReviews.filter(
      (review) => review.accommodationId === accommodationId
    );

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const total = reviews.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedReviews = reviews.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginatedReviews,
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

/**
 * POST /api/reviews
 * Create a new review (requires authentication in production)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['accommodationId', 'rating', 'title', 'text'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          fields: missingFields,
        },
        { status: 400 }
      );
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating must be between 1 and 5',
        },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Verify user authentication
    // 2. Check if user has already reviewed this accommodation
    // 3. Validate and sanitize input
    // 4. Store in database
    // 5. Update accommodation ratings

    // For now, return success with mock data
    const newReview = {
      id: `review-${Date.now()}`,
      accommodationId: body.accommodationId,
      userId: 'user-placeholder',
      userName: body.userName || 'Anonymous',
      userUniversity: body.userUniversity,
      rating: body.rating,
      ratingBreakdown: body.ratingBreakdown || {
        cleanliness: body.rating,
        location: body.rating,
        value: body.rating,
        amenities: body.rating,
        management: body.rating,
        safety: body.rating,
      },
      title: body.title,
      text: body.text,
      pros: body.pros || [],
      cons: body.cons || [],
      verified: false,
      roomType: body.roomType,
      stayDuration: body.stayDuration,
      createdAt: new Date(),
      updatedAt: new Date(),
      helpful: 0,
      reported: 0,
    };

    return NextResponse.json(
      {
        success: true,
        data: newReview,
        message: 'Review submitted successfully',
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
