/**
 * API Route: POST /api/auth/otp/request
 * Request a one-time password for email sign-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { createOtp, canRequestOtp } from '@/lib/auth/otp';
import { sendOtpEmail } from '@/lib/email/service';
import { isAccountLockedByEmail } from '@/lib/auth/lockout';

export const dynamic = 'force-dynamic';

interface OtpRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OtpRequestBody = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email required',
          message: 'Please provide your email address',
        },
        { status: 400 }
      );
    }

    // Validate email format (university emails only)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(student\.)?(unsw|usyd|uts|mq|westernsydney)\.edu\.au$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email',
          message:
            'Must be a valid university student email (UNSW, USYD, UTS, Macquarie, or Western Sydney)',
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if user exists - return success anyway
      // but don't actually send an email
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, you will receive an OTP shortly.',
        },
        { status: 200 }
      );
    }

    // Check if user account is verified
    if (!user.verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not verified',
          message:
            'Please verify your email address first. Check your inbox for the verification link.',
        },
        { status: 403 }
      );
    }

    // Check cooldown period
    const cooldownCheck = await canRequestOtp(normalizedEmail, 'LOGIN');
    if (!cooldownCheck.canRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limited',
          message: `Please wait ${cooldownCheck.waitSeconds} seconds before requesting a new code.`,
          data: { waitSeconds: cooldownCheck.waitSeconds },
        },
        { status: 429 }
      );
    }

    // Create OTP
    const { code, expiresAt } = await createOtp(normalizedEmail, 'LOGIN');

    // Send OTP email
    try {
      await sendOtpEmail(normalizedEmail, user.name, code);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return NextResponse.json(
        {
          success: false,
          error: 'Email failed',
          message: 'Failed to send OTP email. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully. Please check your email.',
        data: {
          expiresAt,
          expiresInMinutes: 10,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Request failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
