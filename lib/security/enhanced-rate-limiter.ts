/**
 * Enhanced Rate Limiter
 * Per-route rate limiting with IP and user-based tracking
 * KAN-26: Enhanced Rate Limiting
 */

import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import type { NextRequest } from 'next/server';

// ============================================
// CONFIGURATION
// ============================================

export interface RateLimitConfig {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  blockDuration: number; // Block duration in seconds if exceeded
  keyPrefix: string; // Prefix for rate limit keys
}

/**
 * Per-route rate limit configurations
 * More granular than the basic implementation
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  'auth:login': {
    points: 5,
    duration: 15 * 60, // 15 minutes
    blockDuration: 30 * 60, // 30 minutes
    keyPrefix: 'rl:login',
  },
  'auth:register': {
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 24 * 60 * 60, // 24 hours
    keyPrefix: 'rl:register',
  },
  'auth:verify': {
    points: 10,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
    keyPrefix: 'rl:verify',
  },
  'auth:forgot-password': {
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
    keyPrefix: 'rl:forgot-pw',
  },
  'auth:reset-password': {
    points: 5,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
    keyPrefix: 'rl:reset-pw',
  },
  'auth:refresh': {
    points: 20,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:refresh',
  },

  // Review endpoints
  'review:create': {
    points: 3,
    duration: 24 * 60 * 60, // 24 hours
    blockDuration: 24 * 60 * 60, // 24 hours
    keyPrefix: 'rl:review-create',
  },
  'review:update': {
    points: 10,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
    keyPrefix: 'rl:review-update',
  },
  'review:delete': {
    points: 5,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
    keyPrefix: 'rl:review-delete',
  },
  'review:list': {
    points: 100,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:review-list',
  },

  // Accommodation endpoints
  'accommodation:list': {
    points: 60,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:accom-list',
  },
  'accommodation:detail': {
    points: 120,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:accom-detail',
  },
  'accommodation:search': {
    points: 60,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:accom-search',
  },

  // Admin endpoints - less restrictive but still protected
  'admin:unlock': {
    points: 20,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:admin-unlock',
  },
  'admin:moderate': {
    points: 50,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:admin-moderate',
  },

  // General API fallback
  'api:default': {
    points: 100,
    duration: 60, // 1 minute
    blockDuration: 2 * 60, // 2 minutes
    keyPrefix: 'rl:api',
  },
};

// ============================================
// RATE LIMITERS
// ============================================

/**
 * Create rate limiters for all configured routes
 */
const rateLimiters: Record<string, RateLimiterMemory> = {};

for (const [key, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
  rateLimiters[key] = new RateLimiterMemory({
    keyPrefix: config.keyPrefix,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration,
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Try x-forwarded-for (behind proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  // Try x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Try Cloudflare CF-Connecting-IP
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // Fallback to direct connection IP
  return request.ip || 'unknown';
}

/**
 * Get user ID from request (if authenticated)
 */
export function getUserId(request: NextRequest): string | null {
  // Try to get from auth token cookie
  const authToken = request.cookies.get('auth-token')?.value;
  if (!authToken) {
    return null;
  }

  try {
    // Decode JWT without verification (just to get userId)
    // We only need the userId for rate limiting, not security
    const payload = JSON.parse(
      Buffer.from(authToken.split('.')[1], 'base64').toString()
    );
    return payload.userId || null;
  } catch {
    return null;
  }
}

/**
 * Check if user is admin (bypass rate limits)
 */
export function isAdmin(request: NextRequest): boolean {
  const authToken = request.cookies.get('auth-token')?.value;
  if (!authToken) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(authToken.split('.')[1], 'base64').toString()
    );
    return payload.role === 'ADMIN' || payload.role === 'MODERATOR';
  } catch {
    return false;
  }
}

/**
 * Map request path to rate limit configuration key
 */
export function getRateLimitKey(request: NextRequest): string {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Auth endpoints
  if (path.includes('/api/auth/login')) return 'auth:login';
  if (path.includes('/api/auth/register')) return 'auth:register';
  if (path.includes('/api/auth/verify')) return 'auth:verify';
  if (path.includes('/api/auth/forgot-password')) return 'auth:forgot-password';
  if (path.includes('/api/auth/reset-password')) return 'auth:reset-password';
  if (path.includes('/api/auth/refresh')) return 'auth:refresh';

  // Review endpoints
  if (path.includes('/api/reviews')) {
    if (method === 'POST') return 'review:create';
    if (method === 'PUT' || method === 'PATCH') return 'review:update';
    if (method === 'DELETE') return 'review:delete';
    return 'review:list';
  }

  // Accommodation endpoints
  if (path.includes('/api/accommodations')) {
    if (path.includes('/search')) return 'accommodation:search';
    if (path.match(/\/api\/accommodations\/[^/]+$/)) return 'accommodation:detail';
    return 'accommodation:list';
  }

  // Admin endpoints
  if (path.includes('/api/admin/unlock')) return 'admin:unlock';
  if (path.includes('/api/admin')) return 'admin:moderate';

  // Default fallback
  return 'api:default';
}

// ============================================
// RATE LIMITING FUNCTIONS
// ============================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds until retry
  error?: string;
  key?: string; // Rate limit key used
}

/**
 * Apply rate limiting to a request
 * Supports both IP-based and user-based rate limiting
 */
export async function applyRateLimit(
  request: NextRequest,
  options: {
    routeKey?: string; // Override auto-detection
    skipAdminCheck?: boolean; // Skip admin bypass
    useUserBasedLimit?: boolean; // Use user ID instead of IP
  } = {}
): Promise<RateLimitResult> {
  const { routeKey: overrideKey, skipAdminCheck = false, useUserBasedLimit = false } = options;

  // Check if admin (bypass rate limits)
  if (!skipAdminCheck && isAdmin(request)) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      resetTime: new Date(Date.now() + 60000),
      key: 'admin:bypass',
    };
  }

  // Determine rate limit configuration
  const rateLimitKey = overrideKey || getRateLimitKey(request);
  const config = RATE_LIMIT_CONFIGS[rateLimitKey] || RATE_LIMIT_CONFIGS['api:default'];
  const limiter = rateLimiters[rateLimitKey] || rateLimiters['api:default'];

  // Determine identifier (IP or user ID)
  let identifier: string;
  if (useUserBasedLimit) {
    const userId = getUserId(request);
    identifier = userId ? `user:${userId}` : `ip:${getClientIp(request)}`;
  } else {
    identifier = `ip:${getClientIp(request)}`;
  }

  const key = `${rateLimitKey}:${identifier}`;

  try {
    const result: RateLimiterRes = await limiter.consume(key, 1);

    return {
      success: true,
      limit: config.points,
      remaining: result.remainingPoints,
      resetTime: new Date(Date.now() + result.msBeforeNext),
      key,
    };
  } catch (error) {
    if (error instanceof Error && 'msBeforeNext' in error) {
      const rateLimitError = error as RateLimiterRes;
      const retryAfter = Math.ceil(rateLimitError.msBeforeNext / 1000);

      return {
        success: false,
        limit: config.points,
        remaining: 0,
        resetTime: new Date(Date.now() + rateLimitError.msBeforeNext),
        retryAfter,
        error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        key,
      };
    }

    return {
      success: false,
      limit: config.points,
      remaining: 0,
      resetTime: new Date(),
      error: 'Rate limiting error',
      key,
    };
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toISOString(),
  };

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export async function resetRateLimit(
  rateLimitKey: string,
  identifier: string
): Promise<void> {
  const limiter = rateLimiters[rateLimitKey];
  if (limiter) {
    const key = `${rateLimitKey}:${identifier}`;
    await limiter.delete(key);
  }
}

/**
 * Get current rate limit status without consuming
 */
export async function getRateLimitStatus(
  rateLimitKey: string,
  identifier: string
): Promise<{
  points: number;
  remaining: number;
  resetTime: Date;
}> {
  const limiter = rateLimiters[rateLimitKey];
  const config = RATE_LIMIT_CONFIGS[rateLimitKey] || RATE_LIMIT_CONFIGS['api:default'];

  if (!limiter) {
    return {
      points: config.points,
      remaining: config.points,
      resetTime: new Date(Date.now() + config.duration * 1000),
    };
  }

  try {
    const key = `${rateLimitKey}:${identifier}`;
    const res = await limiter.get(key);

    if (!res) {
      return {
        points: config.points,
        remaining: config.points,
        resetTime: new Date(Date.now() + config.duration * 1000),
      };
    }

    return {
      points: config.points,
      remaining: res.remainingPoints,
      resetTime: new Date(Date.now() + res.msBeforeNext),
    };
  } catch {
    return {
      points: config.points,
      remaining: config.points,
      resetTime: new Date(Date.now() + config.duration * 1000),
    };
  }
}
