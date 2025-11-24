/**
 * API Route: POST /api/auth/login
 * User login with JWT token generation
 * KAN-15: User Login
 * KAN-24: Account Lockout
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { comparePassword } from '@/lib/auth/password';
import { generateTokenPair, JWTPayload } from '@/lib/auth/jwt';
import {
  isAccountLockedByEmail,
  recordFailedLogin,
  resetFailedAttempts,
} from '@/lib/auth/lockout';
import { sendAccountLockedEmail } from '@/lib/email/service';
import {
  logLoginSuccess,
  logLoginFailure,
  logAccountLocked,
} from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Check if account is locked BEFORE database query
    const lockStatus = await isAccountLockedByEmail(email);
    if (lockStatus.locked) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account locked',
          message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${lockStatus.remainingMinutes} minute(s).`,
          data: {
            lockedUntil: lockStatus.lockedUntil,
            remainingMinutes: lockStatus.remainingMinutes,
          },
        },
        { status: 423 } // 423 Locked status code
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Check if user exists and has a password (not OAuth user)
    if (!user || !user.password) {
      // Use generic message - don't reveal if email exists
      // This prevents user enumeration attacks
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      // Record failed login attempt
      const lockoutResult = await recordFailedLogin(user.id);

      // Log failed login attempt
      await logLoginFailure(request, user.email, 'Invalid password', {
        userId: user.id,
        attemptsRemaining: lockoutResult.attemptsRemaining,
        willBeLocked: lockoutResult.shouldLock,
      });

      if (lockoutResult.shouldLock) {
        // Log account locked event
        const ipAddress =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          request.ip ||
          'unknown';
        await logAccountLocked(
          ipAddress,
          { id: user.id, email: user.email, name: user.name },
          lockoutResult.lockedUntil!,
          { failedAttempts: 5 }
        );

        // Account has been locked - send notification email
        try {
          await sendAccountLockedEmail(
            user.email,
            user.name,
            lockoutResult.lockedUntil!
          );
        } catch (emailError) {
          console.error('Failed to send account locked email:', emailError);
          // Continue - don't fail the login because email failed
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Account locked',
            message: `Too many failed login attempts. Your account has been locked for security. Please try again later or contact support.`,
            data: {
              lockedUntil: lockoutResult.lockedUntil,
            },
          },
          { status: 423 } // 423 Locked
        );
      }

      // Account not locked yet - return generic error with hint
      const hintMessage =
        lockoutResult.attemptsRemaining <= 2
          ? ` You have ${lockoutResult.attemptsRemaining} attempt(s) remaining before your account is temporarily locked.`
          : '';

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password.' + hintMessage,
          data: {
            attemptsRemaining: lockoutResult.attemptsRemaining,
          },
        },
        { status: 401 }
      );
    }

    // Password is valid - reset failed attempts
    await resetFailedAttempts(user.id);

    // Log successful login
    await logLoginSuccess(request, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Check if account is verified
    if (!user.verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not verified',
          message: 'Please verify your email address before logging in',
        },
        { status: 403 }
      );
    }

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
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
