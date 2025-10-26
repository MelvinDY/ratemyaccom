/**
 * Rate limiting utility for API routes
 * Protects against abuse and DoS attacks
 */

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';

// Default rate limiters for different endpoints
const limiters = {
  default: new RateLimiterMemory({
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900') / 1000,
  }),
  auth: new RateLimiterMemory({
    points: 5,
    duration: 60 * 15, // 5 requests per 15 minutes
    blockDuration: 60 * 60, // Block for 1 hour
  }),
  review: new RateLimiterMemory({
    points: 10,
    duration: 60 * 60, // 10 reviews per hour
  }),
  search: new RateLimiterMemory({
    points: 60,
    duration: 60, // 60 searches per minute
  }),
};

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers (Vercel sets x-forwarded-for)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  return forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
}

/**
 * Apply rate limit to request
 */
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof limiters = 'default'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const limiter = limiters[type];
  const clientId = getClientId(request);

  try {
    const rateLimitResult = await limiter.consume(clientId);

    return {
      success: true,
      limit: limiter.points,
      remaining: rateLimitResult.remainingPoints,
      reset: new Date(Date.now() + rateLimitResult.msBeforeNext),
    };
  } catch (error: unknown) {
    if (error instanceof Error && 'msBeforeNext' in error) {
      return {
        success: false,
        limit: limiter.points,
        remaining: 0,
        reset: new Date(Date.now() + error.msBeforeNext),
      };
    }

    throw error;
  }
}

/**
 * Middleware helper to check rate limit
 */
export async function checkRateLimit(
  request: NextRequest,
  type: keyof typeof limiters = 'default'
): Promise<Response | null> {
  const result = await rateLimit(request, type);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil((result.reset.getTime() - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.reset.getTime() - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': result.reset.toISOString(),
        },
      }
    );
  }

  return null;
}
