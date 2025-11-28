'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QuizPreferences } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  DollarSign,
  Home,
  Star,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  Building2,
  Shield,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Landmark,
  Wrench,
  BookOpen,
  Globe,
  BookMarked,
  Scale,
  PartyPopper,
  LucideIcon,
} from 'lucide-react';

// Quiz questions configuration
const UNIVERSITIES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'UNSW', label: 'University of New South Wales (UNSW)', icon: GraduationCap },
  { value: 'USYD', label: 'University of Sydney', icon: Landmark },
  { value: 'UTS', label: 'University of Technology Sydney', icon: Wrench },
  { value: 'MQ', label: 'Macquarie University', icon: BookOpen },
  { value: 'WSU', label: 'Western Sydney University', icon: Globe },
];

const ACCOMMODATION_TYPES = [
  {
    value: 'on-campus',
    label: 'On Campus',
    description: 'Live right on university grounds',
    icon: Building2,
  },
  {
    value: 'college',
    label: 'Residential College',
    description: 'Traditional college experience with meals',
    icon: Users,
  },
  {
    value: 'off-campus',
    label: 'Off Campus',
    description: 'Independent living near university',
    icon: Home,
  },
  {
    value: 'private',
    label: 'Private Housing',
    description: 'Private rentals and share houses',
    icon: Shield,
  },
];

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room', description: 'Your own private space' },
  { value: 'twin', label: 'Twin Share', description: 'Share with one roommate' },
  { value: 'studio', label: 'Studio', description: 'Self-contained unit' },
  { value: 'ensuite', label: 'Ensuite', description: 'Private bathroom' },
  { value: '1-bedroom', label: '1 Bedroom Apt', description: 'Full apartment' },
];

const AMENITIES = [
  { value: 'wifi', label: 'High-Speed WiFi', icon: Wifi },
  { value: 'gym', label: 'Gym/Fitness', icon: Dumbbell },
  { value: 'meals', label: 'Meal Plan', icon: Utensils },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'laundry', label: 'Laundry', icon: Home },
  { value: 'study-rooms', label: 'Study Rooms', icon: GraduationCap },
];

const PRIORITY_FACTORS = [
  { key: 'cleanliness', label: 'Cleanliness', description: 'How clean the accommodation is' },
  { key: 'location', label: 'Location', description: 'Proximity to campus & transport' },
  { key: 'value', label: 'Value for Money', description: 'Worth what you pay' },
  { key: 'amenities', label: 'Amenities', description: 'Facilities & features available' },
  { key: 'management', label: 'Management', description: 'Responsive & helpful staff' },
  { key: 'safety', label: 'Safety', description: 'Security & peace of mind' },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const TOTAL_STEPS = 7;

export default function QuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz state
  const [preferences, setPreferences] = useState<QuizPreferences>({
    university: '',
    budgetMin: 200,
    budgetMax: 500,
    accommodationType: [],
    priorityFactors: {
      cleanliness: 3,
      location: 3,
      value: 3,
      amenities: 3,
      management: 3,
      safety: 3,
    },
    mustHaveAmenities: [],
    maxDistanceToCampus: 5,
    roomType: '',
    socialPreference: 'balanced',
    moveInDate: '',
  });

  const updatePreference = <K extends keyof QuizPreferences>(key: K, value: QuizPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const updatePriorityFactor = (factor: string, value: number) => {
    setPreferences((prev) => ({
      ...prev,
      priorityFactors: {
        ...prev.priorityFactors,
        [factor]: value,
      },
    }));
  };

  const toggleAccommodationType = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      accommodationType: prev.accommodationType.includes(type)
        ? prev.accommodationType.filter((t) => t !== type)
        : [...prev.accommodationType, type],
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setPreferences((prev) => ({
      ...prev,
      mustHaveAmenities: prev.mustHaveAmenities.includes(amenity)
        ? prev.mustHaveAmenities.filter((a) => a !== amenity)
        : [...prev.mustHaveAmenities, amenity],
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return preferences.university !== '';
      case 2:
        return preferences.budgetMin > 0 && preferences.budgetMax > preferences.budgetMin;
      case 3:
        return preferences.accommodationType.length > 0;
      case 4:
        return preferences.roomType !== '';
      case 5:
        return true; // Priorities are always valid
      case 6:
        return true; // Amenities are optional
      case 7:
        return true; // Social preference has default
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Store preferences in sessionStorage for results page
    sessionStorage.setItem('quizPreferences', JSON.stringify(preferences));

    // Navigate to results page
    router.push('/quiz/results');
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-dark to-black">
      {/* Header */}
      <div className="relative border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-white/60 text-sm">{Math.round(progressPercentage)}% complete</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
          >
            {/* Step 1: University */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-lyra-purple-start/20 to-lyra-purple-end/20 mb-4">
                    <GraduationCap className="w-8 h-8 text-lyra-purple-start" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Which university are you attending?
                  </h2>
                  <p className="text-white/60">
                    We&apos;ll find accommodations close to your campus
                  </p>
                </div>

                <div className="grid gap-3">
                  {UNIVERSITIES.map((uni) => {
                    const Icon = uni.icon;
                    return (
                      <button
                        key={uni.value}
                        onClick={() => updatePreference('university', uni.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                          preferences.university === uni.value
                            ? 'border-lyra-purple-start bg-lyra-purple-start/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${preferences.university === uni.value ? 'text-lyra-purple-start' : 'text-white/60'}`}
                        />
                        <span className="text-white font-medium">{uni.label}</span>
                        {preferences.university === uni.value && (
                          <CheckCircle2 className="w-5 h-5 text-lyra-purple-start ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Budget */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4">
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    What&apos;s your weekly budget?
                  </h2>
                  <p className="text-white/60">Set your comfortable price range per week</p>
                </div>

                <div className="space-y-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      ${preferences.budgetMin} - ${preferences.budgetMax}
                      <span className="text-lg text-white/60 font-normal"> / week</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="budget-min"
                        className="text-white/80 text-sm font-medium mb-2 block"
                      >
                        Minimum Budget
                      </label>
                      <input
                        id="budget-min"
                        type="range"
                        min="100"
                        max="800"
                        step="25"
                        value={preferences.budgetMin}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value < preferences.budgetMax) {
                            updatePreference('budgetMin', value);
                          }
                        }}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lyra-purple-start"
                      />
                      <div className="flex justify-between text-white/40 text-xs mt-1">
                        <span>$100</span>
                        <span>$800</span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="budget-max"
                        className="text-white/80 text-sm font-medium mb-2 block"
                      >
                        Maximum Budget
                      </label>
                      <input
                        id="budget-max"
                        type="range"
                        min="100"
                        max="1000"
                        step="25"
                        value={preferences.budgetMax}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > preferences.budgetMin) {
                            updatePreference('budgetMax', value);
                          }
                        }}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lyra-purple-start"
                      />
                      <div className="flex justify-between text-white/40 text-xs mt-1">
                        <span>$100</span>
                        <span>$1000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Accommodation Type */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4">
                    <Home className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    What type of accommodation interests you?
                  </h2>
                  <p className="text-white/60">Select all that apply</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {ACCOMMODATION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = preferences.accommodationType.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        onClick={() => toggleAccommodationType(type.value)}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-lyra-purple-start bg-lyra-purple-start/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mb-3 ${isSelected ? 'text-lyra-purple-start' : 'text-white/60'}`}
                        />
                        <h3 className="text-white font-semibold mb-1">{type.label}</h3>
                        <p className="text-white/50 text-sm">{type.description}</p>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-lyra-purple-start absolute top-4 right-4" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Room Type */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                    <Home className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    What room type do you prefer?
                  </h2>
                  <p className="text-white/60">Choose your ideal living arrangement</p>
                </div>

                <div className="grid gap-3">
                  {ROOM_TYPES.map((room) => (
                    <button
                      key={room.value}
                      onClick={() => updatePreference('roomType', room.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                        preferences.roomType === room.value
                          ? 'border-lyra-purple-start bg-lyra-purple-start/10'
                          : 'border-white/10 hover:border-white/30 bg-white/5'
                      }`}
                    >
                      <div>
                        <h3 className="text-white font-medium">{room.label}</h3>
                        <p className="text-white/50 text-sm">{room.description}</p>
                      </div>
                      {preferences.roomType === room.value && (
                        <CheckCircle2 className="w-5 h-5 text-lyra-purple-start" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Priority Factors */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-4">
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">What matters most to you?</h2>
                  <p className="text-white/60">
                    Rate each factor from 1 (not important) to 5 (very important)
                  </p>
                </div>

                <div className="space-y-6">
                  {PRIORITY_FACTORS.map((factor) => (
                    <div key={factor.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-medium">{factor.label}</span>
                          <p className="text-white/50 text-xs">{factor.description}</p>
                        </div>
                        <span className="text-lyra-purple-start font-bold">
                          {
                            preferences.priorityFactors[
                              factor.key as keyof typeof preferences.priorityFactors
                            ]
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => updatePriorityFactor(factor.key, value)}
                            className={`flex-1 py-2 rounded-lg transition-all duration-200 ${
                              preferences.priorityFactors[
                                factor.key as keyof typeof preferences.priorityFactors
                              ] >= value
                                ? 'bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end text-white'
                                : 'bg-white/10 text-white/50 hover:bg-white/20'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Must-Have Amenities */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 mb-4">
                    <Sparkles className="w-8 h-8 text-teal-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Any must-have amenities?</h2>
                  <p className="text-white/60">
                    Select amenities that are essential for you (optional)
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {AMENITIES.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = preferences.mustHaveAmenities.includes(amenity.value);
                    return (
                      <button
                        key={amenity.value}
                        onClick={() => toggleAmenity(amenity.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? 'border-lyra-purple-start bg-lyra-purple-start/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isSelected ? 'text-lyra-purple-start' : 'text-white/60'}`}
                        />
                        <span className="text-white font-medium">{amenity.label}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-lyra-purple-start ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <label className="text-white/80 text-sm font-medium mb-3 block">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Maximum distance to campus: {preferences.maxDistanceToCampus} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={preferences.maxDistanceToCampus}
                    onChange={(e) =>
                      updatePreference('maxDistanceToCampus', parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lyra-purple-start"
                  />
                  <div className="flex justify-between text-white/40 text-xs mt-1">
                    <span>1 km</span>
                    <span>15 km</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Social Preference */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 mb-4">
                    <Users className="w-8 h-8 text-pink-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    What&apos;s your social preference?
                  </h2>
                  <p className="text-white/60">
                    This helps us match you with the right environment
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      value: 'quiet',
                      label: 'Quiet & Peaceful',
                      description: 'I prefer a calm environment focused on studies',
                      icon: BookMarked,
                    },
                    {
                      value: 'balanced',
                      label: 'Balanced',
                      description: 'A mix of social activities and quiet time',
                      icon: Scale,
                    },
                    {
                      value: 'social',
                      label: 'Social & Active',
                      description: 'I love meeting people and community events',
                      icon: PartyPopper,
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          updatePreference(
                            'socialPreference',
                            option.value as 'quiet' | 'social' | 'balanced'
                          )
                        }
                        className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                          preferences.socialPreference === option.value
                            ? 'border-lyra-purple-start bg-lyra-purple-start/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            preferences.socialPreference === option.value
                              ? 'bg-lyra-purple-start/20'
                              : 'bg-white/10'
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${preferences.socialPreference === option.value ? 'text-lyra-purple-start' : 'text-white/60'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{option.label}</h3>
                          <p className="text-white/50 text-sm">{option.description}</p>
                        </div>
                        {preferences.socialPreference === option.value && (
                          <CheckCircle2 className="w-6 h-6 text-lyra-purple-start" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get My Recommendations
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
