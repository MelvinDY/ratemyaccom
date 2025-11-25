/**
 * API Route: POST /api/auth/otp/verify
 * Verify OTP and authenticate user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { verifyOtp } from '@/lib/auth/otp';
import { generateTokenPair, JWTPayload } from '@/lib/auth/jwt';
import { isAccountLockedByEmail, recordFailedLogin, resetFailedAttempts } from '@/lib/auth/lockout';
import { logLoginSuccess, logLoginFailure } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

interface OtpVerifyBody {
  email: string;
  code: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OtpVerifyBody = await request.json();
    const { email, code } = body;

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing fields',
          message: 'Email and OTP code are required',
        },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid format',
          message: 'OTP must be a 6-digit code',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if account is locked
    const lockStatus = await isAccountLockedByEmail(normalizedEmail);
    if (lockStatus.locked) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account locked',
          message: `Account is temporarily locked. Please try again in ${lockStatus.remainingMinutes} minute(s).`,
        },
        { status: 423 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or OTP',
        },
        { status: 401 }
      );
    }

    // Verify OTP
    const otpResult = await verifyOtp(normalizedEmail, code, 'LOGIN');

    if (!otpResult.valid) {
      // Record failed attempt for lockout tracking
      await recordFailedLogin(user.id);

      // Log failed login attempt
      await logLoginFailure(request, user.email, 'Invalid OTP', {
        userId: user.id,
        otpError: otpResult.error,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid OTP',
          message: otpResult.error || 'Invalid or expired OTP',
          data: {
            attemptsRemaining: otpResult.attemptsRemaining,
          },
        },
        { status: 401 }
      );
    }

    // OTP is valid - reset failed attempts
    await resetFailedAttempts(user.id);

    // Log successful login
    await logLoginSuccess(
      request,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      { method: 'otp' }
    );

    // Generate JWT tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            university: user.university,
            verified: user.verified,
            role: user.role,
          },
          accessToken,
        },
      },
      { status: 200 }
    );

    // Set secure httpOnly cookies
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
