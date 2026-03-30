/**
 * Accommodation Verification Utilities
 *
 * Provides functions for checking and managing accommodation data verification status.
 * Can be used by API routes, scheduled jobs, or admin tools.
 */

import { prisma } from '@/lib/database/prisma';

// Configuration - can be overridden via environment variables
export const VERIFICATION_CONFIG = {
  STALE_DAYS: parseInt(process.env.VERIFICATION_STALE_DAYS || '90', 10),
  WARNING_DAYS: parseInt(process.env.VERIFICATION_WARNING_DAYS || '60', 10),
  CRITICAL_DAYS: parseInt(process.env.VERIFICATION_CRITICAL_DAYS || '120', 10),
};

export type VerificationStatus =
  | 'verified'
  | 'stale'
  | 'warning'
  | 'critical'
  | 'never_verified'
  | 'needs_manual';

export interface AccommodationVerificationInfo {
  id: string;
  name: string;
  slug: string;
  university: string;
  sourceUrl: string | null;
  lastVerified: Date | null;
  status: VerificationStatus;
  daysSinceVerification: number | null;
  priceMin: number;
  priceMax: number;
  currency: string;
  pricePeriod: string;
}

export interface VerificationSummary {
  total: number;
  verified: number;
  warning: number;
  stale: number;
  critical: number;
  neverVerified: number;
  needsManual: number;
  healthScore: number;
  oldestVerification: Date | null;
  newestVerification: Date | null;
}

/**
 * Calculate verification status based on last verification date
 */
export function calculateVerificationStatus(
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

  if (daysSince > VERIFICATION_CONFIG.CRITICAL_DAYS) {
    return { status: 'critical', daysSinceVerification: daysSince };
  }

  if (daysSince > VERIFICATION_CONFIG.STALE_DAYS) {
    return { status: 'stale', daysSinceVerification: daysSince };
  }

  if (daysSince > VERIFICATION_CONFIG.WARNING_DAYS) {
    return { status: 'warning', daysSinceVerification: daysSince };
  }

  return { status: 'verified', daysSinceVerification: daysSince };
}

/**
 * Get all accommodations with their verification status
 */
export async function getAllVerificationInfo(): Promise<AccommodationVerificationInfo[]> {
  const accommodations = await prisma.accommodation.findMany({
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

  return accommodations.map((accom) => {
    const { status, daysSinceVerification } = calculateVerificationStatus(
      accom.lastVerified,
      accom.sourceUrl
    );

    return {
      ...accom,
      status,
      daysSinceVerification,
    };
  });
}

/**
 * Get verification summary statistics
 */
export async function getVerificationSummary(): Promise<VerificationSummary> {
  const accommodations = await getAllVerificationInfo();

  const summary: VerificationSummary = {
    total: accommodations.length,
    verified: 0,
    warning: 0,
    stale: 0,
    critical: 0,
    neverVerified: 0,
    needsManual: 0,
    healthScore: 0,
    oldestVerification: null,
    newestVerification: null,
  };

  const verifiedDates: Date[] = [];

  for (const accom of accommodations) {
    switch (accom.status) {
      case 'verified':
        summary.verified++;
        break;
      case 'warning':
        summary.warning++;
        break;
      case 'stale':
        summary.stale++;
        break;
      case 'critical':
        summary.critical++;
        break;
      case 'never_verified':
        summary.neverVerified++;
        break;
      case 'needs_manual':
        summary.needsManual++;
        break;
    }

    if (accom.lastVerified) {
      verifiedDates.push(accom.lastVerified);
    }
  }

  // Calculate health score (verified + warning are considered acceptable)
  summary.healthScore =
    summary.total > 0
      ? Math.round(((summary.verified + summary.warning) / summary.total) * 100)
      : 100;

  // Find oldest and newest verification dates
  if (verifiedDates.length > 0) {
    verifiedDates.sort((a, b) => a.getTime() - b.getTime());
    summary.oldestVerification = verifiedDates[0] ?? null;
    summary.newestVerification = verifiedDates[verifiedDates.length - 1] ?? null;
  }

  return summary;
}

/**
 * Get accommodations that need attention (stale, critical, or unverified)
 */
export async function getAccommodationsNeedingAttention(): Promise<
  AccommodationVerificationInfo[]
> {
  const all = await getAllVerificationInfo();
  return all.filter(
    (a) =>
      a.status === 'stale' ||
      a.status === 'critical' ||
      a.status === 'never_verified' ||
      a.status === 'needs_manual'
  );
}

/**
 * Get accommodations by status
 */
export async function getAccommodationsByStatus(
  status: VerificationStatus
): Promise<AccommodationVerificationInfo[]> {
  const all = await getAllVerificationInfo();
  return all.filter((a) => a.status === status);
}

/**
 * Mark an accommodation as verified
 */
export async function markAsVerified(
  idOrSlug: string,
  options?: {
    sourceUrl?: string;
    priceMin?: number;
    priceMax?: number;
  }
): Promise<{ success: boolean; accommodation?: { id: string; name: string }; error?: string }> {
  const accommodation = await prisma.accommodation.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });

  if (!accommodation) {
    return { success: false, error: 'Accommodation not found' };
  }

  const updateData: Record<string, unknown> = {
    lastVerified: new Date(),
  };

  if (options?.sourceUrl !== undefined) {
    updateData.sourceUrl = options.sourceUrl;
  }

  if (options?.priceMin !== undefined) {
    updateData.priceMin = options.priceMin;
  }

  if (options?.priceMax !== undefined) {
    updateData.priceMax = options.priceMax;
  }

  await prisma.accommodation.update({
    where: { id: accommodation.id },
    data: updateData,
  });

  return {
    success: true,
    accommodation: { id: accommodation.id, name: accommodation.name },
  };
}

/**
 * Mark multiple accommodations as verified
 */
export async function markMultipleAsVerified(
  idsOrSlugs: string[]
): Promise<{ successful: string[]; failed: string[] }> {
  const successful: string[] = [];
  const failed: string[] = [];

  for (const idOrSlug of idsOrSlugs) {
    const result = await markAsVerified(idOrSlug);
    if (result.success && result.accommodation) {
      successful.push(result.accommodation.name);
    } else {
      failed.push(idOrSlug);
    }
  }

  return { successful, failed };
}

/**
 * Generate a verification reminder message for notifications
 */
export async function generateVerificationReminder(): Promise<string | null> {
  const summary = await getVerificationSummary();
  const needsAttention =
    summary.stale + summary.critical + summary.neverVerified + summary.needsManual;

  if (needsAttention === 0) {
    return null;
  }

  const parts: string[] = [];

  if (summary.critical > 0) {
    parts.push(`${summary.critical} CRITICAL (>${VERIFICATION_CONFIG.CRITICAL_DAYS} days)`);
  }

  if (summary.stale > 0) {
    parts.push(`${summary.stale} stale (>${VERIFICATION_CONFIG.STALE_DAYS} days)`);
  }

  if (summary.neverVerified > 0) {
    parts.push(`${summary.neverVerified} never verified`);
  }

  if (summary.needsManual > 0) {
    parts.push(`${summary.needsManual} need manual verification`);
  }

  return `Accommodation Data Verification Alert: ${parts.join(', ')}. Health Score: ${summary.healthScore}%`;
}

/**
 * Check if accommodation data should be considered trustworthy
 */
export function isDataTrustworthy(status: VerificationStatus): boolean {
  return status === 'verified' || status === 'warning';
}

/**
 * Get the next recommended verification date for an accommodation
 */
export function getNextVerificationDate(lastVerified: Date | null): Date {
  if (!lastVerified) {
    return new Date(); // Should be verified immediately
  }

  const nextDate = new Date(lastVerified);
  nextDate.setDate(nextDate.getDate() + VERIFICATION_CONFIG.WARNING_DAYS);
  return nextDate;
}
