'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api/client';
import { Accommodation, RatingBreakdown } from '@/types';
import { ArrowLeft, Star, Plus, X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface AccommodationOption {
  id: string;
  name: string;
  slug: string;
  university: string;
  suburb: string;
}

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'twin', label: 'Twin Share' },
  { value: 'studio', label: 'Studio' },
  { value: 'ensuite', label: 'Ensuite' },
  { value: '1-bedroom', label: '1 Bedroom Apartment' },
  { value: '2-bedroom', label: '2 Bedroom Apartment' },
  { value: 'shared', label: 'Shared Room' },
];

const STAY_DURATIONS = [
  { value: '1-semester', label: '1 Semester' },
  { value: '2-semesters', label: '2 Semesters' },
  { value: '1-year', label: '1 Year' },
  { value: '2-years', label: '2+ Years' },
];

const RATING_CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness', description: 'How clean is the accommodation?' },
  { key: 'location', label: 'Location', description: 'Convenience to campus and amenities' },
  { key: 'value', label: 'Value for Money', description: 'Is it worth the price?' },
  { key: 'amenities', label: 'Amenities', description: 'Quality of facilities provided' },
  { key: 'management', label: 'Management', description: 'Responsiveness and helpfulness' },
  { key: 'safety', label: 'Safety', description: 'How safe do you feel?' },
];

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAccommodationId = searchParams.get('accommodation');

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Form state
  const [accommodations, setAccommodations] = useState<AccommodationOption[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationOption | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingAccommodations, setLoadingAccommodations] = useState(true);

  // Rating state
  const [overallRating, setOverallRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>({
    cleanliness: 0,
    location: 0,
    value: 0,
    amenities: 0,
    management: 0,
    safety: 0,
  });
  const [categoryHover, setCategoryHover] = useState<Record<string, number>>({});

  // Review content state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);
  const [roomType, setRoomType] = useState('');
  const [stayDuration, setStayDuration] = useState('');
  const [verified, setVerified] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch accommodations for dropdown
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await api.get<{
          success: boolean;
          data: Accommodation[];
        }>('/accommodations?limit=100');

        const options = response.data.map((acc) => ({
          id: acc.id,
          name: acc.name,
          slug: acc.slug,
          university: acc.university,
          suburb: acc.location.suburb,
        }));

        setAccommodations(options);

        // If preselected, find and set it
        if (preselectedAccommodationId) {
          const preselected = options.find(
            (acc) =>
              acc.id === preselectedAccommodationId || acc.slug === preselectedAccommodationId
          );
          if (preselected) {
            setSelectedAccommodation(preselected);
          }
        }
      } catch (err) {
        console.error('Error fetching accommodations:', err);
      } finally {
        setLoadingAccommodations(false);
      }
    };

    fetchAccommodations();
  }, [preselectedAccommodationId]);

  // Filter accommodations based on search
  const filteredAccommodations = accommodations.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.suburb.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle pros/cons management
  const addPro = () => {
    if (pros.length < 5) {
      setPros([...pros, '']);
    }
  };

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const updatePro = (index: number, value: string) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };

  const addCon = () => {
    if (cons.length < 5) {
      setCons([...cons, '']);
    }
  };

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const updateCon = (index: number, value: string) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };

  // Calculate overall rating from breakdown
  useEffect(() => {
    const ratings = Object.values(ratingBreakdown).filter((r) => r > 0);
    if (ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      setOverallRating(Math.round(avg * 10) / 10);
    }
  }, [ratingBreakdown]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('You must be logged in to submit a review');
      return;
    }

    if (!selectedAccommodation) {
      setError('Please select an accommodation to review');
      return;
    }

    if (overallRating === 0) {
      setError('Please provide ratings for the accommodation');
      return;
    }

    // Check all rating categories are filled
    const allRatingsFilled = Object.values(ratingBreakdown).every((r) => r > 0);
    if (!allRatingsFilled) {
      setError('Please rate all categories');
      return;
    }

    if (title.length < 10) {
      setError('Review title must be at least 10 characters');
      return;
    }

    if (text.length < 50) {
      setError('Review must be at least 50 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        rating: overallRating,
        ratingBreakdown,
        title: title.trim(),
        text: text.trim(),
        pros: pros.filter((p) => p.trim().length > 0),
        cons: cons.filter((c) => c.trim().length > 0),
        roomType: roomType || undefined,
        stayDuration: stayDuration || undefined,
      };

      await api.post(`/accommodations/${selectedAccommodation.id}/reviews`, reviewData);

      setSuccess(true);

      // Redirect to accommodation page after success
      setTimeout(() => {
        router.push(`/accommodation/${selectedAccommodation.slug}`);
      }, 2000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lyra-purple-start animate-spin" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal-dark">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-white/70 mb-6">
              You need to be logged in to write a review. Please sign in with your university email
              to continue.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-lyra-purple-start/50 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="border-2 border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-charcoal-dark">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white/5 backdrop-blur-md border border-green-500/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Review Submitted!</h1>
            <p className="text-white/70 mb-6">
              Thank you for sharing your experience. Your review will help other students make
              informed decisions.
            </p>
            <p className="text-white/50 text-sm">Redirecting to accommodation page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-dark">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-charcoal via-charcoal-dark to-black overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-lyra-purple-start/10 via-transparent to-lyra-purple-end/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/browse"
            className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Write a Review
          </h1>
          <p className="text-white/60 mt-2">
            Share your experience to help other students find the right accommodation
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Select Accommodation */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Accommodation</h2>
            <div className="relative">
              <input
                type="text"
                value={selectedAccommodation ? selectedAccommodation.name : searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedAccommodation(null);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for an accommodation..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lyra-purple-start/50 focus:border-transparent"
              />

              {showDropdown && !selectedAccommodation && (
                <div className="absolute z-10 w-full mt-2 bg-charcoal border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {loadingAccommodations ? (
                    <div className="p-4 text-center text-white/50">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </div>
                  ) : filteredAccommodations.length > 0 ? (
                    filteredAccommodations.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedAccommodation(acc);
                          setSearchQuery('');
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <p className="text-white font-medium">{acc.name}</p>
                        <p className="text-white/50 text-sm">
                          {acc.university} - {acc.suburb}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-white/50">No accommodations found</div>
                  )}
                </div>
              )}

              {selectedAccommodation && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAccommodation(null);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Rate Your Experience</h2>

            <div className="space-y-6">
              {RATING_CATEGORIES.map((category) => (
                <div key={category.key} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="sm:w-1/3">
                    <p className="text-white font-medium">{category.label}</p>
                    <p className="text-white/50 text-sm">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRatingBreakdown((prev) => ({
                            ...prev,
                            [category.key]: star,
                          }));
                        }}
                        onMouseEnter={() =>
                          setCategoryHover((prev) => ({ ...prev, [category.key]: star }))
                        }
                        onMouseLeave={() =>
                          setCategoryHover((prev) => ({ ...prev, [category.key]: 0 }))
                        }
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <=
                            (categoryHover[category.key] ||
                              ratingBreakdown[category.key as keyof RatingBreakdown])
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-white/30'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-white/60 text-sm min-w-[3rem]">
                      {ratingBreakdown[category.key as keyof RatingBreakdown] > 0
                        ? `${ratingBreakdown[category.key as keyof RatingBreakdown]}/5`
                        : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Rating Display */}
            {overallRating > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Overall Rating</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(overallRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-white/30'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-2xl font-bold text-white">
                      {overallRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Review Content */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Your Review</h2>

            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-2">
                Review Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience in a few words"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lyra-purple-start/50 focus:border-transparent"
                maxLength={100}
              />
              <p className="text-white/40 text-sm mt-1">
                {title.length}/100 characters (minimum 10)
              </p>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label htmlFor="text" className="block text-sm font-medium text-white/80 mb-2">
                Your Review <span className="text-red-400">*</span>
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience living here. What did you like? What could be improved? Be specific to help other students."
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lyra-purple-start/50 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <p className="text-white/40 text-sm mt-1">
                {text.length}/2000 characters (minimum 50)
              </p>
            </div>

            {/* Pros */}
            <div className="mb-6">
              <span className="block text-sm font-medium text-white/80 mb-2">Pros (optional)</span>
              <div className="space-y-2">
                {pros.map((pro, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={pro}
                      onChange={(e) => updatePro(index, e.target.value)}
                      placeholder="Something you liked..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lyra-purple-start/50 focus:border-transparent"
                      maxLength={100}
                    />
                    {pros.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePro(index)}
                        className="p-2 text-white/50 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pros.length < 5 && (
                <button
                  type="button"
                  onClick={addPro}
                  className="mt-2 flex items-center gap-1 text-lyra-purple-start hover:text-lyra-purple-end transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add another pro
                </button>
              )}
            </div>

            {/* Cons */}
            <div className="mb-6">
              <span className="block text-sm font-medium text-white/80 mb-2">Cons (optional)</span>
              <div className="space-y-2">
                {cons.map((con, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={con}
                      onChange={(e) => updateCon(index, e.target.value)}
                      placeholder="Something that could be improved..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lyra-purple-start/50 focus:border-transparent"
                      maxLength={100}
                    />
                    {cons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCon(index)}
                        className="p-2 text-white/50 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {cons.length < 5 && (
                <button
                  type="button"
                  onClick={addCon}
                  className="mt-2 flex items-center gap-1 text-lyra-purple-start hover:text-lyra-purple-end transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add another con
                </button>
              )}
            </div>

            {/* Room Type and Stay Duration */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-white/80 mb-2">
                  Room Type (optional)
                </label>
                <select
                  id="roomType"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lyra-purple-start/50 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="" className="bg-charcoal">
                    Select room type
                  </option>
                  {ROOM_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-charcoal">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="stayDuration"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Stay Duration (optional)
                </label>
                <select
                  id="stayDuration"
                  value={stayDuration}
                  onChange={(e) => setStayDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lyra-purple-start/50 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="" className="bg-charcoal">
                    Select duration
                  </option>
                  {STAY_DURATIONS.map((duration) => (
                    <option key={duration.value} value={duration.value} className="bg-charcoal">
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Verification Checkbox */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="verification-checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/30 bg-white/5 text-lyra-purple-start focus:ring-lyra-purple-start/50 cursor-pointer"
                aria-describedby="verification-description"
              />
              <div>
                <label
                  htmlFor="verification-checkbox"
                  className="text-white font-medium cursor-pointer"
                >
                  Verify your review
                </label>
                <p id="verification-description" className="text-white/50 text-sm mt-1">
                  I confirm that I have lived at this accommodation and this review is based on my
                  personal experience. False reviews may be removed and could result in account
                  suspension.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/browse"
              className="px-6 py-3 border-2 border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end text-white rounded-xl font-medium hover:shadow-lg hover:shadow-lyra-purple-start/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function WriteReviewLoading() {
  return (
    <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-lyra-purple-start animate-spin" />
    </div>
  );
}

// Wrap the main component in Suspense for useSearchParams
export default function WriteReviewPage() {
  return (
    <Suspense fallback={<WriteReviewLoading />}>
      <WriteReviewContent />
    </Suspense>
  );
}
