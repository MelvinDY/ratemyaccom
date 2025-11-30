'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api/client';
import { Accommodation, RatingBreakdown } from '@/types';
import {
  ArrowLeft,
  Star,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Dropdown states
  const [roomTypeDropdownOpen, setRoomTypeDropdownOpen] = useState(false);
  const [stayDurationDropdownOpen, setStayDurationDropdownOpen] = useState(false);

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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        isAnonymous,
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]"
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-extralight text-white mb-4">Login Required</h1>
            <p className="text-neutral-400 text-sm mb-8">
              You need to be logged in to write a review. Please sign in with your university email
              to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full text-sm uppercase tracking-wider font-medium hover:bg-purple-100 transition-colors"
                >
                  Sign In
                  <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-full border border-white/[0.1] text-white text-sm uppercase tracking-wider font-light hover:bg-white/[0.05] transition-colors"
                >
                  Create Account
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-500/[0.07] to-transparent" />

        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-green-500/20 blur-[100px]"
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-green-500/20 backdrop-blur-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-8 h-8 text-green-400" />
            </motion.div>
            <h1 className="text-2xl font-extralight text-white mb-4">Review Submitted!</h1>
            <p className="text-neutral-400 text-sm mb-4">
              Thank you for sharing your experience. Your review will help other students make
              informed decisions.
            </p>
            <p className="text-neutral-500 text-xs uppercase tracking-wider">
              Redirecting to accommodation page...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]"
        animate={{ y: [0, 20, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center px-6 sm:px-12 lg:px-20 py-8"
        >
          <Link href="/browse" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
            <span className="text-xs text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400 transition-colors">
              Back to Browse
            </span>
          </Link>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">
            Share Your Experience
          </div>
        </motion.div>

        {/* Header */}
        <div className="px-6 sm:px-12 lg:px-20 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Overline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-px w-12 bg-purple-500" />
              <span className="text-sm text-purple-400 uppercase tracking-[0.3em] font-light">
                Write Review
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-2 mb-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white leading-[0.95] tracking-[-0.03em]">
                Share Your
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight leading-[0.95] tracking-[-0.03em]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400">
                  Experience
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-neutral-400 font-light max-w-lg"
            >
              Help other students find the right accommodation by sharing your honest review.
            </motion.p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 sm:px-12 lg:px-20 pb-20">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Select Accommodation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm relative z-20"
              >
                <h2 className="text-lg font-light text-white mb-1">Select Accommodation</h2>
                <p className="text-neutral-500 text-sm mb-6">
                  Choose the accommodation you want to review
                </p>

                <div className="relative" ref={dropdownRef}>
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
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300"
                  />

                  {showDropdown && !selectedAccommodation && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-[#151515] border border-white/[0.1] shadow-2xl shadow-black/50 max-h-60 overflow-y-auto"
                    >
                      {loadingAccommodations ? (
                        <div className="p-4 text-center">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-500" />
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
                            className="w-full px-4 py-3 text-left hover:bg-white/[0.05] transition-colors border-b border-white/[0.05] last:border-b-0"
                          >
                            <p className="text-white font-light">{acc.name}</p>
                            <p className="text-neutral-500 text-xs mt-0.5">
                              {acc.university} - {acc.suburb}
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-neutral-500 text-sm">
                          No accommodations found
                        </div>
                      )}
                    </motion.div>
                  )}

                  {selectedAccommodation && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAccommodation(null);
                        setSearchQuery('');
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Rating Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm relative z-10"
              >
                <h2 className="text-lg font-light text-white mb-1">Rate Your Experience</h2>
                <p className="text-neutral-500 text-sm mb-8">
                  Rate each category from 1 to 5 stars
                </p>

                <div className="space-y-6">
                  {RATING_CATEGORIES.map((category) => (
                    <div
                      key={category.key}
                      className="flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="sm:w-1/3">
                        <p className="text-white font-light">{category.label}</p>
                        <p className="text-neutral-500 text-xs">{category.description}</p>
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
                                  ? 'text-purple-400 fill-purple-400'
                                  : 'text-white/20'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-neutral-500 text-sm min-w-[3rem]">
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
                  <div className="mt-8 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-light">Overall Rating</span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(overallRating)
                                ? 'text-purple-400 fill-purple-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-2xl font-extralight text-white">
                          {overallRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Review Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm"
              >
                <h2 className="text-lg font-light text-white mb-1">Your Review</h2>
                <p className="text-neutral-500 text-sm mb-8">
                  Share the details of your experience
                </p>

                {/* Title */}
                <div className="mb-6">
                  <label
                    htmlFor="review-title"
                    className="text-xs text-neutral-400 uppercase tracking-wider mb-2 block"
                  >
                    Review Title <span className="text-purple-400">*</span>
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience in a few words"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300"
                    maxLength={100}
                  />
                  <p className="text-neutral-500 text-xs mt-2">
                    {title.length}/100 characters (minimum 10)
                  </p>
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label
                    htmlFor="review-text"
                    className="text-xs text-neutral-400 uppercase tracking-wider mb-2 block"
                  >
                    Your Review <span className="text-purple-400">*</span>
                  </label>
                  <textarea
                    id="review-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience living here. What did you like? What could be improved? Be specific to help other students."
                    rows={6}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300 resize-none"
                    maxLength={2000}
                  />
                  <p className="text-neutral-500 text-xs mt-2">
                    {text.length}/2000 characters (minimum 50)
                  </p>
                </div>

                {/* Pros */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider">
                      Pros (optional)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pros.map((pro, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={pro}
                          onChange={(e) => updatePro(index, e.target.value)}
                          placeholder="Something you liked..."
                          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300"
                          maxLength={100}
                        />
                        {pros.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePro(index)}
                            className="p-3 rounded-xl border border-white/[0.08] text-neutral-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pros.length < 5 && (
                    <button
                      type="button"
                      onClick={addPro}
                      className="mt-3 flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add another pro
                    </button>
                  )}
                </div>

                {/* Cons */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsDown className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider">
                      Cons (optional)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cons.map((con, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={con}
                          onChange={(e) => updateCon(index, e.target.value)}
                          placeholder="Something that could be improved..."
                          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300"
                          maxLength={100}
                        />
                        {cons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCon(index)}
                            className="p-3 rounded-xl border border-white/[0.08] text-neutral-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {cons.length < 5 && (
                    <button
                      type="button"
                      onClick={addCon}
                      className="mt-3 flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add another con
                    </button>
                  )}
                </div>

                {/* Room Type and Stay Duration */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Room Type Dropdown */}
                  <div className="space-y-2">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                      Room Type (optional)
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setRoomTypeDropdownOpen(!roomTypeDropdownOpen)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300 flex items-center justify-between"
                      >
                        <span className={roomType ? 'text-white' : 'text-neutral-600'}>
                          {roomType
                            ? ROOM_TYPES.find((r) => r.value === roomType)?.label
                            : 'Select room type'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${
                            roomTypeDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {roomTypeDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-[#151515] border border-white/[0.1] shadow-2xl shadow-black/50"
                        >
                          {ROOM_TYPES.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => {
                                setRoomType(type.value);
                                setRoomTypeDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                            >
                              {type.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Stay Duration Dropdown */}
                  <div className="space-y-2">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                      Stay Duration (optional)
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setStayDurationDropdownOpen(!stayDurationDropdownOpen)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300 flex items-center justify-between"
                      >
                        <span className={stayDuration ? 'text-white' : 'text-neutral-600'}>
                          {stayDuration
                            ? STAY_DURATIONS.find((d) => d.value === stayDuration)?.label
                            : 'Select duration'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${
                            stayDurationDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {stayDurationDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-[#151515] border border-white/[0.1] shadow-2xl shadow-black/50"
                        >
                          {STAY_DURATIONS.map((duration) => (
                            <button
                              key={duration.value}
                              type="button"
                              onClick={() => {
                                setStayDuration(duration.value);
                                setStayDurationDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                            >
                              {duration.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Privacy & Verification Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm space-y-6"
              >
                {/* Anonymous Review Toggle */}
                <div className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      id="anonymous-checkbox"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor="anonymous-checkbox"
                      className={`w-5 h-5 rounded border cursor-pointer ${
                        isAnonymous
                          ? 'bg-purple-500 border-purple-500'
                          : 'bg-white/[0.03] border-white/[0.2] group-hover:border-white/[0.3]'
                      } transition-all duration-300 flex items-center justify-center`}
                    >
                      {isAnonymous && <Check className="w-3 h-3 text-white" />}
                      <span className="sr-only">Post anonymously</span>
                    </label>
                  </div>
                  <label htmlFor="anonymous-checkbox" className="cursor-pointer">
                    <span className="text-white font-light">Post anonymously</span>
                    <p className="text-neutral-500 text-sm mt-1">
                      Your name and university will be hidden. Other users will see &quot;Anonymous
                      Student&quot; instead.
                    </p>
                  </label>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06]" />

                {/* Verification Checkbox */}
                <div className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      id="verified-checkbox"
                      type="checkbox"
                      checked={verified}
                      onChange={(e) => setVerified(e.target.checked)}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor="verified-checkbox"
                      className={`w-5 h-5 rounded border cursor-pointer ${
                        verified
                          ? 'bg-purple-500 border-purple-500'
                          : 'bg-white/[0.03] border-white/[0.2] group-hover:border-white/[0.3]'
                      } transition-all duration-300 flex items-center justify-center`}
                    >
                      {verified && <Check className="w-3 h-3 text-white" />}
                      <span className="sr-only">Verify your review</span>
                    </label>
                  </div>
                  <label htmlFor="verified-checkbox" className="cursor-pointer">
                    <span className="text-white font-light">Verify your review</span>
                    <p className="text-neutral-500 text-sm mt-1">
                      I confirm that I have lived at this accommodation and this review is based on
                      my personal experience. False reviews may be removed and could result in
                      account suspension.
                    </p>
                  </label>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-col sm:flex-row justify-end gap-4"
              >
                <Link href="/browse">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/[0.1] text-white text-sm uppercase tracking-wider font-light hover:bg-white/[0.05] transition-colors"
                  >
                    Cancel
                  </motion.button>
                </Link>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-sm uppercase tracking-wider hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Review
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-white/5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
              Your Voice Matters
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function WriteReviewLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
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
