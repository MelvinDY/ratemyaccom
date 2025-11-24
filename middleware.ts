import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security/headers';
import {
  applyRateLimit,
  getRateLimitHeaders,
} from '@/lib/security/enhanced-rate-limiter';
import {
  createCsrfToken,
  setCsrfCookie,
  validateCsrfMiddleware,
  getCsrfTokenFromCookies,
} from '@/lib/auth/csrf';

/**
 * Middleware to apply security measures globally
 */
export async function middleware(request: NextRequest) {
  // Validate CSRF for API routes (state-changing methods only)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const csrfError = validateCsrfMiddleware(request);
    if (csrfError) {
      return csrfError;
    }
  }

  // Create response
  let response = NextResponse.next();

  // Apply security headers
  response = applySecurityHeaders(response);

  // Set CSRF token cookie if not present or for all page requests
  // This ensures the client always has a valid CSRF token
  if (!request.nextUrl.pathname.startsWith('/api')) {
    const existingToken = getCsrfTokenFromCookies(request);
    if (!existingToken) {
      const newToken = createCsrfToken();
      setCsrfCookie(response, newToken);
    }
  }

  // Apply enhanced rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Skip rate limiting for health check
    if (request.nextUrl.pathname === '/api/health') {
      return response;
    }

    // Apply rate limit (with automatic route detection and admin bypass)
    const rateLimitResult = await applyRateLimit(request);

    // Add rate limit headers to response
    const headers = getRateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Block request if rate limit exceeded
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too many requests',
          message: rateLimitResult.error || 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );
    }
  }

  return response;
}

/**
 * Configure middleware to run on specific paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
