/**
 * API Routes: /api/moderator/reviews
 * Moderator endpoints for managing reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/auth/middleware';
import { logAuditEvent, AuditEventType, AuditEventStatus } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/moderator/reviews
 * Get all reviews for moderation
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin/moderator role
    try {
      await requireAdmin(request);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be a moderator to access this resource',
        },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.review.count({ where });

    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
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
    });

    // Format response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      title: review.title,
      text: review.text,
      rating: review.rating,
      ratingBreakdown: {
        cleanliness: review.ratingCleanliness,
        location: review.ratingLocation,
        value: review.ratingValue,
        amenities: review.ratingAmenities,
        management: review.ratingManagement,
        safety: review.ratingSafety,
      },
      pros: review.pros,
      cons: review.cons,
      status: review.status,
      verified: review.verified,
      isAnonymous: review.isAnonymous,
      helpful: review.helpful,
      reported: review.reported,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      moderatedBy: review.moderatedBy,
      moderatedAt: review.moderatedAt,
      user: review.isAnonymous
        ? { id: review.userId, name: 'Anonymous', email: null, university: null }
        : review.user,
      accommodation: review.accommodation,
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews for moderation:', error);
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
 * DELETE /api/moderator/reviews
 * Delete a review (moderator action)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require admin/moderator role
    let user;
    try {
      user = await requireAdmin(request);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be a moderator to delete reviews',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewId, reason } = body;

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Review ID is required',
        },
        { status: 400 }
      );
    }

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        accommodation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Review not found',
        },
        { status: 404 }
      );
    }

    const accommodationId = review.accommodationId;

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate accommodation ratings
    const remainingReviews = await prisma.review.findMany({
      where: {
        accommodationId,
        status: 'PUBLISHED',
      },
    });

    if (remainingReviews.length > 0) {
      const totalReviews = remainingReviews.length;
      const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      const avgCleanliness =
        remainingReviews.reduce((sum, r) => sum + r.ratingCleanliness, 0) / totalReviews;
      const avgLocation =
        remainingReviews.reduce((sum, r) => sum + r.ratingLocation, 0) / totalReviews;
      const avgValue = remainingReviews.reduce((sum, r) => sum + r.ratingValue, 0) / totalReviews;
      const avgAmenities =
        remainingReviews.reduce((sum, r) => sum + r.ratingAmenities, 0) / totalReviews;
      const avgManagement =
        remainingReviews.reduce((sum, r) => sum + r.ratingManagement, 0) / totalReviews;
      const avgSafety = remainingReviews.reduce((sum, r) => sum + r.ratingSafety, 0) / totalReviews;

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
    } else {
      // Reset ratings if no reviews left
      await prisma.accommodation.update({
        where: { id: accommodationId },
        data: {
          ratingOverall: 0,
          ratingCleanliness: 0,
          ratingLocation: 0,
          ratingValue: 0,
          ratingAmenities: 0,
          ratingManagement: 0,
          ratingSafety: 0,
          totalReviews: 0,
        },
      });
    }

    // Log the moderation action
    await logAuditEvent({
      eventType: AuditEventType.REVIEW_DELETED,
      eventAction: 'Moderator deleted review',
      eventStatus: AuditEventStatus.SUCCESS,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      requestPath: request.url,
      requestMethod: 'DELETE',
      metadata: {
        reviewId,
        reviewTitle: review.title,
        reviewAuthor: review.user?.email,
        accommodationId,
        accommodationName: review.accommodation?.name,
        reason: reason || 'No reason provided',
      },
      message: `Moderator ${user.email} deleted review "${review.title}" by ${review.user?.email || 'anonymous'}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
