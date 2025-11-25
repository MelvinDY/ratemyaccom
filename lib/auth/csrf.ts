/**
 * CSRF Token Utilities
 * Handles CSRF token generation and validation for protecting against
 * Cross-Site Request Forgery attacks
 *
 * Uses Web Crypto API for compatibility with both Node.js and Edge Runtime
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET =
  process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'csrf-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a random CSRF token using Web Crypto API
 */
export function generateCsrfToken(): string {
  const buffer = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert string to Uint8Array for Web Crypto API
 */
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate HMAC signature for CSRF token using Web Crypto API
 * This creates a cryptographically secure hash that ties the token to the secret
 */
export async function signCsrfToken(token: string): Promise<string> {
  const keyData = stringToUint8Array(CSRF_SECRET);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const tokenData = stringToUint8Array(token);
  const signature = await crypto.subtle.sign('HMAC', key, tokenData.buffer as ArrayBuffer);

  return arrayBufferToHex(signature);
}

/**
 * Verify CSRF token signature
 */
export async function verifyCsrfToken(token: string, signature: string): Promise<boolean> {
  try {
    const expectedSignature = await signCsrfToken(token);

    // Timing-safe comparison using Web Crypto API
    const keyData = stringToUint8Array(CSRF_SECRET);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData.buffer as ArrayBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert hex signature back to Uint8Array
    const signatureArray = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const tokenData = stringToUint8Array(token);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureArray.buffer as ArrayBuffer,
      tokenData.buffer as ArrayBuffer
    );

    // Double check with string comparison as fallback
    return isValid && expectedSignature === signature;
  } catch {
    return false;
  }
}

/**
 * Create a complete CSRF token with signature
 * Format: token.signature
 */
export async function createCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  const signature = await signCsrfToken(token);
  return `${token}.${signature}`;
}

/**
 * Validate a complete CSRF token
 */
export async function validateCsrfToken(fullToken: string): Promise<boolean> {
  if (!fullToken || typeof fullToken !== 'string') {
    return false;
  }

  const parts = fullToken.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [token, signature] = parts as [string, string];
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
export async function validateCsrfFromRequest(request: NextRequest): Promise<boolean> {
  const requestToken = getCsrfTokenFromRequest(request);
  const cookieToken = getCsrfTokenFromCookies(request);

  if (!requestToken || !cookieToken) {
    return false;
  }

  // Validate both tokens individually
  const [requestValid, cookieValid] = await Promise.all([
    validateCsrfToken(requestToken),
    validateCsrfToken(cookieToken),
  ]);

  if (!requestValid || !cookieValid) {
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
export async function validateCsrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Only check state-changing methods
  if (!requiresCsrfProtection(request.method)) {
    return null;
  }

  // Skip CSRF check for certain paths (like webhook endpoints and auth endpoints)
  const path = request.nextUrl.pathname;
  const skipPaths = [
    '/api/webhooks/',
    '/api/health',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/verify',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/google',
  ];
  if (skipPaths.some((skipPath) => path.startsWith(skipPath))) {
    return null;
  }

  // Validate CSRF token
  const isValid = await validateCsrfFromRequest(request);
  if (!isValid) {
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
