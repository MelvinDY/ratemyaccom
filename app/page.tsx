import Hero from '@/components/ui/Hero';
import SearchBar from '@/components/ui/SearchBar';
import FeaturedGrid from '@/components/accommodations/FeaturedGrid';
import { placeholderAccommodations } from '@/lib/data/placeholder';

export default function Home() {
  const featuredAccommodations = placeholderAccommodations.filter((accom) => accom.featured);

  return (
    <div className="bg-gray-900">
      <Hero />
      <div className="max-w-7xl mx-auto">
        <SearchBar />
      </div>
      <FeaturedGrid accommodations={featuredAccommodations} />

      <section className="bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-purple-900/20 py-16 border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Rate My Accom NSW?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Verified Reviews</h3>
              <p className="text-purple-100">
                All reviews are from verified students who have lived at the accommodations they
                review.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
              <div className="bg-pink-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Student Community</h3>
              <p className="text-purple-100">
                Connect with fellow students and learn from their experiences at various
                accommodations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Detailed Information</h3>
              <p className="text-purple-100">
                Get comprehensive details about amenities, pricing, location, and more to make the
                right choice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
