/**
 * API Route: GET /api/admin/rate-limit-status
 * Monitor rate limit status for debugging and analytics
 * KAN-26: Enhanced Rate Limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import {
  RATE_LIMIT_CONFIGS,
  getRateLimitStatus,
  getClientIp,
} from '@/lib/security/enhanced-rate-limiter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/rate-limit-status?key=auth:login&identifier=ip:123.456.789.0
 * Check rate limit status for a specific key and identifier
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin(request);

    const { searchParams } = request.nextUrl;
    const key = searchParams.get('key');
    const identifier = searchParams.get('identifier');

    // If no parameters, return all configurations
    if (!key && !identifier) {
      return NextResponse.json(
        {
          success: true,
          data: {
            configurations: RATE_LIMIT_CONFIGS,
            availableKeys: Object.keys(RATE_LIMIT_CONFIGS),
            message: 'Rate limit configurations',
          },
        },
        { status: 200 }
      );
    }

    // Validate parameters
    if (!key || !identifier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing parameters',
          message: 'Both key and identifier are required',
        },
        { status: 400 }
      );
    }

    // Check if key exists
    if (!RATE_LIMIT_CONFIGS[key]) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid key',
          message: `Rate limit key "${key}" not found`,
          availableKeys: Object.keys(RATE_LIMIT_CONFIGS),
        },
        { status: 404 }
      );
    }

    // Get rate limit status
    const status = await getRateLimitStatus(key, identifier);
    const config = RATE_LIMIT_CONFIGS[key];

    return NextResponse.json(
      {
        success: true,
        data: {
          key,
          identifier,
          status: {
            limit: status.points,
            remaining: status.remaining,
            consumed: status.points - status.remaining,
            resetTime: status.resetTime,
            isBlocked: status.remaining === 0,
          },
          configuration: config,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin privileges required') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Admin privileges required to view rate limit status',
        },
        { status: 403 }
      );
    }

    console.error('Rate limit status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Status check failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rate-limit-status/reset
 * Reset rate limit for a specific key and identifier
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin(request);

    const body = await request.json();
    const { key, identifier } = body;

    // Validate parameters
    if (!key || !identifier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing parameters',
          message: 'Both key and identifier are required',
        },
        { status: 400 }
      );
    }

    // Check if key exists
    if (!RATE_LIMIT_CONFIGS[key]) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid key',
          message: `Rate limit key "${key}" not found`,
        },
        { status: 404 }
      );
    }

    // Reset rate limit
    const { resetRateLimit } = await import('@/lib/security/enhanced-rate-limiter');
    await resetRateLimit(key, identifier);

    return NextResponse.json(
      {
        success: true,
        message: 'Rate limit reset successfully',
        data: {
          key,
          identifier,
          resetAt: new Date(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin privileges required') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Admin privileges required to reset rate limits',
        },
        { status: 403 }
      );
    }

    console.error('Rate limit reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Reset failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
