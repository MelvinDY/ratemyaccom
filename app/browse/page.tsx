'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SearchFilters, Accommodation } from '@/types';
import BrowseSearch from '@/components/browse/BrowseSearch';
import BrowseFilters from '@/components/browse/BrowseFilters';
import AccommodationCard from '@/components/accommodations/AccommodationCard';
import AccommodationCardSkeleton from '@/components/browse/AccommodationCardSkeleton';
import EmptyState from '@/components/browse/EmptyState';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Building2, Star, Sparkles } from 'lucide-react';

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
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Decorative background elements - matching Hero.tsx */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

      {/* Floating orbs - matching Hero.tsx */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]"
        animate={{
          y: [0, 20, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-purple-600/5 blur-[80px]"
        animate={{
          x: [0, 30, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar - matching Hero.tsx */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center px-6 sm:px-12 lg:px-20 py-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-neutral-500 uppercase tracking-widest">
              Live Listings
            </span>
          </div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">NSW Universities</div>
        </motion.div>

        {/* Hero Section - Editorial Style matching Hero.tsx */}
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
                  <div className="h-px w-12 bg-purple-500" />
                  <span className="text-sm text-purple-400 uppercase tracking-[0.3em] font-light">
                    Discover
                  </span>
                </motion.div>

                {/* Main headline - matching Hero.tsx style */}
                <div className="space-y-2 mb-8">
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white leading-[0.9] tracking-[-0.03em]"
                  >
                    Find Your
                  </motion.h1>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight leading-[0.9] tracking-[-0.03em]"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400">
                      Perfect
                    </span>
                  </motion.h1>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white leading-[0.9] tracking-[-0.03em]"
                  >
                    Home
                  </motion.h1>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="text-lg text-neutral-400 max-w-md leading-relaxed font-light"
                >
                  Browse verified student accommodations across NSW universities. Real reviews from
                  real students.
                </motion.p>
              </div>

              {/* Right column - Stats cards matching Hero.tsx */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1 - Total Listings */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="col-span-2 p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-neutral-500 uppercase tracking-widest">
                        Total Listings
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-purple-400 fill-purple-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-5xl sm:text-6xl font-extralight text-white">
                      {total || '50+'}
                    </p>
                    <p className="text-sm text-neutral-500 mt-2">Verified accommodations</p>
                  </motion.div>

                  {/* Card 2 - Universities */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20"
                  >
                    <Building2 className="w-5 h-5 text-purple-400 mb-3" />
                    <p className="text-4xl sm:text-5xl font-extralight text-white mb-2">5</p>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider">
                      Universities
                    </p>
                  </motion.div>

                  {/* Card 3 - Reviews */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10"
                  >
                    <Sparkles className="w-5 h-5 text-purple-400 mb-3" />
                    <p className="text-4xl sm:text-5xl font-extralight text-white mb-2">100+</p>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider">Reviews</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-3xl"
            >
              <BrowseSearch value={searchQuery} onChange={setSearchQuery} />
            </motion.div>
          </div>
        </section>

        {/* Bottom divider */}
        <div className="px-6 sm:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
                  className="sticky top-8"
                >
                  <BrowseFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearFilters={handleClearFilters}
                  />
                </motion.div>
              </aside>

              {/* Results */}
              <main className="flex-1 min-w-0">
                {/* Results Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]"
                >
                  <div>
                    <span className="text-xs text-purple-400 uppercase tracking-[0.2em] font-light mb-2 block">
                      Results
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extralight text-white">
                      {loading ? (
                        <span className="text-neutral-500">Searching...</span>
                      ) : (
                        <>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                            {total}
                          </span>
                          <span className="text-neutral-400 font-light"> accommodations</span>
                        </>
                      )}
                    </h2>
                  </div>
                  {!loading && total > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-600 uppercase tracking-widest">
                        Page
                      </span>
                      <span className="text-white font-light">{currentPage}</span>
                      <span className="text-neutral-600">/</span>
                      <span className="text-neutral-400">{totalPages}</span>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-16 flex items-center justify-center gap-4"
                        role="navigation"
                        aria-label="Pagination"
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-6 py-3 rounded-full bg-transparent border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5 disabled:opacity-30 disabled:border-neutral-800 transition-all duration-300 font-medium text-sm uppercase tracking-wider"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>

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
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                    currentPage === page
                                      ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30'
                                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                                  }`}
                                  aria-label={`Go to page ${page}`}
                                  aria-current={currentPage === page ? 'page' : undefined}
                                >
                                  {page}
                                </motion.button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="text-neutral-600 px-1">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-6 py-3 rounded-full bg-transparent border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5 disabled:opacity-30 disabled:border-neutral-800 transition-all duration-300 font-medium text-sm uppercase tracking-wider"
                          aria-label="Next page"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        </div>

        {/* Bottom bar - matching Hero.tsx */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-white/5"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              {['UNSW', 'Sydney', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
                <span
                  key={uni}
                  className="text-xs text-neutral-600 uppercase tracking-widest hover:text-neutral-400 transition-colors cursor-default"
                >
                  {uni}
                </span>
              ))}
            </div>
            <div className="text-xs text-neutral-600 uppercase tracking-widest">
              {total} listings available
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading component for Suspense - matching Hero style
function BrowsePageLoading() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Animated spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500" />
          </motion.div>

          {/* Loading text */}
          <div className="text-center">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm text-neutral-500 uppercase tracking-[0.3em]"
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
