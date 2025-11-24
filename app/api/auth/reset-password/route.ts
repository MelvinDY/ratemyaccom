/**
 * API Route: POST /api/auth/reset-password
 * Reset password with token
 * KAN-22: Password Reset Confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { validatePassword, hashPassword } from '@/lib/auth/password';
import { verifyPasswordResetToken } from '@/lib/auth/jwt';
import { sendPasswordChangedEmail } from '@/lib/email/service';
import { logPasswordChange } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { token, newPassword } = body;

    // Validate required fields
    if (!token || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Reset token and new password are required',
        },
        { status: 400 }
      );
    }

    // Verify token and extract email
    const email = verifyPasswordResetToken(token);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
          message:
            'The password reset token is invalid or has expired. Please request a new password reset.',
        },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Weak password',
          message: passwordValidation.errors.join(', '),
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

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Log password change
    await logPasswordChange(request, {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Send password changed notification email
    try {
      await sendPasswordChangedEmail(user.email);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail password reset if email sending fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Password reset failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
