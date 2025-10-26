import type { NextResponse } from 'next/server';

/**
 * Security headers configuration
 * These headers help protect against common web vulnerabilities
 */
export const securityHeaders = {
  // Prevents clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevents MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enables XSS filter in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Controls how much referrer information is sent
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Enforces HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Controls which features and APIs can be used
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  // Content Security Policy - prevents XSS and other injection attacks
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live", // Vercel Analytics + Next.js dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind + Google Fonts
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: https://vitals.vercel-insights.com https://vercel.live", // Vercel Analytics
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Apply security headers to a response
 */
export const applySecurityHeaders = (response: NextResponse): NextResponse => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

/**
 * CORS headers for API routes
 */
export const corsHeaders = (origin?: string) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
};

/**
 * Cache control headers for different content types
 */
export const cacheHeaders = {
  // Static assets - long cache
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  // API responses - no cache
  api: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
  // Dynamic pages - short cache with revalidation
  page: {
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  },
};
