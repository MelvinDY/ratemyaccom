/**
 * API Route: POST /api/auth/refresh
 * Refresh access token using refresh token
 * KAN-18: Token Refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { generateAccessToken, JWTPayload } from '@/lib/auth/jwt';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No refresh token',
          message: 'Refresh token is required',
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET, {
        issuer: 'ratemyaccom',
        audience: 'ratemyaccom-api',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or expired',
        },
        { status: 401 }
      );
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token type',
          message: 'Token is not a refresh token',
        },
        { status: 401 }
      );
    }

    // Fetch user from database to ensure they still exist and are verified
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: 'User account no longer exists',
        },
        { status: 404 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not verified',
          message: 'Please verify your email address',
        },
        { status: 403 }
      );
    }

    // Generate new access token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
    };

    const accessToken = generateAccessToken(payload);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            university: user.university,
            verified: user.verified,
            role: user.role,
          },
        },
      },
      { status: 200 }
    );

    // Update access token cookie
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
