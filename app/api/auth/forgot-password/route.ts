/**
 * API Route: POST /api/auth/forgot-password
 * Request password reset email
 * KAN-21: Password Reset Request
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { validateEmail } from '@/lib/auth/email';
import { generatePasswordResetToken } from '@/lib/auth/jwt';
import { sendPasswordResetEmail } from '@/lib/email/service';

export const dynamic = 'force-dynamic';

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email',
          message: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email',
          message: emailValidation.errors.join(', '),
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent user enumeration attacks
    // Even if user doesn't exist, we return the same response
    const successResponse = {
      success: true,
      message:
        'If an account exists with this email, you will receive password reset instructions.',
    };

    if (!user) {
      // User doesn't exist, but we return success anyway
      // This prevents attackers from discovering valid email addresses
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Generate password reset token (expires in 1 hour)
    const resetToken = generatePasswordResetToken(email.toLowerCase());

    // Send password reset email
    try {
      await sendPasswordResetEmail(email.toLowerCase(), resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't reveal email sending failure to prevent information disclosure
      // Still return success response
    }

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Request failed',
        message: 'Unable to process password reset request. Please try again.',
      },
      { status: 500 }
    );
  }
}
