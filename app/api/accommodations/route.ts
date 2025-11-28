/**
 * API Route: GET /api/accommodations
 * Fetches accommodations with filtering and pagination
 * Now powered by PostgreSQL database via Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { Accommodation } from '@/types';
import { Prisma, AccommodationType, PricePeriod } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Helper function to convert DB enum to frontend type
function convertAccommodationType(type: AccommodationType): Accommodation['type'] {
  return type.toLowerCase().replace('_', '-') as Accommodation['type'];
}

function convertPricePeriod(period: PricePeriod): Accommodation['pricing']['period'] {
  return period.toLowerCase() as Accommodation['pricing']['period'];
}

// Helper to convert frontend type to DB enum
function parseAccommodationType(type: string): AccommodationType {
  const typeMap: Record<string, AccommodationType> = {
    'on-campus': 'ON_CAMPUS',
    'off-campus': 'OFF_CAMPUS',
    private: 'PRIVATE',
    college: 'COLLEGE',
  };
  return typeMap[type.toLowerCase()] || (type.toUpperCase().replace('-', '_') as AccommodationType);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const university = searchParams.get('university');
    const location = searchParams.get('location');
    const priceMinStr = searchParams.get('priceMin');
    const priceMaxStr = searchParams.get('priceMax');
    const ratingStr = searchParams.get('rating');
    const typeStr = searchParams.get('type');
    const featured = searchParams.get('featured');
    const verified = searchParams.get('verified');

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build Prisma where clause
    const where: Prisma.AccommodationWhereInput = {
      active: true, // Only show active accommodations
    };

    if (university) {
      where.university = {
        contains: university,
        mode: 'insensitive',
      };
    }

    if (location) {
      where.OR = [
        { suburb: { contains: location, mode: 'insensitive' } },
        { address: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } },
      ];
    }

    if (priceMinStr || priceMaxStr) {
      where.AND = [];
      if (priceMinStr) {
        where.AND.push({ priceMin: { gte: parseInt(priceMinStr) } });
      }
      if (priceMaxStr) {
        where.AND.push({ priceMax: { lte: parseInt(priceMaxStr) } });
      }
    }

    if (ratingStr) {
      where.ratingOverall = {
        gte: parseFloat(ratingStr),
      };
    }

    if (typeStr) {
      where.type = parseAccommodationType(typeStr);
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (verified === 'true') {
      where.verified = true;
    }

    // Count total matching accommodations
    const total = await prisma.accommodation.count({ where });

    // Fetch accommodations with pagination
    const accommodations = await prisma.accommodation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { verified: 'desc' }, { ratingOverall: 'desc' }],
    });

    // Transform to match frontend interface
    const transformedData: Accommodation[] = accommodations.map((accom) => ({
      id: accom.id,
      name: accom.name,
      slug: accom.slug,
      university: accom.university,
      location: {
        address: accom.address,
        suburb: accom.suburb,
        state: accom.state,
        postcode: accom.postcode,
        ...(accom.latitude &&
          accom.longitude && {
            coordinates: {
              lat: accom.latitude,
              lng: accom.longitude,
            },
          }),
      },
      description: accom.description,
      type: convertAccommodationType(accom.type),
      images: accom.images,
      amenities: accom.amenities.map((aa) => ({
        id: aa.amenity.id,
        name: aa.amenity.name,
        ...(aa.amenity.icon && { icon: aa.amenity.icon }),
        available: aa.available,
      })),
      pricing: {
        min: accom.priceMin,
        max: accom.priceMax,
        currency: accom.currency,
        period: convertPricePeriod(accom.pricePeriod),
      },
      capacity: accom.capacity,
      roomTypes: accom.roomTypes,
      contactInfo: accom.contactInfo as { phone?: string; email?: string; website?: string },
      ratings: {
        overall: accom.ratingOverall,
        breakdown: {
          cleanliness: accom.ratingCleanliness,
          location: accom.ratingLocation,
          value: accom.ratingValue,
          amenities: accom.ratingAmenities,
          management: accom.ratingManagement,
          safety: accom.ratingSafety,
        },
        totalReviews: accom.totalReviews,
      },
      distance: {
        toCampus: accom.distanceToCampus || 0,
        toTransport: accom.distanceToTransport || 0,
      },
      verified: accom.verified,
      featured: accom.featured,
      createdAt: accom.createdAt,
      updatedAt: accom.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformedData,
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

/**
 * POST /api/accommodations
 * Create a new accommodation listing
 * KAN-5
 */
export async function POST(request: NextRequest) {
  try {
    // Import auth middleware
    const { requireAuth } = await import('@/lib/auth/middleware');

    // Authenticate user (admin only)
    let user;
    try {
      user = await requireAuth(request);

      // Check if user is admin or moderator
      if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied',
            message: 'Only administrators can create accommodation listings',
          },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in as an administrator',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      university,
      address,
      suburb,
      state,
      postcode,
      latitude,
      longitude,
      description,
      type,
      images,
      priceMin,
      priceMax,
      pricePeriod,
      capacity,
      roomTypes,
      contactInfo,
      distanceToCampus,
      distanceToTransport,
    } = body;

    // Validate required fields
    if (
      !name ||
      !university ||
      !address ||
      !suburb ||
      !state ||
      !postcode ||
      !description ||
      !type
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message:
            'Name, university, address, suburb, state, postcode, description, and type are required',
        },
        { status: 400 }
      );
    }

    if (!priceMin || !priceMax) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing pricing information',
          message: 'Price min and max are required',
        },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingAccommodation = await prisma.accommodation.findUnique({
      where: { slug },
    });

    if (existingAccommodation) {
      // Add random suffix to make it unique
      const uniqueSlug = `${slug}-${Math.random().toString(36).substring(7)}`;

      const accommodation = await createAccommodationRecord({
        name,
        slug: uniqueSlug,
        university,
        address,
        suburb,
        state,
        postcode,
        latitude,
        longitude,
        description,
        type: parseAccommodationType(type),
        images: images || [],
        priceMin,
        priceMax,
        pricePeriod: pricePeriod || 'WEEK',
        capacity: capacity || 1,
        roomTypes: roomTypes || [],
        contactInfo: contactInfo || {},
        distanceToCampus,
        distanceToTransport,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Accommodation created successfully',
          data: accommodation,
        },
        { status: 201 }
      );
    }

    const accommodation = await createAccommodationRecord({
      name,
      slug,
      university,
      address,
      suburb,
      state,
      postcode,
      latitude,
      longitude,
      description,
      type: parseAccommodationType(type),
      images: images || [],
      priceMin,
      priceMax,
      pricePeriod: pricePeriod || 'WEEK',
      capacity: capacity || 1,
      roomTypes: roomTypes || [],
      contactInfo: contactInfo || {},
      distanceToCampus,
      distanceToTransport,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Accommodation created successfully',
        data: accommodation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating accommodation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create accommodation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to create accommodation
async function createAccommodationRecord(data: any) {
  return await prisma.accommodation.create({
    data: {
      name: data.name,
      slug: data.slug,
      university: data.university,
      address: data.address,
      suburb: data.suburb,
      state: data.state,
      postcode: data.postcode,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      type: data.type,
      images: data.images,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      pricePeriod: data.pricePeriod,
      capacity: data.capacity,
      roomTypes: data.roomTypes,
      contactInfo: data.contactInfo,
      distanceToCampus: data.distanceToCampus,
      distanceToTransport: data.distanceToTransport,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      university: true,
      address: true,
      suburb: true,
      state: true,
      postcode: true,
      description: true,
      type: true,
      priceMin: true,
      priceMax: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
