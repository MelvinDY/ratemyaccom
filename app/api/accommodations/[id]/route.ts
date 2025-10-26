/**
 * API Route: GET /api/accommodations/[id]
 * Fetches a single accommodation by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { placeholderAccommodations } from '@/lib/data/placeholder';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accommodation = placeholderAccommodations.find(
      (accom) => accom.id === params.id || accom.slug === params.id
    );

    if (!accommodation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accommodation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: accommodation,
    });
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accommodation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
