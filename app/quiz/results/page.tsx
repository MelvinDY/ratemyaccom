'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QuizPreferences, RecommendationScore } from '@/types';
import api from '@/lib/api/client';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Star,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Home,
  ExternalLink,
  Building2,
  Bed,
  Wallet,
  Target,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface RecommendationResponse {
  success: boolean;
  data: {
    recommendations: RecommendationScore[];
    totalMatches: number;
    preferences: {
      university: string;
      budgetRange: string;
      prioritizedFactors: string[];
    };
  };
}

export default function QuizResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [preferences, setPreferences] = useState<QuizPreferences | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get preferences from sessionStorage
        const storedPreferences = sessionStorage.getItem('quizPreferences');

        if (!storedPreferences) {
          router.push('/quiz');
          return;
        }

        const parsedPreferences: QuizPreferences = JSON.parse(storedPreferences);
        setPreferences(parsedPreferences);

        // Call the recommendation API
        const response = await api.post<RecommendationResponse>(
          '/recommendations',
          parsedPreferences
        );

        if (response.success && response.data) {
          setRecommendations(response.data.recommendations);
          setTotalMatches(response.data.totalMatches);
        } else {
          setError('Failed to get recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [router]);

  const handleRetakeQuiz = () => {
    sessionStorage.removeItem('quizPreferences');
    router.push('/quiz');
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white text-[10px] font-medium uppercase tracking-[0.15em] shadow-lg shadow-purple-500/30">
            Top Pick
          </span>
        );
      case 1:
        return (
          <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-[0.15em] border border-white/20">
            Runner Up
          </span>
        );
      case 2:
        return (
          <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-[0.15em] border border-white/20">
            3rd Place
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return 'from-purple-500 to-violet-500';
    }
    if (score >= 60) {
      return 'from-purple-600 to-purple-500';
    }
    return 'from-purple-700 to-purple-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) {
      return 'Perfect Match';
    }
    if (score >= 80) {
      return 'Excellent Match';
    }
    if (score >= 70) {
      return 'Great Match';
    }
    if (score >= 60) {
      return 'Good Match';
    }
    if (score >= 50) {
      return 'Decent Match';
    }
    return 'Partial Match';
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]"
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-500" />
            </motion.div>
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-purple-400 animate-pulse" />
          </motion.div>
          <h2 className="text-2xl font-extralight text-white mb-3">Finding Your Perfect Match</h2>
          <p className="text-neutral-500 text-sm font-light">
            Analyzing accommodations based on your preferences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />

        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center mx-auto mb-6"
          >
            <AlertTriangle className="w-8 h-8 text-purple-400" />
          </motion.div>
          <h2 className="text-2xl font-extralight text-white mb-3">Something went wrong</h2>
          <p className="text-neutral-500 text-sm font-light mb-8">{error}</p>
          <Button
            onClick={handleRetakeQuiz}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:opacity-90 transition-all duration-300 font-light"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const excellentMatches = recommendations.filter((r) => r.score >= 80).length;
  const averageScore =
    recommendations.length > 0
      ? Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length)
      : 0;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Decorative background elements */}
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
        {/* Header */}
        <div className="border-b border-white/[0.06] pt-24">
          <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-8">
            {/* Back Link */}
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">Back to Quiz</span>
            </Link>

            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8 bg-purple-500" />
                  <span className="text-xs text-purple-400 uppercase tracking-[0.3em]">
                    Results
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white mb-4">
                  Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                    Perfect
                  </span>{' '}
                  Matches
                </h1>
                <p className="text-neutral-400 font-light max-w-md">
                  Personalized recommendations based on your preferences
                </p>
              </div>

              <Button
                onClick={handleRetakeQuiz}
                variant="outline"
                className="px-6 py-3 rounded-full bg-transparent border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5 transition-all duration-300 font-light self-start lg:self-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <Home className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-extralight text-white">{totalMatches}</p>
                    <p className="text-neutral-500 text-xs uppercase tracking-widest">
                      Total Matches
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-extralight text-white">{excellentMatches}</p>
                    <p className="text-neutral-500 text-xs uppercase tracking-widest">
                      Excellent Matches
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-extralight text-white">{averageScore}%</p>
                    <p className="text-neutral-500 text-xs uppercase tracking-widest">Avg. Score</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Preference Summary */}
            {preferences && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06]"
              >
                <div className="flex items-center gap-3 mb-5">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-neutral-400 uppercase tracking-widest">
                    Your Preferences
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* University */}
                  <div>
                    <p className="text-neutral-600 text-[10px] uppercase tracking-widest mb-2">
                      University
                    </p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">
                      <Building2 className="w-3 h-3" />
                      {preferences.university}
                    </span>
                  </div>

                  {/* Budget */}
                  <div>
                    <p className="text-neutral-600 text-[10px] uppercase tracking-widest mb-2">
                      Budget
                    </p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">
                      <Wallet className="w-3 h-3" />${preferences.budgetMin}-$
                      {preferences.budgetMax}
                    </span>
                  </div>

                  {/* Accommodation Types */}
                  {preferences.accommodationType.length > 0 && (
                    <div>
                      <p className="text-neutral-600 text-[10px] uppercase tracking-widest mb-2">
                        Type
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.accommodationType.slice(0, 2).map((type) => (
                          <span
                            key={type}
                            className="px-3 py-1.5 rounded-full bg-white/[0.04] text-neutral-400 text-[10px] border border-white/[0.06]"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room Type */}
                  {preferences.roomType && (
                    <div>
                      <p className="text-neutral-600 text-[10px] uppercase tracking-widest mb-2">
                        Room
                      </p>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] text-neutral-400 text-xs border border-white/[0.06]">
                        <Bed className="w-3 h-3" />
                        {preferences.roomType}
                      </span>
                    </div>
                  )}

                  {/* Priority Factors */}
                  {preferences.priorityFactors &&
                    Object.keys(preferences.priorityFactors).length > 0 && (
                      <div>
                        <p className="text-neutral-600 text-[10px] uppercase tracking-widest mb-2">
                          Priorities
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(preferences.priorityFactors)
                            .filter(([, value]) => value >= 4)
                            .slice(0, 2)
                            .map(([factor]) => (
                              <span
                                key={factor}
                                className="px-3 py-1.5 rounded-full bg-white/[0.04] text-neutral-400 text-[10px] border border-white/[0.06]"
                              >
                                {factor}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
          {recommendations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
                <Home className="w-10 h-10 text-neutral-600" />
              </div>
              <h2 className="text-3xl font-extralight text-white mb-4">No Matches Found</h2>
              <p className="text-neutral-500 text-sm font-light mb-8 max-w-md mx-auto">
                We couldn&apos;t find accommodations matching your criteria. Try adjusting your
                preferences.
              </p>
              <Button
                onClick={handleRetakeQuiz}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:opacity-90 transition-all duration-300 font-light"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Adjust Preferences
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/[0.06]">
                <div>
                  <span className="text-xs text-purple-400 uppercase tracking-[0.2em] font-light mb-2 block">
                    Recommendations
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extralight text-white">
                    Top Picks For You
                  </h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">
                    {recommendations.length} Results
                  </span>
                </div>
              </div>

              {/* Recommendation Cards */}
              <div className="space-y-6">
                {recommendations.map((result, index) => (
                  <motion.div
                    key={result.accommodation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`group rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border overflow-hidden hover:border-purple-500/30 transition-all duration-300 ${
                      index === 0 ? 'border-purple-500/40' : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Image */}
                      <div className="relative lg:w-80 h-52 lg:h-auto flex-shrink-0 overflow-hidden">
                        {result.accommodation.images &&
                        result.accommodation.images.length > 0 &&
                        result.accommodation.images[0] ? (
                          <Image
                            src={result.accommodation.images[0]}
                            alt={result.accommodation.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-violet-900/40 flex items-center justify-center">
                            <Home className="w-12 h-12 text-neutral-700" />
                          </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0a0a0a]/80" />

                        {/* Rank Badge */}
                        <div className="absolute top-4 left-4">{getRankBadge(index)}</div>

                        {/* Match Score */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-4 py-2 rounded-full bg-gradient-to-r ${getScoreColor(result.score)} text-white text-xs font-medium`}
                          >
                            {result.score}% Match
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            {/* University tag */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-px w-4 bg-purple-500" />
                              <p className="text-[10px] text-purple-400 uppercase tracking-[0.2em] font-light">
                                {result.accommodation.university}
                              </p>
                            </div>
                            <h3 className="text-xl lg:text-2xl font-light text-white mb-2 group-hover:text-purple-200 transition-colors">
                              {result.accommodation.name}
                            </h3>
                            <div className="flex items-center gap-2 text-neutral-500 text-sm">
                              <MapPin className="w-3.5 h-3.5 text-purple-400/70" />
                              <span className="font-light">
                                {result.accommodation.location.suburb},{' '}
                                {result.accommodation.location.state}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Rating */}
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-white font-light">
                                {result.accommodation.ratings.overall.toFixed(1)}
                              </span>
                              <span className="text-neutral-600 text-xs">
                                ({result.accommodation.ratings.totalReviews})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-1 text-neutral-400">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span className="font-light">
                                {result.accommodation.pricing.min}-
                                {result.accommodation.pricing.max}
                              </span>
                              <span className="text-neutral-600 text-xs">/week</span>
                            </div>
                          </div>
                        </div>

                        {/* Match Label */}
                        <div className="mb-4">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${getScoreColor(result.score)} text-white text-xs font-light`}
                          >
                            {getScoreLabel(result.score)}
                          </span>
                        </div>

                        {/* Match Reasons */}
                        {result.matchReasons.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {result.matchReasons.map((reason, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Warnings */}
                        {result.warnings.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {result.warnings.map((warning, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] text-neutral-400 text-xs border border-white/[0.08]"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  {warning}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-6 border-t border-white/[0.06]">
                          <Link
                            href={`/accommodation/${result.accommodation.slug}`}
                            className="flex-1 sm:flex-none"
                          >
                            <Button className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:opacity-90 transition-all duration-300 font-light">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                          {result.accommodation.contactInfo.website && (
                            <a
                              href={result.accommodation.contactInfo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5 transition-all duration-300"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Browse All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 p-10 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-purple-500" />
              <span className="text-xs text-purple-400 uppercase tracking-[0.3em]">Explore</span>
              <div className="h-px w-8 bg-purple-500" />
            </div>
            <h3 className="text-2xl font-extralight text-white mb-3">
              Want to explore more options?
            </h3>
            <p className="text-neutral-500 text-sm font-light mb-8 max-w-md mx-auto">
              Browse through all available accommodations in our database
            </p>
            <Link href="/browse">
              <Button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:opacity-90 transition-all duration-300 font-light">
                Browse All Accommodations
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-white/5"
        >
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-8">
              {['UNSW', 'Sydney', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
                <span
                  key={uni}
                  className="text-xs text-neutral-600 uppercase tracking-widest hover:text-neutral-400 transition-colors cursor-default hidden sm:block"
                >
                  {uni}
                </span>
              ))}
            </div>
            <div className="text-xs text-neutral-600 uppercase tracking-widest">
              {totalMatches} Matches Found
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
