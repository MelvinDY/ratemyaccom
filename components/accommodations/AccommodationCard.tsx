import Link from 'next/link';
import { Accommodation } from '@/types';
import { CheckCircle2, Star, MapPin, Navigation } from 'lucide-react';

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export default function AccommodationCard({ accommodation }: AccommodationCardProps) {
  return (
    <Link href={`/accommodation/${accommodation.slug}`}>
      <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col hover:bg-white/[0.07] hover:border-lyra-purple-start/30 hover:shadow-2xl hover:shadow-lyra-purple-start/20 transition-all duration-300">
        {/* Image Section with Gradient Overlay */}
        <div className="relative h-48 bg-gradient-to-br from-lyra-purple-start/80 via-lyra-purple-end/60 to-lyra-purple-start/40 overflow-hidden">
          {/* Animated gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-lyra-purple-start to-lyra-purple-end opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

          {/* Badges */}
          {accommodation.verified && (
            <span className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
          {accommodation.featured && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Featured
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title and Rating */}
          <div className="mb-3">
            <h3 className="text-lg font-bold bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent mb-2 group-hover:from-white group-hover:to-white transition-all duration-300">
              {accommodation.name}
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-white">
                  {accommodation.ratings.overall.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-white/50">
                ({accommodation.ratings.totalReviews} reviews)
              </span>
            </div>
          </div>

          {/* University */}
          <p className="text-sm text-white/70 mb-3 line-clamp-1">{accommodation.university}</p>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-white/60 mb-2">
            <MapPin className="w-4 h-4 text-lyra-purple-start" />
            <span>{accommodation.location.suburb}, {accommodation.location.state}</span>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-1.5 text-sm text-white/60 mb-4">
            <Navigation className="w-4 h-4 text-lyra-purple-start" />
            <span>{accommodation.distance.toCampus}km to campus</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {accommodation.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm"
              >
                {amenity.name}
              </span>
            ))}
            {accommodation.amenities.length > 3 && (
              <span className="text-xs bg-lyra-purple-start/20 text-lyra-purple-start border border-lyra-purple-start/30 px-2.5 py-1 rounded-lg font-medium">
                +{accommodation.amenities.length - 3} more
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end bg-clip-text text-transparent">
                  ${accommodation.pricing.min}
                </span>
                <span className="text-white/50 text-sm ml-1">- ${accommodation.pricing.max}</span>
              </div>
              <span className="text-sm text-white/50">per {accommodation.pricing.period}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
