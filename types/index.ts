export interface User {
  id: string;
  email: string;
  name: string;
  university?: string;
  studentId?: string;
  verified: boolean;
  createdAt: Date;
}

export interface RatingBreakdown {
  cleanliness: number;
  location: number;
  value: number;
  amenities: number;
  management: number;
  safety: number;
}

export interface Review {
  id: string;
  accommodationId: string;
  userId: string;
  userName: string;
  userUniversity?: string;
  rating: number;
  ratingBreakdown: RatingBreakdown;
  title: string;
  text: string;
  pros?: string[];
  cons?: string[];
  verified: boolean;
  roomType?: string;
  stayDuration?: string;
  createdAt: Date;
  updatedAt: Date;
  helpful: number;
  reported: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  available: boolean;
}

export interface Accommodation {
  id: string;
  name: string;
  slug: string;
  university: string;
  location: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  description: string;
  type: 'on-campus' | 'off-campus' | 'private' | 'college';
  images: string[];
  amenities: Amenity[];
  pricing: {
    min: number;
    max: number;
    currency: string;
    period: 'week' | 'month' | 'semester' | 'year';
  };
  capacity: number;
  roomTypes: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  ratings: {
    overall: number;
    breakdown: RatingBreakdown;
    totalReviews: number;
  };
  distance: {
    toCampus: number;
    toTransport: number;
  };
  verified: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  university?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  type?: Accommodation['type'][];
  amenities?: string[];
  rating?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
