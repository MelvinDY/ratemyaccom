/**
 * CSRF Token Utilities
 * Handles CSRF token generation and validation for protecting against
 * Cross-Site Request Forgery attacks
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'csrf-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Generate HMAC signature for CSRF token
 * This creates a cryptographically secure hash that ties the token to the secret
 */
export function signCsrfToken(token: string): string {
  return crypto.createHmac('sha256', CSRF_SECRET).update(token).digest('hex');
}

/**
 * Verify CSRF token signature
 */
export function verifyCsrfToken(token: string, signature: string): boolean {
  const expectedSignature = signCsrfToken(token);

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Create a complete CSRF token with signature
 * Format: token.signature
 */
export function createCsrfToken(): string {
  const token = generateCsrfToken();
  const signature = signCsrfToken(token);
  return `${token}.${signature}`;
}

/**
 * Validate a complete CSRF token
 */
export function validateCsrfToken(fullToken: string): boolean {
  if (!fullToken || typeof fullToken !== 'string') {
    return false;
  }

  const parts = fullToken.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [token, signature] = parts;
  return verifyCsrfToken(token, signature);
}

/**
 * Get CSRF token from request (checks header and body)
 */
export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Check header first (recommended method)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Fallback: check x-xsrf-token (common alternative)
  const xsrfToken = request.headers.get('x-xsrf-token');
  if (xsrfToken) {
    return xsrfToken;
  }

  return null;
}

/**
 * Get CSRF token from cookies
 */
export function getCsrfTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Validate CSRF token from request
 * Compares the token in the request header with the token in the cookie
 */
export function validateCsrfFromRequest(request: NextRequest): boolean {
  const requestToken = getCsrfTokenFromRequest(request);
  const cookieToken = getCsrfTokenFromCookies(request);

  if (!requestToken || !cookieToken) {
    return false;
  }

  // Validate both tokens individually
  if (!validateCsrfToken(requestToken) || !validateCsrfToken(cookieToken)) {
    return false;
  }

  // Ensure they match (double-submit cookie pattern)
  return requestToken === cookieToken;
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/**
 * CSRF validation error response
 */
export function createCsrfErrorResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'CSRF validation failed',
      message: 'Invalid or missing CSRF token',
    },
    { status: 403 }
  );
}

/**
 * Middleware helper to validate CSRF for protected routes
 */
export function validateCsrfMiddleware(request: NextRequest): NextResponse | null {
  // Only check state-changing methods
  if (!requiresCsrfProtection(request.method)) {
    return null;
  }

  // Skip CSRF check for certain paths (like webhook endpoints)
  const path = request.nextUrl.pathname;
  const skipPaths = ['/api/webhooks/', '/api/health'];
  if (skipPaths.some((skipPath) => path.startsWith(skipPath))) {
    return null;
  }

  // Validate CSRF token
  if (!validateCsrfFromRequest(request)) {
    console.warn(`CSRF validation failed for ${request.method} ${path}`);
    return createCsrfErrorResponse();
  }

  return null;
}

export const CSRF_CONFIG = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
  TOKEN_LENGTH: CSRF_TOKEN_LENGTH,
} as const;
