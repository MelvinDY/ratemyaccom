/**
 * API Route: GET /api/auth/lockout-status
 * Check lockout status for current user or by email
 * KAN-24: Account Lockout
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAccountLockedByEmail, getLockoutConfig } from '@/lib/auth/lockout';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/lockout-status?email=user@example.com
 * Check if an account is locked by email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email',
          message: 'Email parameter is required',
        },
        { status: 400 }
      );
    }

    const lockStatus = await isAccountLockedByEmail(email);
    const config = getLockoutConfig();

    if (lockStatus.locked) {
      return NextResponse.json(
        {
          success: true,
          data: {
            isLocked: true,
            lockedUntil: lockStatus.lockedUntil,
            remainingMinutes: lockStatus.remainingMinutes,
            message: `Account is locked. Please try again in ${lockStatus.remainingMinutes} minute(s).`,
            config,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          isLocked: false,
          message: 'Account is not locked',
          config,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lockout status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Status check failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
