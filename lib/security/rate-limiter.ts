import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { NextRequest } from 'next/server';

/**
 * Rate limiter configuration for different endpoints
 */
const rateLimiterConfigs = {
  // Authentication endpoints - strict limits
  auth: {
    points: 5, // Number of requests
    duration: 60 * 15, // Per 15 minutes
    blockDuration: 60 * 30, // Block for 30 minutes if exceeded
  },
  // Review submission - prevent spam
  review: {
    points: 3, // 3 reviews
    duration: 60 * 60 * 24, // Per day
    blockDuration: 60 * 60 * 24, // Block for 24 hours if exceeded
  },
  // Search endpoints - moderate limits
  search: {
    points: 60, // 60 requests
    duration: 60, // Per minute
    blockDuration: 60 * 5, // Block for 5 minutes if exceeded
  },
  // General API - lenient limits
  api: {
    points: 100, // 100 requests
    duration: 60, // Per minute
    blockDuration: 60 * 2, // Block for 2 minutes if exceeded
  },
};

/**
 * In-memory rate limiters for different endpoint types
 * In production, replace with Redis-based rate limiters
 */
export const rateLimiters = {
  auth: new RateLimiterMemory({
    keyPrefix: 'auth',
    ...rateLimiterConfigs.auth,
  }),
  review: new RateLimiterMemory({
    keyPrefix: 'review',
    ...rateLimiterConfigs.review,
  }),
  search: new RateLimiterMemory({
    keyPrefix: 'search',
    ...rateLimiterConfigs.search,
  }),
  api: new RateLimiterMemory({
    keyPrefix: 'api',
    ...rateLimiterConfigs.api,
  }),
};

/**
 * Get client IP address from request
 */
export const getClientIp = (request: NextRequest): string => {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to direct connection IP
  return request.ip || 'unknown';
};

/**
 * Rate limit middleware wrapper
 */
export const rateLimit = async (
  request: NextRequest,
  type: keyof typeof rateLimiters = 'api'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  error?: string;
}> => {
  const limiter = rateLimiters[type];
  const ip = getClientIp(request);
  const key = `${type}:${ip}`;

  try {
    const result = await limiter.consume(key, 1);

    return {
      success: true,
      limit: rateLimiterConfigs[type].points,
      remaining: result.remainingPoints,
      resetTime: new Date(Date.now() + result.msBeforeNext),
    };
  } catch (error) {
    if (error instanceof Error && 'msBeforeNext' in error) {
      const rateLimitError = error as { msBeforeNext: number };
      return {
        success: false,
        limit: rateLimiterConfigs[type].points,
        remaining: 0,
        resetTime: new Date(Date.now() + rateLimitError.msBeforeNext),
        error: 'Too many requests. Please try again later.',
      };
    }

    return {
      success: false,
      limit: rateLimiterConfigs[type].points,
      remaining: 0,
      resetTime: new Date(),
      error: 'Rate limiting error',
    };
  }
};

/**
 * Rate limit response headers
 */
export const rateLimitHeaders = (result: Awaited<ReturnType<typeof rateLimit>>) => {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toISOString(),
  };
};
