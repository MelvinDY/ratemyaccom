import Link from 'next/link';
import { Accommodation } from '@/types';

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export default function AccommodationCard({ accommodation }: AccommodationCardProps) {
  return (
    <Link href={`/accommodation/${accommodation.slug}`}>
      <div className="card overflow-hidden h-full flex flex-col hover:scale-[1.02] transition-transform duration-300">
        <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600">
          {accommodation.verified && (
            <span className="absolute top-3 right-3 badge badge-success">Verified</span>
          )}
          {accommodation.featured && (
            <span className="absolute top-3 left-3 bg-secondary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 flex-1">{accommodation.name}</h3>
          </div>

          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(accommodation.ratings.overall)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {accommodation.ratings.overall.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({accommodation.ratings.totalReviews} reviews)
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{accommodation.university}</p>

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {accommodation.location.suburb}, {accommodation.location.state}
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            {accommodation.distance.toCampus}km to campus
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {accommodation.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {amenity.name}
              </span>
            ))}
            {accommodation.amenities.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                +{accommodation.amenities.length - 3} more
              </span>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-primary-600">
                  ${accommodation.pricing.min}
                </span>
                <span className="text-gray-500 text-sm ml-1">- ${accommodation.pricing.max}</span>
              </div>
              <span className="text-sm text-gray-500">per {accommodation.pricing.period}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
