/**
 * Accommodation Repository
 * Handles all database operations for accommodations
 */

import { prisma } from '@/lib/database/prisma';
import { Prisma, Accommodation, AccommodationType } from '@prisma/client';
import { SearchFilters } from '@/types';

export interface AccommodationWithRelations extends Accommodation {
  amenities: {
    amenity: {
      id: string;
      name: string;
      icon: string | null;
    };
    available: boolean;
  }[];
  _count?: {
    reviews: number;
  };
}

export class AccommodationRepository {
  /**
   * Find accommodation by ID or slug
   */
  async findByIdOrSlug(identifier: string): Promise<AccommodationWithRelations | null> {
    return await prisma.accommodation.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
        active: true,
      },
      include: {
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });
  }

  /**
   * Search accommodations with filters and pagination
   */
  async search(filters: SearchFilters & { page?: number; limit?: number }) {
    const { page = 1, limit = 12, ...searchFilters } = filters;
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.AccommodationWhereInput = {
      active: true,
    };

    if (searchFilters.university) {
      where.university = {
        contains: searchFilters.university,
        mode: 'insensitive',
      };
    }

    if (searchFilters.location) {
      where.OR = [
        { suburb: { contains: searchFilters.location, mode: 'insensitive' } },
        { address: { contains: searchFilters.location, mode: 'insensitive' } },
        { state: { contains: searchFilters.location, mode: 'insensitive' } },
      ];
    }

    if (searchFilters.priceMin !== undefined) {
      where.priceMin = { gte: searchFilters.priceMin };
    }

    if (searchFilters.priceMax !== undefined) {
      where.priceMax = { lte: searchFilters.priceMax };
    }

    if (searchFilters.type && searchFilters.type.length > 0) {
      where.type = {
        in: searchFilters.type.map(t => this.mapAccommodationType(t)),
      };
    }

    if (searchFilters.rating !== undefined) {
      where.ratingOverall = { gte: searchFilters.rating };
    }

    // Handle amenities filter
    if (searchFilters.amenities && searchFilters.amenities.length > 0) {
      where.amenities = {
        some: {
          amenityId: {
            in: searchFilters.amenities,
          },
          available: true,
        },
      };
    }

    // Execute queries in parallel
    const [accommodations, total] = await Promise.all([
      prisma.accommodation.findMany({
        where,
        include: {
          amenities: {
            include: {
              amenity: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { ratingOverall: 'desc' },
          { totalReviews: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.accommodation.count({ where }),
    ]);

    return {
      data: accommodations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get featured accommodations
   */
  async getFeatured(limit: number = 6): Promise<AccommodationWithRelations[]> {
    return await prisma.accommodation.findMany({
      where: {
        featured: true,
        active: true,
      },
      include: {
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: {
        ratingOverall: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Create new accommodation
   */
  async create(data: Prisma.AccommodationCreateInput): Promise<Accommodation> {
    return await prisma.accommodation.create({
      data,
    });
  }

  /**
   * Update accommodation
   */
  async update(id: string, data: Prisma.AccommodationUpdateInput): Promise<Accommodation> {
    return await prisma.accommodation.update({
      where: { id },
      data,
    });
  }

  /**
   * Update accommodation ratings (called after new review)
   */
  async updateRatings(accommodationId: string): Promise<void> {
    const reviews = await prisma.review.findMany({
      where: {
        accommodationId,
        status: 'PUBLISHED',
      },
      select: {
        rating: true,
        ratingCleanliness: true,
        ratingLocation: true,
        ratingValue: true,
        ratingAmenities: true,
        ratingManagement: true,
        ratingSafety: true,
      },
    });

    if (reviews.length === 0) {
      return;
    }

    const totalReviews = reviews.length;
    const avgRatings = {
      ratingOverall: reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews,
      ratingCleanliness: reviews.reduce((sum, r) => sum + r.ratingCleanliness, 0) / totalReviews,
      ratingLocation: reviews.reduce((sum, r) => sum + r.ratingLocation, 0) / totalReviews,
      ratingValue: reviews.reduce((sum, r) => sum + r.ratingValue, 0) / totalReviews,
      ratingAmenities: reviews.reduce((sum, r) => sum + r.ratingAmenities, 0) / totalReviews,
      ratingManagement: reviews.reduce((sum, r) => sum + r.ratingManagement, 0) / totalReviews,
      ratingSafety: reviews.reduce((sum, r) => sum + r.ratingSafety, 0) / totalReviews,
    };

    await prisma.accommodation.update({
      where: { id: accommodationId },
      data: {
        ...avgRatings,
        totalReviews,
      },
    });
  }

  /**
   * Bulk upsert accommodations (for data import)
   */
  async bulkUpsert(accommodations: Prisma.AccommodationCreateInput[]): Promise<number> {
    let count = 0;

    for (const accom of accommodations) {
      await prisma.accommodation.upsert({
        where: { slug: accom.slug },
        update: {
          ...accom,
          updatedAt: new Date(),
        },
        create: accom,
      });
      count++;
    }

    return count;
  }

  /**
   * Find duplicate accommodations (for deduplication)
   */
  async findDuplicates(name: string, address: string): Promise<Accommodation | null> {
    return await prisma.accommodation.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: 'insensitive',
            },
            address: {
              equals: address,
              mode: 'insensitive',
            },
          },
          {
            slug: this.generateSlug(name),
          },
        ],
      },
    });
  }

  /**
   * Helper: Generate URL-friendly slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper: Map accommodation type string to enum
   */
  private mapAccommodationType(type: string): AccommodationType {
    const mapping: Record<string, AccommodationType> = {
      'on-campus': 'ON_CAMPUS',
      'off-campus': 'OFF_CAMPUS',
      'private': 'PRIVATE',
      'college': 'COLLEGE',
    };
    return mapping[type] || 'OFF_CAMPUS';
  }
}

export const accommodationRepository = new AccommodationRepository();
