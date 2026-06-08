import { prisma } from '@/lib/database/prisma';

export interface PlatformStats {
  properties: number;
  reviews: number;
  universities: number;
}

/**
 * Live platform counts for the header/homepage. Falls back to zeros if the DB
 * is unreachable so the UI never throws.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [properties, reviews, unis] = await Promise.all([
      prisma.accommodation.count({ where: { active: true } }),
      prisma.review.count({ where: { status: 'PUBLISHED' } }),
      prisma.accommodation.findMany({
        where: { active: true },
        distinct: ['university'],
        select: { university: true },
      }),
    ]);
    return { properties, reviews, universities: unis.length };
  } catch {
    return { properties: 0, reviews: 0, universities: 0 };
  }
}
