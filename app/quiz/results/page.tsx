'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
        const response = await api.post<RecommendationResponse>('/recommendations', parsedPreferences);

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
        return <Star className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Star className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Star className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-white/60 font-bold">#{index + 1}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match!';
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Great Match';
    if (score >= 60) return 'Good Match';
    if (score >= 50) return 'Decent Match';
    return 'Partial Match';
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-dark to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute inset-1 rounded-full bg-charcoal-dark" />
            </div>
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-lyra-purple-start animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Finding Your Perfect Match</h2>
          <p className="text-white/60">Our AI is analyzing accommodations based on your preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-dark to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Button onClick={handleRetakeQuiz} className="bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const excellentMatches = recommendations.filter(r => r.score >= 80).length;
  const averageScore = recommendations.length > 0
    ? Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-dark to-black">
      {/* Enhanced Header */}
      <div className="relative border-b border-white/10 bg-gradient-to-r from-lyra-purple-start/10 via-lyra-purple-end/10 to-lyra-purple-start/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <Link
            href="/quiz"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz
          </Link>

          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-lyra-purple-start/20 to-lyra-purple-end/20 border border-lyra-purple-start/30">
                    <Sparkles className="w-7 h-7 text-lyra-purple-start" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">Your Perfect Matches</h1>
                    <p className="text-white/50 text-sm mt-1">Personalized recommendations based on your preferences</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRetakeQuiz}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-lyra-purple-start/10 to-lyra-purple-end/10 border-lyra-purple-start/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-lyra-purple-start/20">
                    <Home className="w-5 h-5 text-lyra-purple-start" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalMatches}</p>
                    <p className="text-white/60 text-sm">Total Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-500/20">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{excellentMatches}</p>
                    <p className="text-white/60 text-sm">Excellent Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-yellow-500/20">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{averageScore}%</p>
                    <p className="text-white/60 text-sm">Avg. Match Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Preference Summary */}
          {preferences && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-lyra-purple-start" />
                  <h3 className="text-lg font-semibold text-white">Your Preferences</h3>
                </div>
                <Separator className="mb-4 bg-white/10" />

                <div className="space-y-4">
                  {/* University */}
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-2 font-medium">University</p>
                    <Badge
                      variant="secondary"
                      className="bg-lyra-purple-start/20 text-lyra-purple-start border-lyra-purple-start/30 hover:bg-lyra-purple-start/30 text-base px-4 py-2"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      {preferences.university}
                    </Badge>
                  </div>

                  {/* Budget */}
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-2 font-medium">Budget Range</p>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-base px-4 py-2"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      ${preferences.budgetMin}-${preferences.budgetMax}/week
                    </Badge>
                  </div>

                  {/* Accommodation Types */}
                  {preferences.accommodationType.length > 0 && (
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wide mb-2 font-medium">Accommodation Type</p>
                      <div className="flex flex-wrap gap-2">
                        {preferences.accommodationType.map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1.5" />
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room Type */}
                  {preferences.roomType && (
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wide mb-2 font-medium">Room Type</p>
                      <Badge
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
                      >
                        <Bed className="w-3.5 h-3.5 mr-1.5" />
                        {preferences.roomType}
                      </Badge>
                    </div>
                  )}

                  {/* Priority Factors */}
                  {preferences.priorityFactors && Object.keys(preferences.priorityFactors).length > 0 && (
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wide mb-2 font-medium">Priority Factors</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(preferences.priorityFactors)
                          .filter(([, value]) => value > 0)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([factor]) => (
                          <Badge
                            key={factor}
                            variant="secondary"
                            className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30"
                          >
                            <Target className="w-3.5 h-3.5 mr-1.5" />
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {recommendations.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Home className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Matches Found</h2>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                We couldn&apos;t find accommodations matching all your criteria. Try adjusting your preferences to see more options.
              </p>
              <Button onClick={handleRetakeQuiz} className="bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end">
                <RefreshCw className="w-4 h-4 mr-2" />
                Adjust Preferences
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Top Recommendations</h2>
                <p className="text-white/60 text-sm">Sorted by best match score</p>
              </div>
              <Badge variant="outline" className="border-white/20 text-white/70">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {recommendations.length} Results
              </Badge>
            </div>

            {/* Recommendation Cards */}
            <div className="space-y-6">
              {recommendations.map((result, index) => (
                <motion.div
                  key={result.accommodation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`bg-white/5 backdrop-blur-md border rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 ${
                    index === 0 ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    <div className="relative lg:w-80 h-48 lg:h-auto flex-shrink-0">
                      {result.accommodation.images && result.accommodation.images.length > 0 && result.accommodation.images[0] ? (
                        <Image
                          src={result.accommodation.images[0]}
                          alt={result.accommodation.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-lyra-purple-start/20 to-lyra-purple-end/20 flex items-center justify-center">
                          <Home className="w-12 h-12 text-white/30" />
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm">
                        {getRankIcon(index)}
                        {index < 3 && (
                          <span className="text-white text-sm font-medium">
                            {index === 0 ? 'Top Pick' : index === 1 ? 'Runner Up' : '3rd Place'}
                          </span>
                        )}
                      </div>

                      {/* Match Score */}
                      <div className="absolute top-3 right-3">
                        <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${getScoreColor(result.score)} text-white font-bold text-sm`}>
                          {result.score}% Match
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{result.accommodation.name}</h3>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{result.accommodation.location.suburb}, {result.accommodation.location.state}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-semibold">
                              {result.accommodation.ratings.overall.toFixed(1)}
                            </span>
                            <span className="text-white/50 text-sm">
                              ({result.accommodation.ratings.totalReviews} reviews)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1 text-green-400">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">
                              {result.accommodation.pricing.min}-{result.accommodation.pricing.max}
                            </span>
                            <span className="text-white/50 text-sm">/week</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Label */}
                      <div className="mb-4">
                        <Badge className={`bg-gradient-to-r ${getScoreColor(result.score)} text-white border-0 px-3 py-1`}>
                          {getScoreLabel(result.score)}
                        </Badge>
                      </div>

                      {/* Match Reasons */}
                      {result.matchReasons.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {result.matchReasons.map((reason, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
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
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {result.warnings.map((warning, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {warning}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        <Link href={`/accommodation/${result.accommodation.slug}`} className="flex-1 sm:flex-none">
                          <Button className="w-full sm:w-auto bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90">
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
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
        <Card className="mt-12 bg-gradient-to-r from-lyra-purple-start/10 via-lyra-purple-end/10 to-lyra-purple-start/10 border-lyra-purple-start/30 backdrop-blur-sm">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold text-white mb-2">Want to explore more options?</h3>
            <p className="text-white/60 mb-4">Browse through all available accommodations in our database</p>
            <Link href="/browse">
              <Button className="bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90">
                Browse All Accommodations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
