'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchFilters, Accommodation } from '@/types';
import BrowseSearch from '@/components/browse/BrowseSearch';
import BrowseFilters from '@/components/browse/BrowseFilters';
import AccommodationCard from '@/components/accommodations/AccommodationCard';
import AccommodationCardSkeleton from '@/components/browse/AccommodationCardSkeleton';
import EmptyState from '@/components/browse/EmptyState';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error('Error fetching accommodations:', error);
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
    <div className="min-h-screen bg-charcoal-dark">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-charcoal via-charcoal-dark to-black overflow-hidden">
        {/* Gradient Accent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-lyra-purple-start/10 via-transparent to-lyra-purple-end/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
              Browse Accommodations
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Discover student accommodations with verified reviews from real students
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <BrowseSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <BrowseFilters
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  {loading ? 'Loading...' : `${total} Accommodations`}
                </h2>
                {!loading && total > 0 && (
                  <p className="text-white/50 text-sm mt-1">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
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
                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  role="list"
                  aria-label="Accommodation results"
                >
                  {accommodations.map((accommodation) => (
                    <div key={accommodation.id} role="listitem">
                      <AccommodationCard accommodation={accommodation} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    className="mt-12 flex items-center justify-center gap-4"
                    role="navigation"
                    aria-label="Pagination"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 transition-all duration-300 rounded-xl"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="icon"
                              onClick={() => handlePageChange(page)}
                              className={
                                currentPage === page
                                  ? 'bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end text-white hover:shadow-lg hover:shadow-lyra-purple-start/50 transition-all duration-300 rounded-xl'
                                  : 'bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 rounded-xl'
                              }
                              aria-label={`Go to page ${page}`}
                              aria-current={currentPage === page ? 'page' : undefined}
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="text-white/30">
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
                      className="bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 transition-all duration-300 rounded-xl"
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
