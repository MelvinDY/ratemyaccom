import { Accommodation } from '@/types';
import AccommodationCard from './AccommodationCard';

interface FeaturedGridProps {
  accommodations: Accommodation[];
}

export default function FeaturedGrid({ accommodations }: FeaturedGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Featured Accommodations
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Popular student housing options across NSW universities, reviewed by students like you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {accommodations.map((accommodation) => (
          <AccommodationCard key={accommodation.id} accommodation={accommodation} />
        ))}
      </div>

      <div className="text-center mt-12">
        <button className="btn btn-outline px-8">View All Accommodations</button>
      </div>
    </section>
  );
}
