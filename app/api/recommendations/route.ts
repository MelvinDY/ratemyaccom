import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { QuizPreferences, RecommendationScore } from '@/types';

// Weights for different factors in the scoring algorithm
const SCORING_WEIGHTS = {
  budgetMatch: 25,        // 25% - Within budget
  universityMatch: 15,    // 15% - Near their university
  typeMatch: 10,          // 10% - Matches preferred type
  roomTypeMatch: 10,      // 10% - Matches room type
  ratingFactors: 25,      // 25% - Rating breakdown alignment
  amenitiesMatch: 10,     // 10% - Has must-have amenities
  distanceScore: 5,       // 5%  - Distance to campus
};

// Calculate how well an accommodation matches user preferences
function calculateMatchScore(
  accommodation: {
    id: string;
    name: string;
    slug: string;
    university: string;
    suburb: string;
    type: string;
    priceMin: number | null;
    priceMax: number | null;
    roomTypes: string[];
    ratingOverall: number | null;
    ratingCleanliness: number | null;
    ratingLocation: number | null;
    ratingValue: number | null;
    ratingAmenities: number | null;
    ratingManagement: number | null;
    ratingSafety: number | null;
    distanceToCampus: number | null;
    totalReviews: number;
    amenities: { amenity: { name: string } }[];
  },
  preferences: QuizPreferences
): { score: number; matchReasons: string[]; warnings: string[] } {
  let totalScore = 0;
  const matchReasons: string[] = [];
  const warnings: string[] = [];

  // 1. Budget Match (25%)
  const accPriceMin = accommodation.priceMin || 0;
  const accPriceMax = accommodation.priceMax || 1000;

  if (accPriceMin >= preferences.budgetMin && accPriceMax <= preferences.budgetMax) {
    // Perfect fit within budget
    totalScore += SCORING_WEIGHTS.budgetMatch;
    matchReasons.push('Within your budget range');
  } else if (accPriceMin <= preferences.budgetMax && accPriceMax >= preferences.budgetMin) {
    // Partial overlap
    const overlap = Math.min(accPriceMax, preferences.budgetMax) - Math.max(accPriceMin, preferences.budgetMin);
    const range = preferences.budgetMax - preferences.budgetMin;
    const overlapRatio = Math.max(0, overlap / range);
    totalScore += SCORING_WEIGHTS.budgetMatch * overlapRatio;

    if (accPriceMax > preferences.budgetMax) {
      warnings.push(`Some rooms may exceed your budget (up to $${accPriceMax}/week)`);
    }
  } else {
    // Out of budget
    if (accPriceMin > preferences.budgetMax) {
      warnings.push(`Above your budget ($${accPriceMin}-$${accPriceMax}/week)`);
    } else {
      matchReasons.push('Below your budget range');
      totalScore += SCORING_WEIGHTS.budgetMatch * 0.5;
    }
  }

  // 2. University Match (15%)
  const universityMapping: Record<string, string[]> = {
    'UNSW': ['UNSW', 'University of New South Wales'],
    'USYD': ['USYD', 'University of Sydney', 'Sydney University'],
    'UTS': ['UTS', 'University of Technology Sydney'],
    'MQ': ['MQ', 'Macquarie University', 'Macquarie'],
    'WSU': ['WSU', 'Western Sydney University', 'Western Sydney'],
  };

  const preferredUniNames = universityMapping[preferences.university] || [preferences.university];
  const isNearUniversity = preferredUniNames.some(name =>
    accommodation.university.toLowerCase().includes(name.toLowerCase())
  );

  if (isNearUniversity) {
    totalScore += SCORING_WEIGHTS.universityMatch;
    matchReasons.push(`Near ${preferences.university}`);
  }

  // 3. Accommodation Type Match (10%)
  if (preferences.accommodationType.length > 0) {
    if (preferences.accommodationType.includes(accommodation.type)) {
      totalScore += SCORING_WEIGHTS.typeMatch;
      matchReasons.push(`${accommodation.type.replace('-', ' ')} accommodation`);
    }
  } else {
    // No preference, give partial score
    totalScore += SCORING_WEIGHTS.typeMatch * 0.5;
  }

  // 4. Room Type Match (10%)
  if (preferences.roomType && accommodation.roomTypes.length > 0) {
    const roomTypeNormalized = preferences.roomType.toLowerCase();
    const hasMatchingRoom = accommodation.roomTypes.some(rt =>
      rt.toLowerCase().includes(roomTypeNormalized) ||
      roomTypeNormalized.includes(rt.toLowerCase())
    );

    if (hasMatchingRoom) {
      totalScore += SCORING_WEIGHTS.roomTypeMatch;
      matchReasons.push(`Has ${preferences.roomType} rooms available`);
    }
  } else {
    totalScore += SCORING_WEIGHTS.roomTypeMatch * 0.5;
  }

  // 5. Rating Factors Alignment (25%)
  // This is the ML-like weighted scoring based on user priorities
  const ratingScores: Record<string, number | null> = {
    cleanliness: accommodation.ratingCleanliness,
    location: accommodation.ratingLocation,
    value: accommodation.ratingValue,
    amenities: accommodation.ratingAmenities,
    management: accommodation.ratingManagement,
    safety: accommodation.ratingSafety,
  };

  let weightedRatingScore = 0;
  let totalPriorityWeight = 0;

  for (const [factor, priority] of Object.entries(preferences.priorityFactors)) {
    const rating = ratingScores[factor];
    if (rating !== null && rating !== undefined && priority > 0) {
      // Normalize rating to 0-1 scale and multiply by priority weight
      const normalizedRating = rating / 5;
      weightedRatingScore += normalizedRating * priority;
      totalPriorityWeight += priority;

      // Add match reason for highly rated factors that user prioritizes
      if (priority >= 4 && rating >= 4) {
        const factorLabel = factor.charAt(0).toUpperCase() + factor.slice(1);
        matchReasons.push(`High ${factorLabel.toLowerCase()} rating (${rating.toFixed(1)}/5)`);
      }
    }
  }

  if (totalPriorityWeight > 0) {
    const normalizedWeightedScore = weightedRatingScore / totalPriorityWeight;
    totalScore += SCORING_WEIGHTS.ratingFactors * normalizedWeightedScore;
  }

  // 6. Amenities Match (10%)
  if (preferences.mustHaveAmenities.length > 0) {
    const accommodationAmenities = accommodation.amenities.map(a => a.amenity.name.toLowerCase());
    const matchedAmenities = preferences.mustHaveAmenities.filter(amenity =>
      accommodationAmenities.some(aa =>
        aa.includes(amenity.toLowerCase()) || amenity.toLowerCase().includes(aa)
      )
    );

    const amenityMatchRatio = matchedAmenities.length / preferences.mustHaveAmenities.length;
    totalScore += SCORING_WEIGHTS.amenitiesMatch * amenityMatchRatio;

    if (matchedAmenities.length > 0) {
      matchReasons.push(`Has ${matchedAmenities.length}/${preferences.mustHaveAmenities.length} must-have amenities`);
    }

    const missingAmenities = preferences.mustHaveAmenities.filter(a => !matchedAmenities.includes(a));
    if (missingAmenities.length > 0) {
      warnings.push(`May be missing: ${missingAmenities.join(', ')}`);
    }
  } else {
    totalScore += SCORING_WEIGHTS.amenitiesMatch * 0.7;
  }

  // 7. Distance Score (5%)
  if (accommodation.distanceToCampus !== null) {
    if (accommodation.distanceToCampus <= preferences.maxDistanceToCampus) {
      const distanceRatio = 1 - (accommodation.distanceToCampus / preferences.maxDistanceToCampus);
      totalScore += SCORING_WEIGHTS.distanceScore * distanceRatio;

      if (accommodation.distanceToCampus <= 1) {
        matchReasons.push('Walking distance to campus');
      } else if (accommodation.distanceToCampus <= 3) {
        matchReasons.push(`${accommodation.distanceToCampus.toFixed(1)}km from campus`);
      }
    } else {
      warnings.push(`${accommodation.distanceToCampus.toFixed(1)}km from campus (beyond your ${preferences.maxDistanceToCampus}km preference)`);
    }
  }

  // Bonus: High overall rating and reviews
  if (accommodation.ratingOverall && accommodation.ratingOverall >= 4.5) {
    totalScore += 3;
    matchReasons.push(`Highly rated (${accommodation.ratingOverall.toFixed(1)}/5)`);
  }

  if (accommodation.totalReviews >= 20) {
    totalScore += 2;
    matchReasons.push(`${accommodation.totalReviews} verified reviews`);
  }

  return {
    score: Math.min(100, Math.round(totalScore)),
    matchReasons: matchReasons.slice(0, 5), // Limit to top 5 reasons
    warnings: warnings.slice(0, 3), // Limit to top 3 warnings
  };
}

export async function POST(request: Request) {
  try {
    const preferences: QuizPreferences = await request.json();

    // Validate required preferences
    if (!preferences.university) {
      return NextResponse.json(
        { success: false, error: 'University preference is required' },
        { status: 400 }
      );
    }

    // Fetch all active accommodations with their amenities
    const accommodations = await prisma.accommodation.findMany({
      where: {
        active: true,
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { ratingOverall: 'desc' },
      ],
    });

    // Calculate match scores for each accommodation
    const scoredAccommodations: RecommendationScore[] = accommodations.map((acc: any) => {
      const { score, matchReasons, warnings } = calculateMatchScore(
        {
          id: acc.id,
          name: acc.name,
          slug: acc.slug,
          university: acc.university,
          suburb: acc.suburb,
          type: acc.type,
          priceMin: acc.priceMin,
          priceMax: acc.priceMax,
          roomTypes: acc.roomTypes || [],
          ratingOverall: acc.ratingOverall,
          ratingCleanliness: acc.ratingCleanliness,
          ratingLocation: acc.ratingLocation,
          ratingValue: acc.ratingValue,
          ratingAmenities: acc.ratingAmenities,
          ratingManagement: acc.ratingManagement,
          ratingSafety: acc.ratingSafety,
          distanceToCampus: acc.distanceToCampus,
          totalReviews: acc.totalReviews,
          amenities: acc.amenities,
        },
        preferences
      );

      return {
        accommodation: {
          id: acc.id,
          name: acc.name,
          slug: acc.slug,
          university: acc.university,
          location: {
            address: acc.address,
            suburb: acc.suburb,
            state: acc.state,
            postcode: acc.postcode,
            ...(acc.latitude && acc.longitude
              ? { coordinates: { lat: acc.latitude, lng: acc.longitude } }
              : {}),
          },
          description: acc.description,
          type: acc.type as 'on-campus' | 'off-campus' | 'private' | 'college',
          images: acc.images || [],
          amenities: acc.amenities.map((a: any) => ({
            id: a.amenityId,
            name: a.amenity.name,
            ...(a.amenity.icon ? { icon: a.amenity.icon } : {}),
            available: a.available,
          })),
          pricing: {
            min: acc.priceMin || 0,
            max: acc.priceMax || 0,
            currency: acc.currency || 'AUD',
            period: (acc.pricePeriod as 'week' | 'month' | 'semester' | 'year') || 'week',
          },
          capacity: acc.capacity || 0,
          roomTypes: acc.roomTypes || [],
          contactInfo: acc.contactInfo as { phone?: string; email?: string; website?: string } || {},
          ratings: {
            overall: acc.ratingOverall || 0,
            breakdown: {
              cleanliness: acc.ratingCleanliness || 0,
              location: acc.ratingLocation || 0,
              value: acc.ratingValue || 0,
              amenities: acc.ratingAmenities || 0,
              management: acc.ratingManagement || 0,
              safety: acc.ratingSafety || 0,
            },
            totalReviews: acc.totalReviews,
          },
          distance: {
            toCampus: acc.distanceToCampus || 0,
            toTransport: acc.distanceToTransport || 0,
          },
          verified: acc.verified,
          featured: acc.featured,
          createdAt: acc.createdAt,
          updatedAt: acc.updatedAt,
        },
        score,
        matchReasons,
        warnings,
      };
    });

    // Sort by score descending and take top results
    const sortedResults = scoredAccommodations
      .sort((a: RecommendationScore, b: RecommendationScore) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        recommendations: sortedResults,
        totalMatches: scoredAccommodations.filter((r) => r.score >= 50).length,
        preferences: {
          university: preferences.university,
          budgetRange: `$${preferences.budgetMin}-$${preferences.budgetMax}/week`,
          prioritizedFactors: Object.entries(preferences.priorityFactors)
            .filter(([, v]) => v >= 4)
            .map(([k]) => k),
        },
      },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
