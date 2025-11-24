/**
 * API Route: GET /api/admin/audit-logs/stats
 * Admin endpoint for audit log statistics and summaries
 * KAN-28: Audit Logging - Statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { AuditEventType, AuditEventStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET - Retrieve audit log statistics
 */
export async function GET(request: NextRequest) {
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

    // Check if user is admin or moderator
    if (payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin or moderator access required',
        },
        { status: 403 }
      );
    }

    // Parse query parameters for time range
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause for time range
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get statistics
    const [
      totalLogs,
      eventTypeStats,
      eventStatusStats,
      recentFailures,
      topIpAddresses,
      suspiciousActivity,
    ] = await Promise.all([
      // Total count
      prisma.auditLog.count({ where }),

      // Count by event type
      prisma.auditLog.groupBy({
        by: ['eventType'],
        where,
        _count: {
          eventType: true,
        },
        orderBy: {
          _count: {
            eventType: 'desc',
          },
        },
      }),

      // Count by event status
      prisma.auditLog.groupBy({
        by: ['eventStatus'],
        where,
        _count: {
          eventStatus: true,
        },
      }),

      // Recent failures (last 24 hours)
      prisma.auditLog.count({
        where: {
          ...where,
          eventStatus: AuditEventStatus.FAILURE,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Top IP addresses by activity
      prisma.auditLog.groupBy({
        by: ['ipAddress'],
        where,
        _count: {
          ipAddress: true,
        },
        orderBy: {
          _count: {
            ipAddress: 'desc',
          },
        },
        take: 10,
      }),

      // Suspicious activity count
      prisma.auditLog.count({
        where: {
          ...where,
          OR: [
            { eventType: AuditEventType.SUSPICIOUS_ACTIVITY },
            { eventType: AuditEventType.RATE_LIMIT_EXCEEDED },
            { eventType: AuditEventType.ACCOUNT_LOCKED },
            { eventType: AuditEventType.PERMISSION_DENIED },
          ],
        },
      }),
    ]);

    // Format event type stats
    const eventTypeBreakdown = eventTypeStats.map((stat) => ({
      eventType: stat.eventType,
      count: stat._count.eventType,
    }));

    // Format event status stats
    const eventStatusBreakdown = eventStatusStats.map((stat) => ({
      eventStatus: stat.eventStatus,
      count: stat._count.eventStatus,
    }));

    // Format top IPs
    const topIps = topIpAddresses.map((stat) => ({
      ipAddress: stat.ipAddress,
      count: stat._count.ipAddress,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            totalLogs,
            recentFailures24h: recentFailures,
            suspiciousActivityCount: suspiciousActivity,
          },
          breakdown: {
            byEventType: eventTypeBreakdown,
            byEventStatus: eventStatusBreakdown,
            topIpAddresses: topIps,
          },
          timeRange: {
            startDate: startDate || 'all',
            endDate: endDate || 'all',
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit log stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit log statistics',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
