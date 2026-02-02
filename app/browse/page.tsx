'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SearchFilters, Accommodation } from '@/types';
import BrowseFilters from '@/components/browse/BrowseFilters';
import AccommodationCard from '@/components/accommodations/AccommodationCard';
import AccommodationCardSkeleton from '@/components/browse/AccommodationCardSkeleton';
import EmptyState from '@/components/browse/EmptyState';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { ChevronLeft, ChevronRight, Building2, Star, Sparkles, Search } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

// Map short university names to full names used in filters
const UNIVERSITY_MAP: Record<string, string> = {
  unsw: 'University of New South Wales (UNSW)',
  sydney: 'University of Sydney',
  uts: 'University of Technology Sydney (UTS)',
  macquarie: 'Macquarie University',
  wsu: 'Western Sydney University',
};

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const universityParam = searchParams.get('university');

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Update filters when URL parameter changes
  useEffect(() => {
    if (universityParam) {
      const mappedUniversity = UNIVERSITY_MAP[universityParam.toLowerCase()];
      if (mappedUniversity) {
        setFilters((prev) => ({ ...prev, university: mappedUniversity }));
      }
    } else {
      // Clear university filter if param is removed
      setFilters((prev) => {
        const { university: _university, ...rest } = prev;
        return rest;
      });
    }
  }, [universityParam]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch accommodations
  const fetchAccommodations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      // Add filters to params
      if (filters.university) {
        params.append('university', filters.university);
      }
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.priceMin) {
        params.append('priceMin', filters.priceMin.toString());
      }
      if (filters.priceMax) {
        params.append('priceMax', filters.priceMax.toString());
      }
      if (filters.rating) {
        params.append('rating', filters.rating.toString());
      }

      const response = await fetch(`/api/accommodations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        let results = data.data;

        // Client-side search filtering (since API doesn't support general search)
        if (debouncedQuery) {
          const query = debouncedQuery.toLowerCase();
          results = results.filter(
            (accom: Accommodation) =>
              accom.name.toLowerCase().includes(query) ||
              accom.location.suburb.toLowerCase().includes(query) ||
              accom.university.toLowerCase().includes(query)
          );
        }

        setAccommodations(results);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching accommodations:', err);
      setError('Failed to load accommodations. Please try again.');
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, debouncedQuery]);

  // Fetch when filters or page change
  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedQuery]);

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#e0e5ec] overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-20">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center px-6 sm:px-12 lg:px-20 py-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">Live Listings</span>
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">NSW Universities</div>
        </motion.div>

        {/* Hero Section - Neumorphic Style */}
        <section className="px-6 sm:px-12 lg:px-20 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-12">
              {/* Left column - Typography */}
              <div>
                {/* Overline */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-4 mb-8"
                >
                  <div className="h-px w-12 bg-blue-500" />
                  <span className="text-sm text-blue-600 uppercase tracking-[0.3em] font-medium">
                    Discover
                  </span>
                </motion.div>

                {/* Main headline */}
                <div className="space-y-2 mb-8">
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 leading-[0.9] tracking-tight"
                  >
                    Find Your
                  </motion.h1>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.9] tracking-tight"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                      Perfect
                    </span>
                  </motion.h1>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 leading-[0.9] tracking-tight"
                  >
                    Home
                  </motion.h1>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="text-lg text-slate-500 max-w-md leading-relaxed"
                >
                  Browse verified student accommodations across NSW universities. Real reviews from
                  real students.
                </motion.p>
              </div>

              {/* Right column - Stats cards with neumorphic style */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1 - Total Listings */}
                  <motion.div
                    whileHover={{
                      boxShadow:
                        '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.9)',
                    }}
                    className="col-span-2 p-8 rounded-2xl bg-[#e0e5ec]
                      shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
                      transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-slate-500 uppercase tracking-widest">
                        Total Listings
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-blue-500 fill-blue-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-5xl sm:text-6xl font-bold text-slate-800">
                      {total || '50+'}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Verified accommodations</p>
                  </motion.div>

                  {/* Card 2 - Universities */}
                  <motion.div
                    whileHover={{
                      boxShadow:
                        '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.9)',
                    }}
                    className="p-6 rounded-2xl bg-[#e0e5ec]
                      shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
                      transition-all duration-300"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3
                      bg-gradient-to-br from-blue-500 to-indigo-600
                      shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                    >
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-4xl sm:text-5xl font-bold text-slate-800 mb-2">5</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Universities</p>
                  </motion.div>

                  {/* Card 3 - Reviews */}
                  <motion.div
                    whileHover={{
                      boxShadow:
                        '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.9)',
                    }}
                    className="p-6 rounded-2xl bg-[#e0e5ec]
                      shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
                      transition-all duration-300"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3
                      bg-gradient-to-br from-blue-500 to-indigo-600
                      shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-4xl sm:text-5xl font-bold text-slate-800 mb-2">100+</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Reviews</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Search Bar - Neumorphic Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-3xl"
            >
              <div
                className="relative rounded-2xl bg-[#e0e5ec]
                shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search accommodations, suburbs, universities..."
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-700 placeholder-slate-400
                    focus:outline-none text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Bottom divider */}
        <div className="px-6 sm:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-6 sm:px-12 lg:px-20 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Sidebar - Filters */}
              <aside className="w-full lg:w-80 flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="sticky top-28"
                >
                  <div
                    className="rounded-2xl p-6 bg-[#e0e5ec]
                    shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
                  >
                    <BrowseFilters
                      filters={filters}
                      onFilterChange={setFilters}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </motion.div>
              </aside>

              {/* Results */}
              <main className="flex-1 min-w-0">
                {/* Results Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-end justify-between mb-8 pb-6 border-b border-slate-300"
                >
                  <div>
                    <span className="text-xs text-blue-600 uppercase tracking-[0.2em] font-medium mb-2 block">
                      Results
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                      {loading ? (
                        <span className="text-slate-400">Searching...</span>
                      ) : (
                        <>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                            {total}
                          </span>
                          <span className="text-slate-600 font-normal"> accommodations</span>
                        </>
                      )}
                    </h2>
                  </div>
                  {!loading && total > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 uppercase tracking-widest">Page</span>
                      <span className="text-slate-800 font-medium">{currentPage}</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-500">{totalPages}</span>
                    </div>
                  )}
                </motion.div>

                {/* Results Grid */}
                {error ? (
                  <ErrorDisplay
                    title="Unable to Load Accommodations"
                    message={error}
                    onRetry={fetchAccommodations}
                  />
                ) : loading ? (
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    role="status"
                    aria-live="polite"
                    aria-label="Loading accommodations"
                  >
                    {[...Array(6)].map((_, i) => (
                      <AccommodationCardSkeleton key={i} />
                    ))}
                  </div>
                ) : accommodations.length === 0 ? (
                  <EmptyState onClearFilters={handleClearFilters} />
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      role="list"
                      aria-label="Accommodation results"
                    >
                      {accommodations.map((accommodation, index) => (
                        <motion.div
                          key={accommodation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          role="listitem"
                        >
                          <AccommodationCard accommodation={accommodation} />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Pagination - Neumorphic Style */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-16 flex items-center justify-center gap-4"
                        role="navigation"
                        aria-label="Pagination"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-6 py-3 rounded-xl bg-[#e0e5ec] text-slate-700 font-medium text-sm uppercase tracking-wider
                            shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                            hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all duration-300 flex items-center gap-2"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </motion.button>

                        <div className="flex items-center gap-2 px-4">
                          {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            // Show first, last, current, and adjacent pages
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <motion.button
                                  key={page}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handlePageChange(page)}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                    currentPage === page
                                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]'
                                      : 'bg-[#e0e5ec] text-slate-600 shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)] hover:text-slate-800'
                                  }`}
                                  aria-label={`Go to page ${page}`}
                                  aria-current={currentPage === page ? 'page' : undefined}
                                >
                                  {page}
                                </motion.button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="text-slate-400 px-1">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-6 py-3 rounded-xl bg-[#e0e5ec] text-slate-700 font-medium text-sm uppercase tracking-wider
                            shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                            hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all duration-300 flex items-center gap-2"
                          aria-label="Next page"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-slate-300"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              {['UNSW', 'Sydney', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
                <span
                  key={uni}
                  className="text-xs text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors cursor-default"
                >
                  {uni}
                </span>
              ))}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">
              {total} listings available
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading component for Suspense - Neumorphic style
function BrowsePageLoading() {
  return (
    <div className="relative min-h-screen bg-[#e0e5ec] overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Animated spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div
              className="w-16 h-16 rounded-full bg-[#e0e5ec]
              shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
            />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-500" />
          </motion.div>

          {/* Loading text */}
          <div className="text-center">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm text-slate-500 uppercase tracking-[0.3em]"
            >
              Loading
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowsePageLoading />}>
      <BrowsePageContent />
    </Suspense>
  );
}
