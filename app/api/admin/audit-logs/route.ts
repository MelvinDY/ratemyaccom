/**
 * API Route: GET /api/admin/audit-logs
 * Admin endpoint for viewing audit logs with filtering and pagination
 * KAN-28: Audit Logging - Admin Interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { AuditEventType, AuditEventStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET - Retrieve audit logs with filtering and pagination
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Filters
    const eventType = searchParams.get('eventType') as AuditEventType | null;
    const eventStatus = searchParams.get('eventStatus') as AuditEventStatus | null;
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const ipAddress = searchParams.get('ipAddress');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (eventStatus) {
      where.eventStatus = eventStatus;
    }

    if (userId) {
      where.userId = userId;
    }

    if (userEmail) {
      where.userEmail = {
        contains: userEmail,
        mode: 'insensitive',
      };
    }

    if (ipAddress) {
      where.ipAddress = ipAddress;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Fetch logs with pagination
    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        success: true,
        data: {
          logs,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasNextPage,
            hasPrevPage,
          },
          filters: {
            eventType,
            eventStatus,
            userId,
            userEmail,
            ipAddress,
            startDate,
            endDate,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit logs',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
