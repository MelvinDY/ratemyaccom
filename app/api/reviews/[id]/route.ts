/**
 * API Routes: /api/reviews/[id]
 * Review management endpoints
 * KAN-10: PUT - Update Review
 * KAN-11: DELETE - Delete Review
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/reviews/[id]
 * Update a review
 * KAN-10
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Authenticate user
    let user;
    try {
      user = await requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to update a review',
        },
        { status: 401 }
      );
    }

    // Find review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
          message: 'The specified review does not exist',
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (review.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied',
          message: 'You can only update your own reviews',
        },
        { status: 403 }
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
    } = body;

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (rating !== undefined) {
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
      updateData.rating = rating;
    }

    if (ratingBreakdown) {
      if (ratingBreakdown.cleanliness !== undefined)
        updateData.ratingCleanliness = ratingBreakdown.cleanliness;
      if (ratingBreakdown.location !== undefined)
        updateData.ratingLocation = ratingBreakdown.location;
      if (ratingBreakdown.value !== undefined)
        updateData.ratingValue = ratingBreakdown.value;
      if (ratingBreakdown.amenities !== undefined)
        updateData.ratingAmenities = ratingBreakdown.amenities;
      if (ratingBreakdown.management !== undefined)
        updateData.ratingManagement = ratingBreakdown.management;
      if (ratingBreakdown.safety !== undefined)
        updateData.ratingSafety = ratingBreakdown.safety;
    }

    if (title !== undefined) updateData.title = title;
    if (text !== undefined) updateData.text = text;
    if (pros !== undefined) updateData.pros = pros;
    if (cons !== undefined) updateData.cons = cons;
    if (roomType !== undefined) updateData.roomType = roomType;
    if (stayDuration !== undefined) updateData.stayDuration = stayDuration;

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            university: true,
          },
        },
      },
    });

    // If rating changed, recalculate accommodation ratings
    if (rating !== undefined || ratingBreakdown !== undefined) {
      const allReviews = await prisma.review.findMany({
        where: {
          accommodationId: review.accommodationId,
          status: 'PUBLISHED',
        },
      });

      const totalReviews = allReviews.length;
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      const avgCleanliness = allReviews.reduce((sum, r) => sum + r.ratingCleanliness, 0) / totalReviews;
      const avgLocation = allReviews.reduce((sum, r) => sum + r.ratingLocation, 0) / totalReviews;
      const avgValue = allReviews.reduce((sum, r) => sum + r.ratingValue, 0) / totalReviews;
      const avgAmenities = allReviews.reduce((sum, r) => sum + r.ratingAmenities, 0) / totalReviews;
      const avgManagement = allReviews.reduce((sum, r) => sum + r.ratingManagement, 0) / totalReviews;
      const avgSafety = allReviews.reduce((sum, r) => sum + r.ratingSafety, 0) / totalReviews;

      await prisma.accommodation.update({
        where: { id: review.accommodationId },
        data: {
          ratingOverall: avgRating,
          ratingCleanliness: avgCleanliness,
          ratingLocation: avgLocation,
          ratingValue: avgValue,
          ratingAmenities: avgAmenities,
          ratingManagement: avgManagement,
          ratingSafety: avgSafety,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review updated successfully',
        data: {
          review: {
            id: updatedReview.id,
            accommodationId: updatedReview.accommodationId,
            userId: updatedReview.userId,
            userName: updatedReview.user.name,
            rating: updatedReview.rating,
            ratingBreakdown: {
              cleanliness: updatedReview.ratingCleanliness,
              location: updatedReview.ratingLocation,
              value: updatedReview.ratingValue,
              amenities: updatedReview.ratingAmenities,
              management: updatedReview.ratingManagement,
              safety: updatedReview.ratingSafety,
            },
            title: updatedReview.title,
            text: updatedReview.text,
            pros: updatedReview.pros,
            cons: updatedReview.cons,
            verified: updatedReview.verified,
            roomType: updatedReview.roomType,
            stayDuration: updatedReview.stayDuration,
            createdAt: updatedReview.createdAt,
            updatedAt: updatedReview.updatedAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Delete a review
 * KAN-11
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Authenticate user
    let user;
    try {
      user = await requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to delete a review',
        },
        { status: 401 }
      );
    }

    // Find review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
          message: 'The specified review does not exist',
        },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (review.userId !== user.userId && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied',
          message: 'You can only delete your own reviews',
        },
        { status: 403 }
      );
    }

    const accommodationId = review.accommodationId;

    // Delete review
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
      const avgCleanliness = remainingReviews.reduce((sum, r) => sum + r.ratingCleanliness, 0) / totalReviews;
      const avgLocation = remainingReviews.reduce((sum, r) => sum + r.ratingLocation, 0) / totalReviews;
      const avgValue = remainingReviews.reduce((sum, r) => sum + r.ratingValue, 0) / totalReviews;
      const avgAmenities = remainingReviews.reduce((sum, r) => sum + r.ratingAmenities, 0) / totalReviews;
      const avgManagement = remainingReviews.reduce((sum, r) => sum + r.ratingManagement, 0) / totalReviews;
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
      // Reset ratings to 0 if no reviews left
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

    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully',
      },
      { status: 200 }
    );
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
