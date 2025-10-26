import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const CSRF_SECRET = new TextEncoder().encode(
  process.env.CSRF_SECRET || 'your-csrf-secret-change-in-production'
);
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_TOKEN_EXPIRY = 60 * 60; // 1 hour

/**
 * Generate a CSRF token
 */
export const generateCsrfToken = async (): Promise<string> => {
  const token = await new SignJWT({
    type: 'csrf',
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${CSRF_TOKEN_EXPIRY}s`)
    .setIssuedAt()
    .sign(CSRF_SECRET);

  return token;
};

/**
 * Verify a CSRF token
 */
export const verifyCsrfToken = async (token: string): Promise<boolean> => {
  try {
    const { payload } = await jwtVerify(token, CSRF_SECRET);

    // Verify token type
    if (payload.type !== 'csrf') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('CSRF token verification failed:', error);
    return false;
  }
};

/**
 * Get CSRF token from cookies
 */
export const getCsrfToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_COOKIE_NAME);
  return token?.value || null;
};

/**
 * Set CSRF token in cookies
 */
export const setCsrfToken = async (): Promise<string> => {
  const token = await generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/',
  });

  return token;
};

/**
 * Validate CSRF token from request headers
 */
export const validateCsrfToken = async (headerToken: string | null): Promise<boolean> => {
  if (!headerToken) {
    return false;
  }

  const cookieToken = await getCsrfToken();

  if (!cookieToken) {
    return false;
  }

  // Verify both tokens match
  if (headerToken !== cookieToken) {
    return false;
  }

  // Verify token is valid
  return await verifyCsrfToken(headerToken);
};

/**
 * CSRF middleware for API routes
 */
export const csrfProtection = async (request: Request): Promise<boolean> => {
  // Skip CSRF check for GET, HEAD, OPTIONS
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // Get token from header
  const headerToken = request.headers.get('X-CSRF-Token');

  // Validate token
  return await validateCsrfToken(headerToken);
};
