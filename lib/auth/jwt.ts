/**
 * JWT Token Utilities
 * Handles JWT token generation, verification, and validation
 */

import jwt from 'jsonwebtoken';

// Get JWT secret from environment, with fallback for development
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // Refresh token expires in 30 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  verified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ratemyaccom',
    audience: 'ratemyaccom-api',
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'ratemyaccom',
    audience: 'ratemyaccom-api',
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload.userId),
  };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ratemyaccom',
      audience: 'ratemyaccom-api',
    });

    if (typeof decoded === 'object' && decoded !== null) {
      return decoded as JWTPayload;
    }

    return null;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Generate email verification token
 * Valid for 24 hours
 */
export function generateVerificationToken(email: string): string {
  return jwt.sign({ email, type: 'verification' }, JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'ratemyaccom',
  });
}

/**
 * Verify email verification token
 */
export function verifyVerificationToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ratemyaccom',
    });

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'email' in decoded &&
      'type' in decoded &&
      decoded.type === 'verification'
    ) {
      return decoded.email as string;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Generate password reset token
 * Valid for 1 hour
 */
export function generatePasswordResetToken(email: string): string {
  return jwt.sign({ email, type: 'password-reset' }, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'ratemyaccom',
  });
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ratemyaccom',
    });

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'email' in decoded &&
      'type' in decoded &&
      decoded.type === 'password-reset'
    ) {
      return decoded.email as string;
    }

    return null;
  } catch (error) {
    return null;
  }
}
