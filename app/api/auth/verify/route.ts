/**
 * API Route: POST /api/auth/verify
 * Email verification endpoint
 * KAN-16: Email Verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { verifyVerificationToken } from '@/lib/auth/jwt';
import { sendWelcomeEmail } from '@/lib/email/service';
import { logEmailVerification } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

interface VerifyRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { token } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing token',
          message: 'Verification token is required',
        },
        { status: 400 }
      );
    }

    // Verify token and extract email
    const email = verifyVerificationToken(token);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
          message: 'The verification token is invalid or has expired. Please request a new verification email.',
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: 'No account found with this email address',
        },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.verified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified',
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              verified: user.verified,
            },
          },
        },
        { status: 200 }
      );
    }

    // Mark user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
      select: {
        id: true,
        email: true,
        name: true,
        university: true,
        verified: true,
      },
    });

    // Log email verification
    await logEmailVerification(request, {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(updatedUser.email, updatedUser.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully. You can now log in.',
        data: {
          user: updatedUser,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
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
