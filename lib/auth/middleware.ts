/**
 * Authentication Middleware
 * Provides authentication and authorization utilities for API routes
 */

import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { prisma } from '@/lib/database/prisma';

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
