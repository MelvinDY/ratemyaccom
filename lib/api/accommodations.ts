/**
 * Normalizers for the accommodations API.
 *
 * GET /api/accommodations and POST /api/recommendations return a *nested* shape
 * (ratings.overall, pricing.min, location.suburb), while the Prisma models are
 * flat. UI components that fetch these endpoints should flatten the response
 * with `mapAccommodation`/`mapAccommodations` so they read stable, defaulted
 * fields and can't crash on partial data (e.g. `undefined.toFixed(1)`).
 */

/** Raw nested item as returned by the accommodations / recommendations API. */
export interface ApiAccommodation {
  id: string;
  name: string;
  slug: string;
  university: string;
  type: string;
  images?: string[];
  roomTypes?: string[];
  location?: { suburb?: string; state?: string };
  pricing?: { min?: number; max?: number; period?: string };
  ratings?: { overall?: number; totalReviews?: number };
  amenities?: { name: string; available: boolean }[];
}

/** Flattened shape for UI rendering. */
export interface Accommodation {
  id: string;
  name: string;
  slug: string;
  university: string;
  suburb: string;
  type: string;
  priceMin: number;
  priceMax: number;
  pricePeriod: string;
  ratingOverall: number;
  totalReviews: number;
  roomTypes: string[];
  amenities: { name: string; available: boolean }[];
}

/** Flatten one API item into the UI shape, with safe defaults. */
export function mapAccommodation(a: ApiAccommodation): Accommodation {
  return {
    id: a.id,
    name: a.name,
    slug: a.slug,
    university: a.university,
    suburb: a.location?.suburb ?? '',
    type: a.type,
    priceMin: a.pricing?.min ?? 0,
    priceMax: a.pricing?.max ?? 0,
    pricePeriod: (a.pricing?.period ?? 'week').toUpperCase(),
    ratingOverall: a.ratings?.overall ?? 0,
    totalReviews: a.ratings?.totalReviews ?? 0,
    roomTypes: a.roomTypes ?? [],
    amenities: a.amenities ?? [],
  };
}

/**
 * Flatten a list response. Accepts either the `{ data: [...] }` envelope the
 * API returns or a bare array, and tolerates a missing/!ok payload (-> []).
 */
export function mapAccommodations(payload: unknown): Accommodation[] {
  const list = Array.isArray(payload)
    ? payload
    : ((payload as { data?: ApiAccommodation[] } | null)?.data ?? []);
  return (list as ApiAccommodation[]).map(mapAccommodation);
}
