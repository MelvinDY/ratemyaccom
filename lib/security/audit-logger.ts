/**
 * Audit Logging System
 * Tracks all authentication and security events
 * KAN-28: Audit Logging
 */

import { prisma } from '@/lib/database/prisma';
import type { NextRequest } from 'next/server';
import { AuditEventType, AuditEventStatus } from '@prisma/client';

// Re-export types for convenience
export { AuditEventType, AuditEventStatus };

/**
 * Audit log entry data
 */
export interface AuditLogData {
  // Required fields
  eventType: AuditEventType;
  eventAction: string;
  eventStatus: AuditEventStatus;
  ipAddress: string;

  // Optional user information
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;

  // Optional request information
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;

  // Optional context and messages
  metadata?: Record<string, any>;
  message?: string;
  errorMessage?: string;
}

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  return request.ip || 'unknown';
}

/**
 * Extract user agent from request
 */
function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Main audit logging function
 * Creates an audit log entry in the database
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        eventType: data.eventType,
        eventAction: data.eventAction,
        eventStatus: data.eventStatus,
        ipAddress: data.ipAddress,
        ...(data.userId ? { userId: data.userId } : {}),
        ...(data.userEmail ? { userEmail: data.userEmail } : {}),
        ...(data.userName ? { userName: data.userName } : {}),
        ...(data.userRole ? { userRole: data.userRole } : {}),
        ...(data.userAgent ? { userAgent: data.userAgent } : {}),
        ...(data.requestPath ? { requestPath: data.requestPath } : {}),
        ...(data.requestMethod ? { requestMethod: data.requestMethod } : {}),
        ...(data.metadata ? { metadata: data.metadata } : {}),
        ...(data.message ? { message: data.message } : {}),
        ...(data.errorMessage ? { errorMessage: data.errorMessage } : {}),
      },
    });
  } catch (error) {
    // Log to console but don't throw - audit logging should never break the app
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper function to log audit event from a request
 */
export async function logAuditEventFromRequest(
  request: NextRequest,
  data: Omit<AuditLogData, 'ipAddress' | 'userAgent' | 'requestPath' | 'requestMethod'>
): Promise<void> {
  await logAuditEvent({
    ...data,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    requestPath: request.nextUrl.pathname,
    requestMethod: request.method,
  });
}

// ============================================
// AUTHENTICATION EVENT LOGGERS
// ============================================

/**
 * Log successful login
 */
export async function logLoginSuccess(
  request: NextRequest,
  user: { id: string; email: string; name: string; role: string }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.AUTH_LOGIN,
    eventAction: 'success',
    eventStatus: AuditEventStatus.SUCCESS,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    message: `User ${user.email} logged in successfully`,
  });
}

/**
 * Log failed login attempt
 */
export async function logLoginFailure(
  request: NextRequest,
  email: string,
  reason: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.AUTH_LOGIN,
    eventAction: 'failure',
    eventStatus: AuditEventStatus.FAILURE,
    userEmail: email,
    message: `Failed login attempt for ${email}`,
    errorMessage: reason,
    ...(metadata ? { metadata } : {}),
  });
}

/**
 * Log user registration
 */
export async function logRegistration(
  request: NextRequest,
  user: { id: string; email: string; name: string; university?: string | null }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.AUTH_REGISTER,
    eventAction: 'success',
    eventStatus: AuditEventStatus.SUCCESS,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: `New user registered: ${user.email}`,
    metadata: {
      university: user.university,
    },
  });
}

/**
 * Log email verification
 */
export async function logEmailVerification(
  request: NextRequest,
  user: { id: string; email: string; name: string }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.AUTH_VERIFY_EMAIL,
    eventAction: 'success',
    eventStatus: AuditEventStatus.SUCCESS,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: `Email verified for ${user.email}`,
  });
}

/**
 * Log logout
 */
export async function logLogout(
  request: NextRequest,
  user: { id: string; email: string; name: string }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.AUTH_LOGOUT,
    eventAction: 'success',
    eventStatus: AuditEventStatus.SUCCESS,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: `User ${user.email} logged out`,
  });
}

// ============================================
// ACCOUNT SECURITY EVENT LOGGERS
// ============================================

/**
 * Log account locked
 */
export async function logAccountLocked(
  ipAddress: string,
  user: { id: string; email: string; name: string },
  lockedUntil: Date,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: AuditEventType.ACCOUNT_LOCKED,
    eventAction: 'locked',
    eventStatus: AuditEventStatus.WARNING,
    ipAddress,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: `Account locked due to failed login attempts until ${lockedUntil.toISOString()}`,
    metadata: {
      lockedUntil: lockedUntil.toISOString(),
      ...metadata,
    },
  });
}

/**
 * Log account unlocked (by admin or automatic)
 */
export async function logAccountUnlocked(
  ipAddress: string,
  user: { id: string; email: string; name: string },
  unlockedBy?: { id: string; email: string; name: string },
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: AuditEventType.ACCOUNT_UNLOCKED,
    eventAction: 'unlocked',
    eventStatus: AuditEventStatus.INFO,
    ipAddress,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: unlockedBy
      ? `Account unlocked by admin ${unlockedBy.email}`
      : 'Account unlocked automatically',
    metadata: {
      unlockedBy: unlockedBy?.email,
      ...metadata,
    },
  });
}

/**
 * Log password change
 */
export async function logPasswordChange(
  request: NextRequest,
  user: { id: string; email: string; name: string }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.PASSWORD_CHANGED,
    eventAction: 'updated',
    eventStatus: AuditEventStatus.INFO,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: `Password changed for ${user.email}`,
  });
}

// ============================================
// AUTHORIZATION EVENT LOGGERS
// ============================================

/**
 * Log permission denied
 */
export async function logPermissionDenied(
  request: NextRequest,
  reason: string,
  user?: { id: string; email: string; name: string; role: string }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.PERMISSION_DENIED,
    eventAction: 'denied',
    eventStatus: AuditEventStatus.WARNING,
    ...(user?.id ? { userId: user.id } : {}),
    ...(user?.email ? { userEmail: user.email } : {}),
    ...(user?.name ? { userName: user.name } : {}),
    ...(user?.role ? { userRole: user.role } : {}),
    message: `Permission denied: ${reason}`,
    errorMessage: reason,
  });
}

// ============================================
// ADMIN ACTION LOGGERS
// ============================================

/**
 * Log admin action
 */
export async function logAdminAction(
  request: NextRequest,
  admin: { id: string; email: string; name: string; role: string },
  action: string,
  targetUser?: { id: string; email: string },
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.ADMIN_ACTION,
    eventAction: action,
    eventStatus: AuditEventStatus.INFO,
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.name,
    userRole: admin.role,
    message: `Admin ${admin.email} performed action: ${action}${targetUser ? ` on user ${targetUser.email}` : ''}`,
    metadata: {
      targetUserId: targetUser?.id,
      targetUserEmail: targetUser?.email,
      ...metadata,
    },
  });
}

// ============================================
// SECURITY EVENT LOGGERS
// ============================================

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  request: NextRequest,
  rateLimitKey: string,
  user?: { id: string; email: string }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
    eventAction: 'blocked',
    eventStatus: AuditEventStatus.WARNING,
    ...(user?.id ? { userId: user.id } : {}),
    ...(user?.email ? { userEmail: user.email } : {}),
    message: `Rate limit exceeded for ${rateLimitKey}`,
    metadata: {
      rateLimitKey,
    },
  });
}

/**
 * Log CSRF validation failure
 */
export async function logCsrfFailure(request: NextRequest): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.CSRF_VALIDATION_FAILED,
    eventAction: 'blocked',
    eventStatus: AuditEventStatus.WARNING,
    message: 'CSRF validation failed',
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  request: NextRequest,
  reason: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
    eventAction: 'detected',
    eventStatus: AuditEventStatus.WARNING,
    message: `Suspicious activity detected: ${reason}`,
    ...(metadata ? { metadata } : {}),
  });
}

// ============================================
// DATA OPERATION LOGGERS
// ============================================

/**
 * Log review creation
 */
export async function logReviewCreated(
  request: NextRequest,
  user: { id: string; email: string; name: string },
  accommodationId: string
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.REVIEW_CREATED,
    eventAction: 'created',
    eventStatus: AuditEventStatus.INFO,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: `Review created by ${user.email} for accommodation ${accommodationId}`,
    metadata: {
      accommodationId,
    },
  });
}

/**
 * Log review update
 */
export async function logReviewUpdated(
  request: NextRequest,
  user: { id: string; email: string; name: string },
  reviewId: string
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.REVIEW_UPDATED,
    eventAction: 'updated',
    eventStatus: AuditEventStatus.INFO,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: `Review ${reviewId} updated by ${user.email}`,
    metadata: {
      reviewId,
    },
  });
}

/**
 * Log review deletion
 */
export async function logReviewDeleted(
  request: NextRequest,
  user: { id: string; email: string; name: string },
  reviewId: string,
  deletedBy?: { id: string; email: string; role: string }
): Promise<void> {
  await logAuditEventFromRequest(request, {
    eventType: AuditEventType.REVIEW_DELETED,
    eventAction: 'deleted',
    eventStatus: AuditEventStatus.INFO,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    message: deletedBy
      ? `Review ${reviewId} deleted by admin ${deletedBy.email}`
      : `Review ${reviewId} deleted by owner ${user.email}`,
    metadata: {
      reviewId,
      deletedBy: deletedBy?.email,
      deletedByRole: deletedBy?.role,
    },
  });
}
