import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import RatingBreakdown from '@/components/reviews/RatingBreakdown';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/forms/ReviewForm';
import ImageGallery from '@/components/accommodations/ImageGallery';
import LocationMap from '@/components/accommodations/LocationMap';
import { Accommodation, Review } from '@/types';

interface AccommodationPageProps {
  params: {
    slug: string;
  };
}

async function getAccommodation(
  slug: string
): Promise<{ accommodation: Accommodation; reviews: Review[] } | null> {
  try {
    // Fetch directly from database using Prisma (server-side)
    const dbAccommodation = await prisma.accommodation.findFirst({
      where: {
        OR: [{ id: slug }, { slug: slug }],
      },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
        reviews: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                university: true,
                verified: true,
              },
            },
          },
        },
      },
    });

    if (!dbAccommodation) {
      return null;
    }

    // Transform to frontend format
    const accommodation: Accommodation = {
      id: dbAccommodation.id,
      name: dbAccommodation.name,
      slug: dbAccommodation.slug,
      university: dbAccommodation.university,
      location: {
        address: dbAccommodation.address,
        suburb: dbAccommodation.suburb,
        state: dbAccommodation.state,
        postcode: dbAccommodation.postcode,
        coordinates:
          dbAccommodation.latitude && dbAccommodation.longitude
            ? { lat: dbAccommodation.latitude, lng: dbAccommodation.longitude }
            : undefined,
      },
      description: dbAccommodation.description,
      type: dbAccommodation.type.toLowerCase().replace('_', '-') as Accommodation['type'],
      images: dbAccommodation.images,
      amenities: dbAccommodation.amenities.map((aa) => ({
        id: aa.amenity.id,
        name: aa.amenity.name,
        icon: aa.amenity.icon || undefined,
        available: aa.available,
      })),
      pricing: {
        min: dbAccommodation.priceMin,
        max: dbAccommodation.priceMax,
        currency: dbAccommodation.currency,
        period: dbAccommodation.pricePeriod.toLowerCase() as 'week' | 'month' | 'semester' | 'year',
      },
      capacity: dbAccommodation.capacity,
      roomTypes: dbAccommodation.roomTypes,
      contactInfo: dbAccommodation.contactInfo as {
        phone?: string;
        email?: string;
        website?: string;
      },
      ratings: {
        overall: dbAccommodation.ratingOverall,
        breakdown: {
          cleanliness: dbAccommodation.ratingCleanliness,
          location: dbAccommodation.ratingLocation,
          value: dbAccommodation.ratingValue,
          amenities: dbAccommodation.ratingAmenities,
          management: dbAccommodation.ratingManagement,
          safety: dbAccommodation.ratingSafety,
        },
        totalReviews: dbAccommodation.totalReviews,
      },
      distance: {
        toCampus: dbAccommodation.distanceToCampus || 0,
        toTransport: dbAccommodation.distanceToTransport || 0,
      },
      verified: dbAccommodation.verified,
      featured: dbAccommodation.featured,
      createdAt: dbAccommodation.createdAt,
      updatedAt: dbAccommodation.updatedAt,
    };

    // Transform reviews
    const reviews: Review[] = dbAccommodation.reviews.map((r) => ({
      id: r.id,
      accommodationId: r.accommodationId,
      userId: r.userId,
      userName: r.user.name,
      userUniversity: r.user.university || undefined,
      rating: r.rating,
      ratingBreakdown: {
        cleanliness: r.ratingCleanliness,
        location: r.ratingLocation,
        value: r.ratingValue,
        amenities: r.ratingAmenities,
        management: r.ratingManagement,
        safety: r.ratingSafety,
      },
      title: r.title,
      text: r.text,
      pros: r.pros,
      cons: r.cons,
      verified: r.verified,
      roomType: r.roomType || undefined,
      stayDuration: r.stayDuration || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      helpful: r.helpful,
      reported: r.reported,
    }));

    return { accommodation, reviews };
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    return null;
  }
}

export default async function AccommodationPage({ params }: AccommodationPageProps) {
  const result = await getAccommodation(params.slug);

  if (!result) {
    notFound();
  }

  const { accommodation, reviews } = result;

  return (
    <div className="min-h-screen bg-charcoal-dark">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-charcoal via-charcoal-dark to-black overflow-hidden border-b border-white/10">
        {/* Gradient Accent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-lyra-purple-start/10 via-transparent to-lyra-purple-end/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  {accommodation.name}
                </h1>
                {accommodation.verified && (
                  <span className="bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-6 text-white/60">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {accommodation.location.suburb}, {accommodation.location.state}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {accommodation.university}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(accommodation.ratings.overall)
                          ? 'text-yellow-400'
                          : 'text-white/30'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-3xl font-bold text-white">
                  {accommodation.ratings.overall.toFixed(1)}
                </span>
              </div>
              <p className="text-white/60">{accommodation.ratings.totalReviews} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <ImageGallery images={accommodation.images} name={accommodation.name} />

            {/* Location Map */}
            <LocationMap
              accommodationName={accommodation.name}
              university={accommodation.university}
              address={accommodation.location.address}
              suburb={accommodation.location.suburb}
              state={accommodation.location.state}
              postcode={accommodation.location.postcode}
              coordinates={accommodation.location.coordinates}
              distanceToCampus={accommodation.distance.toCampus}
            />

            {/* About Section */}
            <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
                About
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">{accommodation.description}</p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-white mb-2">Type</h3>
                  <p className="text-white/60 capitalize">{accommodation.type.replace('-', ' ')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Capacity</h3>
                  <p className="text-white/60">{accommodation.capacity} students</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Distance to Campus</h3>
                  <p className="text-white/60">{accommodation.distance.toCampus}km</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Distance to Transport</h3>
                  <p className="text-white/60">{accommodation.distance.toTransport}km</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">Room Types Available</h3>
                <div className="flex flex-wrap gap-2">
                  {accommodation.roomTypes.map((type) => (
                    <span
                      key={type}
                      className="bg-gradient-to-r from-lyra-purple-start/20 to-lyra-purple-end/20 text-white border border-white/20 px-3 py-1 rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
                Amenities
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {accommodation.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className={`flex items-center space-x-3 ${
                      amenity.available ? 'text-white' : 'text-white/30 line-through'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        amenity.available ? 'text-lyra-purple-start' : 'text-white/20'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-6">
                Student Reviews
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-white/60">
                    No reviews yet. Be the first to share your experience!
                  </p>
                </div>
              )}
            </section>

            {/* Review Form */}
            <section>
              <ReviewForm
                accommodationId={accommodation.id}
                accommodationSlug={accommodation.slug}
              />
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
                Pricing
              </h3>
              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end bg-clip-text text-transparent">
                    ${accommodation.pricing.min}
                  </span>
                  <span className="text-xl text-white/70">- ${accommodation.pricing.max}</span>
                </div>
                <p className="text-white/50 text-sm mt-1">per {accommodation.pricing.period}</p>
              </div>

              {accommodation.contactInfo.website && (
                <a
                  href={accommodation.contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:shadow-lg hover:shadow-lyra-purple-start/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 mb-3"
                >
                  Visit Website
                </a>
              )}

              <div className="space-y-3 text-sm">
                {accommodation.contactInfo.phone && (
                  <div className="flex items-center text-white/60">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {accommodation.contactInfo.phone}
                  </div>
                )}
                {accommodation.contactInfo.email && (
                  <div className="flex items-center text-white/60">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {accommodation.contactInfo.email}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Breakdown */}
            <RatingBreakdown
              breakdown={accommodation.ratings.breakdown}
              totalReviews={accommodation.ratings.totalReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
