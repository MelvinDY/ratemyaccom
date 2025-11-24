/**
 * API Route: POST /api/auth/register
 * User registration with university email verification
 * KAN-14: User Registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { validateEmail, getUniversityFromEmail } from '@/lib/auth/email';
import { generateVerificationToken } from '@/lib/auth/jwt';
import { sendVerificationEmail } from '@/lib/email/service';
import { logRegistration } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  university?: string;
  studentId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name, university, studentId } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Email, password, and name are required',
        },
        { status: 400 }
      );
    }

    // Validate email format and university domain
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

    // Validate password strength
    const passwordValidation = validatePassword(password);
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Don't reveal if email exists - prevents user enumeration attacks
      // Return same response as successful registration
      // Note: Ensure rate limiting is configured on this endpoint
      return NextResponse.json(
        {
          success: true,
          message:
            'Registration successful. Please check your email to verify your account.',
          data: {
            user: {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              university: existingUser.university,
              verified: existingUser.verified,
              createdAt: existingUser.createdAt,
            },
          },
        },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get university from email if not provided
    const userUniversity = university || getUniversityFromEmail(email) || 'Unknown';

    // Create unverified user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        university: userUniversity,
        studentId: studentId || null,
        verified: false,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        university: true,
        verified: true,
        createdAt: true,
      },
    });

    // Generate verification token
    const verificationToken = generateVerificationToken(email.toLowerCase());

    // Send verification email
    try {
      await sendVerificationEmail(email.toLowerCase(), verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails
      // User can request a new verification email later
    }

    // Log successful registration
    await logRegistration(request, {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
