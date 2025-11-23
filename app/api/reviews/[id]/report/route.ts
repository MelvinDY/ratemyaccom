/**
 * API Route: POST /api/reviews/[id]/report
 * Report inappropriate review
 * KAN-13
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

interface ReportRequest {
  reason: 'spam' | 'offensive' | 'fake' | 'other';
  details?: string;
}

const REPORT_THRESHOLD = 5; // Auto-hide review after 5 reports

export async function POST(
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
          message: 'You must be logged in to report reviews',
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

    const body: ReportRequest = await request.json();
    const { reason, details } = body;

    // Validate reason
    const validReasons = ['spam', 'offensive', 'fake', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid reason',
          message: 'Reason must be one of: spam, offensive, fake, other',
        },
        { status: 400 }
      );
    }

    // Increment report count
    const currentReports = review.reported;
    const newReportCount = currentReports + 1;

    // Update review
    const updateData: any = {
      reported: newReportCount,
    };

    // Auto-hide if threshold exceeded
    if (newReportCount >= REPORT_THRESHOLD && review.status === 'PUBLISHED') {
      updateData.status = 'FLAGGED';
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      select: {
        id: true,
        reported: true,
        status: true,
      },
    });

    // Log the report (in production, you'd store this in a separate reports table)
    console.log('Review reported:', {
      reviewId,
      reportedBy: user.userId,
      reason,
      details,
      totalReports: newReportCount,
      autoFlagged: newReportCount >= REPORT_THRESHOLD,
    });

    // TODO: Notify moderators if flagged
    const responseMessage =
      newReportCount >= REPORT_THRESHOLD
        ? 'Review reported and automatically flagged for moderator review'
        : 'Review reported successfully. Thank you for helping keep our community safe.';

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
        data: {
          reviewId: updatedReview.id,
          reportCount: updatedReview.reported,
          status: updatedReview.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to report review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
