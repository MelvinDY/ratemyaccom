/**
 * Account Lockout Utilities
 * Handles account lockout after failed login attempts to prevent brute force attacks
 * KAN-24: Account Lockout
 */

import { prisma } from '@/lib/database/prisma';

// Configuration
const MAX_FAILED_ATTEMPTS = 5; // Lock account after 5 failed attempts
const LOCKOUT_DURATION_MINUTES = 30; // Lock for 30 minutes
const ATTEMPT_WINDOW_MINUTES = 15; // Reset counter if no attempts in 15 minutes
const PROGRESSIVE_LOCKOUT = true; // Increase lockout duration with each lockout

/**
 * Check if an account is currently locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true },
  });

  if (!user || !user.lockedUntil) {
    return false;
  }

  // Check if lockout period has expired
  const now = new Date();
  if (user.lockedUntil <= now) {
    // Lockout expired - reset the lock
    await unlockAccount(userId);
    return false;
  }

  return true;
}

/**
 * Check if account is locked by email
 */
export async function isAccountLockedByEmail(email: string): Promise<{
  locked: boolean;
  userId?: string;
  lockedUntil?: Date;
  remainingMinutes?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      lockedUntil: true,
    },
  });

  if (!user || !user.lockedUntil) {
    return { locked: false };
  }

  const now = new Date();
  if (user.lockedUntil <= now) {
    // Lockout expired
    await unlockAccount(user.id);
    return { locked: false };
  }

  const remainingMs = user.lockedUntil.getTime() - now.getTime();
  const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

  return {
    locked: true,
    userId: user.id,
    lockedUntil: user.lockedUntil,
    remainingMinutes,
  };
}

/**
 * Record a failed login attempt
 * Returns true if account should be locked
 */
export async function recordFailedLogin(userId: string): Promise<{
  shouldLock: boolean;
  attemptsRemaining: number;
  lockedUntil?: Date;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      failedLoginAttempts: true,
      lastFailedLogin: true,
      lockoutCount: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  let failedAttempts = user.failedLoginAttempts + 1;

  // Reset counter if last attempt was outside the window
  if (user.lastFailedLogin) {
    const minutesSinceLastAttempt = (now.getTime() - user.lastFailedLogin.getTime()) / (1000 * 60);

    if (minutesSinceLastAttempt > ATTEMPT_WINDOW_MINUTES) {
      failedAttempts = 1; // Reset to 1 (current attempt)
    }
  }

  // Update failed attempts
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: failedAttempts,
      lastFailedLogin: now,
    },
  });

  // Check if account should be locked
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = await lockAccount(userId);
    return {
      shouldLock: true,
      attemptsRemaining: 0,
      lockedUntil,
    };
  }

  return {
    shouldLock: false,
    attemptsRemaining: MAX_FAILED_ATTEMPTS - failedAttempts,
  };
}

/**
 * Lock an account
 */
export async function lockAccount(userId: string): Promise<Date> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockoutCount: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate lockout duration (progressive if enabled)
  let lockoutMinutes = LOCKOUT_DURATION_MINUTES;
  if (PROGRESSIVE_LOCKOUT && user.lockoutCount > 0) {
    // Double the lockout duration for each previous lockout
    // 1st: 30min, 2nd: 60min, 3rd: 120min, etc.
    lockoutMinutes = LOCKOUT_DURATION_MINUTES * Math.pow(2, user.lockoutCount);
    // Cap at 24 hours
    lockoutMinutes = Math.min(lockoutMinutes, 24 * 60);
  }

  const lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil,
      lockoutCount: { increment: 1 },
      failedLoginAttempts: 0, // Reset failed attempts
    },
  });

  return lockedUntil;
}

/**
 * Unlock an account (manual unlock by admin or automatic after expiry)
 */
export async function unlockAccount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil: null,
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    },
  });
}

/**
 * Reset failed login attempts (called on successful login)
 */
export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    },
  });
}

/**
 * Get lockout status for a user
 */
export async function getLockoutStatus(userId: string): Promise<{
  isLocked: boolean;
  lockedUntil: Date | null;
  remainingMinutes: number | null;
  failedAttempts: number;
  lockoutCount: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lockedUntil: true,
      failedLoginAttempts: true,
      lockoutCount: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const isLocked = user.lockedUntil ? user.lockedUntil > now : false;

  let remainingMinutes: number | null = null;
  if (isLocked && user.lockedUntil) {
    const remainingMs = user.lockedUntil.getTime() - now.getTime();
    remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
  }

  return {
    isLocked,
    lockedUntil: isLocked ? user.lockedUntil : null,
    remainingMinutes,
    failedAttempts: user.failedLoginAttempts,
    lockoutCount: user.lockoutCount,
  };
}

/**
 * Get lockout configuration
 */
export function getLockoutConfig() {
  return {
    maxFailedAttempts: MAX_FAILED_ATTEMPTS,
    lockoutDurationMinutes: LOCKOUT_DURATION_MINUTES,
    attemptWindowMinutes: ATTEMPT_WINDOW_MINUTES,
    progressiveLockout: PROGRESSIVE_LOCKOUT,
  };
}

/**
 * Calculate lockout duration based on previous lockouts
 */
export function calculateLockoutDuration(previousLockouts: number): number {
  if (!PROGRESSIVE_LOCKOUT || previousLockouts === 0) {
    return LOCKOUT_DURATION_MINUTES;
  }

  // Double for each previous lockout, cap at 24 hours
  const duration = LOCKOUT_DURATION_MINUTES * Math.pow(2, previousLockouts);
  return Math.min(duration, 24 * 60);
}
