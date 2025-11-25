/**
 * API Routes: /api/users/[id]
 * User profile endpoints
 * KAN-18: GET - Get User Profile
 * KAN-19: PUT - Update User Profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireOwnership } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/[id]
 * Fetch user profile information (public data only)
 * KAN-18
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        university: true,
        verified: true,
        createdAt: true,
        reviews: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            rating: true,
            title: true,
            createdAt: true,
            accommodation: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // Most recent 5 reviews
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: 'No user found with this ID',
        },
        { status: 404 }
      );
    }

    // Calculate review count
    const reviewCount = await prisma.review.count({
      where: {
        userId: userId,
        status: 'PUBLISHED',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            university: user.university,
            verified: user.verified,
            createdAt: user.createdAt,
            reviewCount,
          },
          recentReviews: user.reviews,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update user profile
 * KAN-19
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Authenticate and verify ownership
    try {
      await requireOwnership(request, userId);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied',
          message: error instanceof Error ? error.message : 'You can only update your own profile',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, university } = body;

    // Validate at least one field to update
    if (!name && !university) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
          message: 'Please provide at least one field to update (name or university)',
        },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: { name?: string; university?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (university) updateData.university = university;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        university: true,
        verified: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
