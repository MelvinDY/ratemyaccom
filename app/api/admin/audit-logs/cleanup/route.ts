/**
 * API Route: POST /api/admin/audit-logs/cleanup
 * Admin endpoint for cleaning up old audit logs (retention policy)
 * KAN-28: Audit Logging - Cleanup/Retention
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { logAdminAction } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic';

interface CleanupRequest {
  olderThanDays: number; // Delete logs older than this many days
  eventTypes?: string[]; // Optional: Only delete specific event types
}

/**
 * POST - Delete old audit logs based on retention policy
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
          message: 'Invalid or expired authentication token',
        },
        { status: 401 }
      );
    }

    // Check if user is admin (only admins can delete logs)
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: CleanupRequest = await request.json();
    const { olderThanDays, eventTypes } = body;

    // Validate input
    if (!olderThanDays || olderThanDays < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: 'olderThanDays must be at least 1',
        },
        { status: 400 }
      );
    }

    // Prevent accidental deletion of recent logs
    if (olderThanDays < 7) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: 'Retention period must be at least 7 days for safety',
        },
        { status: 400 }
      );
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Build where clause
    const where: any = {
      createdAt: {
        lt: cutoffDate,
      },
    };

    if (eventTypes && eventTypes.length > 0) {
      where.eventType = {
        in: eventTypes,
      };
    }

    // Count logs to be deleted (for logging)
    const countToDelete = await prisma.auditLog.count({ where });

    if (countToDelete === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No logs found matching cleanup criteria',
          data: {
            deletedCount: 0,
            cutoffDate: cutoffDate.toISOString(),
          },
        },
        { status: 200 }
      );
    }

    // Delete old audit logs
    const result = await prisma.auditLog.deleteMany({
      where,
    });

    // Log this admin action
    await logAdminAction(
      request,
      {
        id: payload.userId,
        email: payload.email,
        name: payload.email.split('@')[0],
        role: payload.role,
      },
      'cleanup_audit_logs',
      undefined,
      {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
        olderThanDays,
        eventTypes: eventTypes || 'all',
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully deleted ${result.count} audit log(s)`,
        data: {
          deletedCount: result.count,
          cutoffDate: cutoffDate.toISOString(),
          olderThanDays,
          eventTypes: eventTypes || 'all',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit log cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup audit logs',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
