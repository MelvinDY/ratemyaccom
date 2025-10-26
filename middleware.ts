import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security/headers';
import { rateLimit, rateLimitHeaders } from '@/lib/security/rate-limiter';

/**
 * Middleware to apply security measures globally
 */
export async function middleware(request: NextRequest) {
  // Create response
  let response = NextResponse.next();

  // Apply security headers
  response = applySecurityHeaders(response);

  // Determine rate limit type based on path
  let rateLimitType: 'auth' | 'review' | 'search' | 'api' = 'api';

  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    rateLimitType = 'auth';
  } else if (request.nextUrl.pathname.startsWith('/api/reviews')) {
    rateLimitType = 'review';
  } else if (request.nextUrl.pathname.startsWith('/api/search')) {
    rateLimitType = 'search';
  }

  // Apply rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResult = await rateLimit(request, rateLimitType);

    // Add rate limit headers
    const headers = rateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Block request if rate limit exceeded
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: rateLimitResult.error,
          retryAfter: rateLimitResult.resetTime,
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
