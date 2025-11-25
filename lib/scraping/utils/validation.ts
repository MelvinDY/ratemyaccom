/**
 * Data Validation Schemas
 * Zod schemas for validating scraped accommodation data
 */

import { z } from 'zod';

/**
 * Australian state codes
 */
export const AustralianStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'] as const;

/**
 * Accommodation type enum
 */
export const AccommodationTypeEnum = z.enum(['ON_CAMPUS', 'OFF_CAMPUS', 'PRIVATE', 'COLLEGE']);

/**
 * Price period enum
 */
export const PricePeriodEnum = z.enum(['WEEK', 'MONTH', 'SEMESTER', 'YEAR']);

/**
 * Contact information schema
 */
export const ContactInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
}).optional();

/**
 * Main accommodation validation schema
 */
export const AccommodationSchema = z.object({
  // Required identity fields
  name: z.string().min(3, 'Name must be at least 3 characters'),
  university: z.string().min(3, 'University name required'),

  // Required location fields
  address: z.string().min(5, 'Address must be at least 5 characters'),
  suburb: z.string().min(2, 'Suburb required'),
  state: z.enum(AustralianStates),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),

  // Optional location fields
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Required details
  description: z.string().min(50, 'Description must be at least 50 characters'),
  type: AccommodationTypeEnum,

  // Required pricing
  priceMin: z.number().positive('Price must be positive'),
  priceMax: z.number().positive('Price must be positive'),
  pricePeriod: PricePeriodEnum,
  currency: z.string().default('AUD'),

  // Required capacity
  capacity: z.number().int().positive('Capacity must be a positive integer').default(100),

  // Arrays
  roomTypes: z.array(z.string()).min(1, 'At least one room type required'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  amenities: z.array(z.string()).default([]),

  // Contact info
  contactInfo: ContactInfoSchema,

  // Optional distances
  distanceToCampus: z.number().positive().optional(),
  distanceToTransport: z.number().positive().optional(),

  // Source tracking
  sourceUrl: z.string().url('Source URL required'),
});

/**
 * Partial schema for validating incomplete data
 */
export const PartialAccommodationSchema = AccommodationSchema.partial({
  capacity: true,
  latitude: true,
  longitude: true,
  distanceToCampus: true,
  distanceToTransport: true,
  contactInfo: true,
}).required({
  name: true,
  university: true,
  address: true,
  suburb: true,
  state: true,
  postcode: true,
  description: true,
  type: true,
  priceMin: true,
  priceMax: true,
  pricePeriod: true,
  roomTypes: true,
  sourceUrl: true,
});

/**
 * Type inference from schemas
 */
export type ValidatedAccommodation = z.infer<typeof AccommodationSchema>;
export type PartialAccommodation = z.infer<typeof PartialAccommodationSchema>;

/**
 * Standard amenities list for mapping
 */
export const STANDARD_AMENITIES = [
  'WiFi',
  'Gym',
  'Study Rooms',
  'Laundry',
  'Common Kitchen',
  'Parking',
  'Security',
  'Social Events',
  'Cinema Room',
  'Rooftop Terrace',
  'Meal Plans',
  'Music Rooms',
  'Games Room',
  'Bike Storage',
  'Swimming Pool',
  'BBQ Area',
  '24/7 Reception',
  'Cleaning Service',
  'Air Conditioning',
  'Heating',
] as const;

/**
 * Map common amenity variations to standard names
 */
export function normalizeAmenityName(amenity: string): string | null {
  const normalized = amenity.trim().toLowerCase();

  const mappings: Record<string, string> = {
    // WiFi variations
    'wi-fi': 'WiFi',
    'wifi': 'WiFi',
    'wireless internet': 'WiFi',
    'internet': 'WiFi',

    // Gym variations
    'gym': 'Gym',
    'gymnasium': 'Gym',
    'fitness center': 'Gym',
    'fitness centre': 'Gym',
    'fitness room': 'Gym',

    // Study variations
    'study room': 'Study Rooms',
    'study rooms': 'Study Rooms',
    'study area': 'Study Rooms',
    'study space': 'Study Rooms',
    'library': 'Study Rooms',

    // Laundry variations
    'laundry': 'Laundry',
    'laundry facilities': 'Laundry',
    'washing machine': 'Laundry',
    'washer': 'Laundry',

    // Kitchen variations
    'kitchen': 'Common Kitchen',
    'common kitchen': 'Common Kitchen',
    'shared kitchen': 'Common Kitchen',
    'communal kitchen': 'Common Kitchen',

    // Parking variations
    'parking': 'Parking',
    'car park': 'Parking',
    'garage': 'Parking',
    'car parking': 'Parking',

    // Security variations
    'security': 'Security',
    'secure access': 'Security',
    'swipe card': 'Security',
    'key card': 'Security',
    'cctv': 'Security',

    // Social variations
    'social events': 'Social Events',
    'events': 'Social Events',
    'social activities': 'Social Events',

    // Cinema variations
    'cinema': 'Cinema Room',
    'cinema room': 'Cinema Room',
    'movie room': 'Cinema Room',
    'theater': 'Cinema Room',
    'theatre': 'Cinema Room',

    // Rooftop variations
    'rooftop': 'Rooftop Terrace',
    'rooftop terrace': 'Rooftop Terrace',
    'roof terrace': 'Rooftop Terrace',
    'terrace': 'Rooftop Terrace',

    // Meal plans
    'meals': 'Meal Plans',
    'meal plan': 'Meal Plans',
    'meal plans': 'Meal Plans',
    'dining': 'Meal Plans',
    'catering': 'Meal Plans',

    // Music variations
    'music room': 'Music Rooms',
    'music rooms': 'Music Rooms',
    'music practice': 'Music Rooms',
    'practice rooms': 'Music Rooms',

    // Games variations
    'games room': 'Games Room',
    'game room': 'Games Room',
    'recreation room': 'Games Room',
    'rec room': 'Games Room',

    // Bike variations
    'bike storage': 'Bike Storage',
    'bicycle storage': 'Bike Storage',
    'bike parking': 'Bike Storage',
    'bike rack': 'Bike Storage',

    // Pool variations
    'pool': 'Swimming Pool',
    'swimming pool': 'Swimming Pool',
    'indoor pool': 'Swimming Pool',
    'outdoor pool': 'Swimming Pool',

    // BBQ variations
    'bbq': 'BBQ Area',
    'bbq area': 'BBQ Area',
    'barbecue': 'BBQ Area',
    'barbeque': 'BBQ Area',
    'outdoor bbq': 'BBQ Area',

    // Reception variations
    'reception': '24/7 Reception',
    '24/7 reception': '24/7 Reception',
    '24 hour reception': '24/7 Reception',
    'front desk': '24/7 Reception',

    // Cleaning variations
    'cleaning': 'Cleaning Service',
    'cleaning service': 'Cleaning Service',
    'housekeeping': 'Cleaning Service',
    'maid service': 'Cleaning Service',

    // AC variations
    'air conditioning': 'Air Conditioning',
    'air con': 'Air Conditioning',
    'aircon': 'Air Conditioning',
    'a/c': 'Air Conditioning',
    'ac': 'Air Conditioning',
    'cooling': 'Air Conditioning',

    // Heating variations
    'heating': 'Heating',
    'central heating': 'Heating',
    'heater': 'Heating',
  };

  return mappings[normalized] || null;
}

/**
 * Validate and normalize amenities list
 */
export function validateAmenities(amenities: string[]): string[] {
  const normalized = amenities
    .map(a => normalizeAmenityName(a))
    .filter((a): a is string => a !== null);

  // Remove duplicates
  return Array.from(new Set(normalized));
}

/**
 * Validate scraped data and return validation result
 */
export function validateAccommodationData(data: unknown): {
  success: boolean;
  data?: ValidatedAccommodation;
  errors?: z.ZodError;
} {
  try {
    const validated = AccommodationSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Validate partial data (useful for multi-step scraping)
 */
export function validatePartialData(data: unknown): {
  success: boolean;
  data?: PartialAccommodation;
  errors?: z.ZodError;
} {
  try {
    const validated = PartialAccommodationSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
