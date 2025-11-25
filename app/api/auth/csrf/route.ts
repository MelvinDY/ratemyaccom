/**
 * API Route: GET /api/auth/csrf
 * Get CSRF token for client-side requests
 * KAN-27: CSRF Protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCsrfToken, setCsrfCookie } from '@/lib/auth/csrf';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/csrf
 * Returns a CSRF token and sets it as a cookie
 * This endpoint should be called before making any state-changing requests
 */
export async function GET(_request: NextRequest) {
  try {
    // Generate new CSRF token
    const csrfToken = await createCsrfToken();

    // Create response with token
    const response = NextResponse.json(
      {
        success: true,
        data: {
          csrfToken,
        },
      },
      { status: 200 }
    );

    // Set CSRF token as cookie
    setCsrfCookie(response, csrfToken);

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CSRF token',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
