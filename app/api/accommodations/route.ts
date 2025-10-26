/**
 * API Route: GET /api/accommodations
 * Fetches accommodations with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { placeholderAccommodations } from '@/lib/data/placeholder';
import { SearchFilters } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: SearchFilters = {
      university: searchParams.get('university') || undefined,
      location: searchParams.get('location') || undefined,
      priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Filter accommodations
    const filtered = placeholderAccommodations.filter((accom) => {
      if (
        filters.university &&
        !accom.university.toLowerCase().includes(filters.university.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.location &&
        !accom.location.suburb.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      if (filters.priceMin && accom.pricing.min < filters.priceMin) {
        return false;
      }

      if (filters.priceMax && accom.pricing.max > filters.priceMax) {
        return false;
      }

      if (filters.rating && accom.ratings.overall < filters.rating) {
        return false;
      }

      return true;
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accommodations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
