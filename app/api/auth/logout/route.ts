/**
 * API Route: POST /api/auth/logout
 * User logout endpoint
 * KAN-17: User Logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { logLogout } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Extract user info from token before clearing cookies
    const token = request.cookies.get('auth-token')?.value;
    let userInfo = null;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        if (payload) {
          userInfo = {
            id: payload.userId,
            email: payload.email,
            name: payload.email.split('@')[0], // Fallback name from email
          };
        }
      } catch {
        // Token invalid or expired, proceed with logout anyway
      }
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );

    // Clear authentication cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    // Log logout event if user was authenticated
    if (userInfo) {
      await logLogout(request, userInfo);
    }

    // TODO: Add token to blacklist in production
    // For now, we're just clearing cookies which is sufficient for basic security

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
