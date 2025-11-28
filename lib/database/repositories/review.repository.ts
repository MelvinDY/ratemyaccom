/**
 * Review Repository
 * Handles all database operations for reviews
 */

import { prisma } from '@/lib/database/prisma';
import { Prisma, Review } from '@prisma/client';

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    name: string;
    university: string | null;
  };
}

export class ReviewRepository {
  /**
   * Get reviews for an accommodation
   */
  async findByAccommodationId(
    accommodationId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          accommodationId,
          status: 'PUBLISHED',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              university: true,
            },
          },
        },
        orderBy: [{ helpful: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          accommodationId,
          status: 'PUBLISHED',
        },
      }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new review
   */
  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return await prisma.review.create({
      data,
    });
  }

  /**
   * Update review
   */
  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return await prisma.review.update({
      where: { id },
      data,
    });
  }

  /**
   * Mark review as helpful
   */
  async incrementHelpful(id: string): Promise<Review> {
    return await prisma.review.update({
      where: { id },
      data: {
        helpful: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Report review
   */
  async incrementReported(id: string): Promise<Review> {
    return await prisma.review.update({
      where: { id },
      data: {
        reported: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Check if user has already reviewed this accommodation
   */
  async hasUserReviewed(userId: string, accommodationId: string): Promise<boolean> {
    const count = await prisma.review.count({
      where: {
        userId,
        accommodationId,
      },
    });
    return count > 0;
  }

  /**
   * Delete review
   */
  async delete(id: string): Promise<void> {
    await prisma.review.delete({
      where: { id },
    });
  }
}

export const reviewRepository = new ReviewRepository();
