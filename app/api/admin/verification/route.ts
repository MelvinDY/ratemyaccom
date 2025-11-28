/**
 * Admin API: Accommodation Data Verification
 *
 * GET /api/admin/verification - Get verification status report
 * POST /api/admin/verification - Mark accommodation(s) as verified
 *
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

// Configuration
const VERIFICATION_STALE_DAYS = 90;
const VERIFICATION_WARNING_DAYS = 60;

type VerificationStatus = 'verified' | 'stale' | 'warning' | 'never_verified' | 'needs_manual';

interface VerificationResult {
  id: string;
  name: string;
  slug: string;
  university: string;
  sourceUrl: string | null;
  lastVerified: string | null;
  status: VerificationStatus;
  daysSinceVerification: number | null;
  priceRange: string;
}

interface VerificationReport {
  generatedAt: string;
  config: {
    staleDays: number;
    warningDays: number;
  };
  summary: {
    total: number;
    verified: number;
    stale: number;
    warning: number;
    neverVerified: number;
    needsManual: number;
    healthScore: number;
  };
  accommodations: VerificationResult[];
}

function getVerificationStatus(
  lastVerified: Date | null,
  sourceUrl: string | null
): { status: VerificationStatus; daysSinceVerification: number | null } {
  if (!lastVerified) {
    if (sourceUrl) {
      return { status: 'needs_manual', daysSinceVerification: null };
    }
    return { status: 'never_verified', daysSinceVerification: null };
  }

  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince > VERIFICATION_STALE_DAYS) {
    return { status: 'stale', daysSinceVerification: daysSince };
  }

  if (daysSince > VERIFICATION_WARNING_DAYS) {
    return { status: 'warning', daysSinceVerification: daysSince };
  }

  return { status: 'verified', daysSinceVerification: daysSince };
}

/**
 * GET /api/admin/verification
 *
 * Query params:
 * - status: Filter by status (verified, stale, warning, never_verified, needs_manual)
 * - university: Filter by university name
 * - format: 'summary' for just summary stats, 'full' for complete report (default)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication (simplified - in production use proper auth)
    // const session = await getServerSession();
    // if (!session?.user?.role === 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as VerificationStatus | null;
    const universityFilter = searchParams.get('university');
    const format = searchParams.get('format') || 'full';

    // Build where clause
    const where: Record<string, unknown> = {};
    if (universityFilter) {
      where.university = { contains: universityFilter, mode: 'insensitive' };
    }

    const accommodations = await prisma.accommodation.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        university: true,
        sourceUrl: true,
        lastVerified: true,
        priceMin: true,
        priceMax: true,
        currency: true,
        pricePeriod: true,
      },
      orderBy: [{ university: 'asc' }, { name: 'asc' }],
    });

    const results: VerificationResult[] = [];
    const summary = {
      total: 0,
      verified: 0,
      stale: 0,
      warning: 0,
      neverVerified: 0,
      needsManual: 0,
      healthScore: 0,
    };

    for (const accom of accommodations) {
      const { status, daysSinceVerification } = getVerificationStatus(
        accom.lastVerified,
        accom.sourceUrl
      );

      // Apply status filter if provided
      if (statusFilter && status !== statusFilter) {
        continue;
      }

      summary.total++;

      switch (status) {
        case 'verified':
          summary.verified++;
          break;
        case 'stale':
          summary.stale++;
          break;
        case 'warning':
          summary.warning++;
          break;
        case 'never_verified':
          summary.neverVerified++;
          break;
        case 'needs_manual':
          summary.needsManual++;
          break;
      }

      results.push({
        id: accom.id,
        name: accom.name,
        slug: accom.slug,
        university: accom.university,
        sourceUrl: accom.sourceUrl,
        lastVerified: accom.lastVerified?.toISOString() || null,
        status,
        daysSinceVerification,
        priceRange: `${accom.currency} ${accom.priceMin}-${accom.priceMax}/${accom.pricePeriod.toLowerCase()}`,
      });
    }

    // Calculate health score
    summary.healthScore =
      summary.total > 0
        ? Math.round(((summary.verified + summary.warning) / summary.total) * 100)
        : 100;

    const report: VerificationReport = {
      generatedAt: new Date().toISOString(),
      config: {
        staleDays: VERIFICATION_STALE_DAYS,
        warningDays: VERIFICATION_WARNING_DAYS,
      },
      summary,
      accommodations: format === 'summary' ? [] : results,
    };

    return NextResponse.json(report);
  } catch (_error) {
    console.error('Verification report error:', _error);
    return NextResponse.json({ error: 'Failed to generate verification report' }, { status: 500 });
  }
}

/**
 * POST /api/admin/verification
 *
 * Body:
 * - accommodationIds: string[] - Array of accommodation IDs or slugs to mark as verified
 * - sourceUrl?: string - Optional source URL to update
 * - priceMin?: number - Optional updated minimum price
 * - priceMax?: number - Optional updated maximum price
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication (simplified - in production use proper auth)
    // const session = await getServerSession();
    // if (!session?.user?.role === 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { accommodationIds, sourceUrl, priceMin, priceMax } = body;

    if (!accommodationIds || !Array.isArray(accommodationIds) || accommodationIds.length === 0) {
      return NextResponse.json({ error: 'accommodationIds array is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      lastVerified: new Date(),
    };

    if (sourceUrl !== undefined) {
      updateData.sourceUrl = sourceUrl;
    }

    if (priceMin !== undefined) {
      updateData.priceMin = priceMin;
    }

    if (priceMax !== undefined) {
      updateData.priceMax = priceMax;
    }

    const results = [];

    for (const idOrSlug of accommodationIds) {
      // Find accommodation by ID or slug
      const accommodation = await prisma.accommodation.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
      });

      if (!accommodation) {
        results.push({
          input: idOrSlug,
          success: false,
          error: 'Not found',
        });
        continue;
      }

      // Update the accommodation
      await prisma.accommodation.update({
        where: { id: accommodation.id },
        data: updateData,
      });

      results.push({
        input: idOrSlug,
        id: accommodation.id,
        name: accommodation.name,
        success: true,
        lastVerified: new Date().toISOString(),
      });
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Verified ${successCount} accommodation(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results,
    });
  } catch (_error) {
    console.error('Verification update error:', _error);
    return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
  }
}
