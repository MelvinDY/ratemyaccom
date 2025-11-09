import { Accommodation } from '@/types';
import AccommodationCard from './AccommodationCard';

interface FeaturedGridProps {
  accommodations: Accommodation[];
}

export default function FeaturedGrid({ accommodations }: FeaturedGridProps) {
  return (
    <section className="w-full bg-gradient-to-br from-purple-900/80 via-purple-800/60 to-purple-900/80 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Featured Accommodations
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Popular student housing options across NSW universities, reviewed by students like you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accommodations.map((accommodation) => (
            <AccommodationCard key={accommodation.id} accommodation={accommodation} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="border-2 border-purple-500 text-purple-300 px-8 py-2 rounded-lg font-medium hover:bg-purple-500/20 transition-all duration-200">
            View All Accommodations
          </button>
        </div>
      </div>
    </section>
  );
}
