/**
 * API Route: POST /api/auth/login
 * User login with JWT token generation
 * KAN-15: User Login
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { comparePassword } from '@/lib/auth/password';
import { generateTokenPair, JWTPayload } from '@/lib/auth/jwt';

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
      // Same generic message as above - timing attacks are mitigated by bcrypt
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

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
