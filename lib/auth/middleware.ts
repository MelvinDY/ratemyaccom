/**
 * Authentication Middleware
 * Provides authentication and authorization utilities for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { prisma } from '@/lib/database/prisma';
import {
  validateCsrfFromRequest,
  requiresCsrfProtection,
  createCsrfErrorResponse,
} from './csrf';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract JWT token from request
 * Checks Authorization header and cookies
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Authenticate request and return user payload
 * Returns null if authentication fails
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  // Optionally verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return null;
  }

  return payload;
}

/**
 * Require authentication
 * Throws error if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const user = await authenticateRequest(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require verified account
 */
export async function requireVerified(request: NextRequest): Promise<JWTPayload> {
  const user = await requireAuth(request);

  if (!user.verified) {
    throw new Error('Email verification required');
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(request: NextRequest): Promise<JWTPayload> {
  const user = await requireAuth(request);

  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Admin privileges required');
  }

  return user;
}

/**
 * Check if user owns resource
 */
export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string
): Promise<JWTPayload> {
  const user = await requireAuth(request);

  if (user.userId !== resourceUserId && user.role !== 'ADMIN') {
    throw new Error('Permission denied');
  }

  return user;
}

/**
 * Require CSRF token validation
 * Returns error response if CSRF validation fails
 */
export function requireCsrf(request: NextRequest): NextResponse | null {
  // Only validate for state-changing methods
  if (!requiresCsrfProtection(request.method)) {
    return null;
  }

  // Validate CSRF token
  if (!validateCsrfFromRequest(request)) {
    return createCsrfErrorResponse();
  }

  return null;
}

/**
 * Combined middleware: Require both authentication and CSRF validation
 * Use this for protected routes that modify data
 */
export async function requireAuthAndCsrf(
  request: NextRequest
): Promise<{ user: JWTPayload; error: NextResponse | null }> {
  // Check CSRF first
  const csrfError = requireCsrf(request);
  if (csrfError) {
    throw new Error('CSRF validation failed');
  }

  // Then check authentication
  const user = await requireAuth(request);

  return { user, error: null };
}

/**
 * Combined middleware: Require authentication, verification, and CSRF
 */
export async function requireVerifiedAndCsrf(
  request: NextRequest
): Promise<{ user: JWTPayload; error: NextResponse | null }> {
  // Check CSRF first
  const csrfError = requireCsrf(request);
  if (csrfError) {
    throw new Error('CSRF validation failed');
  }

  // Then check authentication and verification
  const user = await requireVerified(request);

  return { user, error: null };
}
