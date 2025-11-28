'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Star className="w-5 h-5 text-purple-400 fill-purple-400" />;
      case 1:
        return <Star className="w-5 h-5 text-purple-300" />;
      case 2:
        return <Star className="w-5 h-5 text-purple-200" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-zinc-500 font-medium text-sm">
            #{index + 1}
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return 'bg-purple-500';
    }
    if (score >= 60) {
      return 'bg-purple-600';
    }
    return 'bg-purple-700';
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-spin"
              style={{ animationDuration: '3s' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Finding Your Perfect Match</h2>
          <p className="text-zinc-500 text-sm">
            Analyzing accommodations based on your preferences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Something went wrong</h2>
          <p className="text-zinc-500 text-sm mb-6">{error}</p>
          <Button
            onClick={handleRetakeQuiz}
            className="bg-purple-600 hover:bg-purple-700 text-white"
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <Link
            href="/quiz"
            className="inline-flex items-center text-zinc-500 hover:text-zinc-300 transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz
          </Link>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white">Your Perfect Matches</h1>
              </div>
              <p className="text-zinc-500 text-sm">
                Personalized recommendations based on your preferences
              </p>
            </div>

            <Button
              onClick={handleRetakeQuiz}
              variant="outline"
              className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Home className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{totalMatches}</p>
                  <p className="text-zinc-500 text-xs">Total Matches</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{excellentMatches}</p>
                  <p className="text-zinc-500 text-xs">Excellent Matches</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Star className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{averageScore}%</p>
                  <p className="text-zinc-500 text-xs">Avg. Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preference Summary */}
          {preferences && (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Your Preferences</h3>
              </div>
              <Separator className="mb-4 bg-zinc-800" />

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* University */}
                <div>
                  <p className="text-zinc-600 text-xs uppercase tracking-wider mb-2">University</p>
                  <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20">
                    <Building2 className="w-3 h-3 mr-1.5" />
                    {preferences.university}
                  </Badge>
                </div>

                {/* Budget */}
                <div>
                  <p className="text-zinc-600 text-xs uppercase tracking-wider mb-2">Budget</p>
                  <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20">
                    <Wallet className="w-3 h-3 mr-1.5" />${preferences.budgetMin}-$
                    {preferences.budgetMax}
                  </Badge>
                </div>

                {/* Accommodation Types */}
                {preferences.accommodationType.length > 0 && (
                  <div>
                    <p className="text-zinc-600 text-xs uppercase tracking-wider mb-2">Type</p>
                    <div className="flex flex-wrap gap-1">
                      {preferences.accommodationType.map((type) => (
                        <Badge
                          key={type}
                          className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Type */}
                {preferences.roomType && (
                  <div>
                    <p className="text-zinc-600 text-xs uppercase tracking-wider mb-2">Room</p>
                    <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20">
                      <Bed className="w-3 h-3 mr-1.5" />
                      {preferences.roomType}
                    </Badge>
                  </div>
                )}

                {/* Priority Factors */}
                {preferences.priorityFactors &&
                  Object.keys(preferences.priorityFactors).length > 0 && (
                    <div>
                      <p className="text-zinc-600 text-xs uppercase tracking-wider mb-2">
                        Priorities
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(preferences.priorityFactors)
                          .filter(([, value]) => value >= 4)
                          .slice(0, 3)
                          .map(([factor]) => (
                            <Badge
                              key={factor}
                              className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-xs"
                            >
                              {factor}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {recommendations.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl text-center py-16">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">No Matches Found</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
              We couldn&apos;t find accommodations matching your criteria. Try adjusting your
              preferences.
            </p>
            <Button
              onClick={handleRetakeQuiz}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Adjust Preferences
            </Button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-white mb-1">Top Recommendations</h2>
                <p className="text-zinc-500 text-sm">Sorted by best match score</p>
              </div>
              <Badge variant="outline" className="border-zinc-800 text-zinc-500 bg-transparent">
                <Clock className="w-3 h-3 mr-1.5" />
                {recommendations.length} Results
              </Badge>
            </div>

            {/* Recommendation Cards */}
            <div className="space-y-4">
              {recommendations.map((result, index) => (
                <motion.div
                  key={result.accommodation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-zinc-900/30 border rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 ${
                    index === 0 ? 'border-purple-500/50' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    <div className="relative lg:w-72 h-44 lg:h-auto flex-shrink-0">
                      {result.accommodation.images &&
                      result.accommodation.images.length > 0 &&
                      result.accommodation.images[0] ? (
                        <Image
                          src={result.accommodation.images[0]}
                          alt={result.accommodation.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <Home className="w-10 h-10 text-zinc-700" />
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm border border-zinc-800">
                        {getRankIcon(index)}
                        {index < 3 && (
                          <span className="text-zinc-300 text-xs font-medium">
                            {index === 0 ? 'Top Pick' : index === 1 ? 'Runner Up' : '3rd Place'}
                          </span>
                        )}
                      </div>

                      {/* Match Score */}
                      <div className="absolute top-3 right-3">
                        <div
                          className={`px-3 py-1.5 rounded-full ${getScoreColor(result.score)} text-white font-medium text-xs`}
                        >
                          {result.score}% Match
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-1">
                            {result.accommodation.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {result.accommodation.location.suburb},{' '}
                              {result.accommodation.location.state}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                            <span className="text-white font-medium text-sm">
                              {result.accommodation.ratings.overall.toFixed(1)}
                            </span>
                            <span className="text-zinc-600 text-xs">
                              ({result.accommodation.ratings.totalReviews})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1 text-zinc-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="font-medium text-sm">
                              {result.accommodation.pricing.min}-{result.accommodation.pricing.max}
                            </span>
                            <span className="text-zinc-600 text-xs">/week</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Label */}
                      <div className="mb-3">
                        <Badge
                          className={`${getScoreColor(result.score)} text-white border-0 text-xs`}
                        >
                          {getScoreLabel(result.score)}
                        </Badge>
                      </div>

                      {/* Match Reasons */}
                      {result.matchReasons.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {result.matchReasons.map((reason, i) => (
                              <Badge
                                key={i}
                                className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {result.warnings.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {result.warnings.map((warning, i) => (
                              <Badge
                                key={i}
                                className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {warning}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link
                          href={`/accommodation/${result.accommodation.slug}`}
                          className="flex-1 sm:flex-none"
                        >
                          <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-sm">
                            View Details
                            <ArrowRight className="w-3.5 h-3.5 ml-2" />
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
                              className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
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
        <div className="mt-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Want to explore more options?</h3>
          <p className="text-zinc-500 text-sm mb-4">
            Browse through all available accommodations in our database
          </p>
          <Link href="/browse">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Browse All Accommodations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
