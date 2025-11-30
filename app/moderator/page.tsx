'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Shield, Trash2, AlertCircle, Search, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import api from '@/lib/api/client';

interface ReviewUser {
  id: string;
  name: string;
  email: string | null;
  university: string | null;
}

interface ReviewAccommodation {
  id: string;
  name: string;
  slug: string;
  university: string;
}

interface ModeratorReview {
  id: string;
  title: string;
  text: string;
  rating: number;
  ratingBreakdown: {
    cleanliness: number;
    location: number;
    value: number;
    amenities: number;
    management: number;
    safety: number;
  };
  pros: string[];
  cons: string[];
  status: string;
  verified: boolean;
  isAnonymous: boolean;
  helpful: number;
  reported: number;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  accommodation: ReviewAccommodation;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ModeratorPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ModeratorReview[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  // Check if user is moderator
  const isModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN';

  // Handle hydration - wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!hydrated) {
      return;
    }

    // Redirect if not authenticated or not a moderator
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user && !isModerator) {
      router.push('/');
      return;
    }

    if (isModerator) {
      fetchReviews();
    }
  }, [hydrated, isAuthenticated, user, isModerator, currentPage, statusFilter, router]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await api.get<{
        success: boolean;
        data: {
          reviews: ModeratorReview[];
          pagination: Pagination;
        };
      }>(`/moderator/reviews?${params.toString()}`);

      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews();
  };

  const handleDelete = async (reviewId: string) => {
    setDeleting(true);

    try {
      await api.delete('/moderator/reviews', {
        data: {
          reviewId,
          reason: deleteReason,
        },
      });

      // Remove from list
      setReviews(reviews.filter((r) => r.id !== reviewId));
      setDeleteConfirm(null);
      setDeleteReason('');

      // Update pagination
      if (pagination) {
        setPagination({
          ...pagination,
          total: pagination.total - 1,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading while hydrating or checking auth
  if (!hydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show access denied for non-moderators
  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/70">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Moderator Dashboard</h1>
            <p className="text-white/60">Manage and moderate user reviews</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING">Pending</option>
              <option value="FLAGGED">Flagged</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        {pagination && (
          <div className="mb-6">
            <p className="text-white/60">
              Showing {reviews.length} of {pagination.total} reviews
            </p>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {review.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          by {review.user.name} {review.user.email && `(${review.user.email})`}
                        </p>
                        <p className="text-white/40 text-sm">
                          on{' '}
                          <a
                            href={`/accommodation/${review.accommodation.slug}`}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            {review.accommodation.name}
                          </a>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-medium">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Text */}
                    <p className="text-white/80 mb-3 line-clamp-3">{review.text}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-lg ${
                          review.status === 'PUBLISHED'
                            ? 'bg-green-500/20 text-green-400'
                            : review.status === 'FLAGGED'
                              ? 'bg-red-500/20 text-red-400'
                              : review.status === 'PENDING'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {review.status}
                      </span>
                      {review.verified && (
                        <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400">
                          Verified
                        </span>
                      )}
                      {review.isAnonymous && (
                        <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400">
                          Anonymous
                        </span>
                      )}
                      {review.reported > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400">
                          {review.reported} Reports
                        </span>
                      )}
                      <span className="text-white/40">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 shrink-0">
                    {deleteConfirm === review.id ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                        <p className="text-red-400 text-sm font-medium">Confirm deletion?</p>
                        <input
                          type="text"
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={deleting}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {deleting ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirm(null);
                              setDeleteReason('');
                            }}
                            className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(review.id)}
                        className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-white/60">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
