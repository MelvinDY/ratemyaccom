/**
 * OTP (One-Time Password) Utilities
 * Handles generation, verification, and cleanup of OTP codes
 */

import { prisma } from '@/lib/database/prisma';
import crypto from 'crypto';

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 3;
const OTP_COOLDOWN_SECONDS = 60; // Minimum time between OTP requests

export type OtpType = 'LOGIN' | 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

/**
 * Generate a random 6-digit OTP code
 */
export function generateOtpCode(): string {
  // Generate cryptographically secure random number
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  const randomNum = crypto.randomInt(min, max + 1);
  return randomNum.toString().padStart(OTP_LENGTH, '0');
}

/**
 * Hash OTP code for secure storage
 */
export function hashOtpCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Check if user can request a new OTP (cooldown period)
 */
export async function canRequestOtp(
  email: string,
  type: OtpType = 'LOGIN'
): Promise<{
  canRequest: boolean;
  waitSeconds?: number;
}> {
  const recentOtp = await prisma.otp.findFirst({
    where: {
      email: email.toLowerCase(),
      type,
      createdAt: {
        gte: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000),
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
    const waitSeconds = OTP_COOLDOWN_SECONDS - elapsedSeconds;
    return { canRequest: false, waitSeconds };
  }

  return { canRequest: true };
}

/**
 * Create a new OTP for the given email
 */
export async function createOtp(
  email: string,
  type: OtpType = 'LOGIN'
): Promise<{ code: string; expiresAt: Date }> {
  const normalizedEmail = email.toLowerCase();

  // Delete any existing OTPs for this email and type
  await prisma.otp.deleteMany({
    where: {
      email: normalizedEmail,
      type,
    },
  });

  // Generate new OTP
  const code = generateOtpCode();
  const hashedCode = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP
  await prisma.otp.create({
    data: {
      email: normalizedEmail,
      code: hashedCode,
      type,
      expiresAt,
    },
  });

  return { code, expiresAt };
}

/**
 * Verify an OTP code
 */
export async function verifyOtp(
  email: string,
  code: string,
  type: OtpType = 'LOGIN'
): Promise<{
  valid: boolean;
  error?: string;
  attemptsRemaining?: number;
}> {
  const normalizedEmail = email.toLowerCase();
  const hashedCode = hashOtpCode(code);

  // Find the OTP record
  const otp = await prisma.otp.findFirst({
    where: {
      email: normalizedEmail,
      type,
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    return { valid: false, error: 'No OTP found. Please request a new code.' };
  }

  // Check if OTP has expired
  if (new Date() > otp.expiresAt) {
    await prisma.otp.delete({ where: { id: otp.id } });
    return { valid: false, error: 'OTP has expired. Please request a new code.' };
  }

  // Check if max attempts exceeded
  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.otp.delete({ where: { id: otp.id } });
    return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  // Verify the code
  if (otp.code !== hashedCode) {
    // Increment attempts
    await prisma.otp.update({
      where: { id: otp.id },
      data: { attempts: otp.attempts + 1 },
    });

    const attemptsRemaining = MAX_OTP_ATTEMPTS - (otp.attempts + 1);
    return {
      valid: false,
      error: `Invalid code. ${attemptsRemaining} attempt(s) remaining.`,
      attemptsRemaining,
    };
  }

  // OTP is valid - mark as verified and delete
  await prisma.otp.delete({ where: { id: otp.id } });

  return { valid: true };
}

/**
 * Clean up expired OTPs (can be run as a cron job)
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const result = await prisma.otp.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Get OTP expiry time in minutes
 */
export function getOtpExpiryMinutes(): number {
  return OTP_EXPIRY_MINUTES;
}
