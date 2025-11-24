/**
 * API Route: POST /api/admin/unlock/[userId]
 * Admin endpoint to unlock a user account
 * KAN-24: Account Lockout
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { unlockAccount, getLockoutStatus } from '@/lib/auth/lockout';
import { prisma } from '@/lib/database/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin(request);

    const { userId } = params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: 'The specified user does not exist',
        },
        { status: 404 }
      );
    }

    // Get current lockout status
    const statusBefore = await getLockoutStatus(userId);

    if (!statusBefore.isLocked) {
      return NextResponse.json(
        {
          success: true,
          message: 'Account is not currently locked',
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            wasLocked: false,
          },
        },
        { status: 200 }
      );
    }

    // Unlock the account
    await unlockAccount(userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Account unlocked successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          wasLocked: true,
          unlockedAt: new Date(),
          previouslyLockedUntil: statusBefore.lockedUntil,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin privileges required') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Admin privileges required to unlock accounts',
        },
        { status: 403 }
      );
    }

    console.error('Account unlock error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unlock failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
