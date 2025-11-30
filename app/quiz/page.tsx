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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar - matching Hero.tsx */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center px-6 sm:px-12 lg:px-20 py-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-neutral-500 uppercase tracking-widest">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="px-6 sm:px-12 lg:px-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="flex-1 flex items-center px-6 sm:px-12 lg:px-20 py-12">
          <div className="w-full max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] p-8 sm:p-10 backdrop-blur-sm"
              >
                {/* Step 1: University */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20 mb-6"
                      >
                        <GraduationCap className="w-10 h-10 text-purple-400" />
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-purple-500" />
                        <span className="text-xs text-purple-400 uppercase tracking-[0.3em]">
                          University
                        </span>
                        <div className="h-px w-8 bg-purple-500" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3">
                        Which university are you attending?
                      </h2>
                      <p className="text-neutral-400 font-light">
                        We&apos;ll find accommodations close to your campus
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {UNIVERSITIES.map((uni) => {
                        const Icon = uni.icon;
                        return (
                          <motion.button
                            key={uni.value}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => updatePreference('university', uni.value)}
                            className={`w-full p-5 rounded-2xl border transition-all duration-300 text-left flex items-center gap-4 ${
                              preferences.university === uni.value
                                ? 'border-purple-500/50 bg-purple-500/10'
                                : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04]'
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                preferences.university === uni.value
                                  ? 'bg-purple-500/20'
                                  : 'bg-white/[0.05]'
                              }`}
                            >
                              <Icon
                                className={`w-6 h-6 ${preferences.university === uni.value ? 'text-purple-400' : 'text-neutral-500'}`}
                              />
                            </div>
                            <span className="text-white font-light flex-1">{uni.label}</span>
                            {preferences.university === uni.value && (
                              <CheckCircle2 className="w-5 h-5 text-purple-400" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Budget */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 mb-6"
                      >
                        <DollarSign className="w-10 h-10 text-emerald-400" />
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-emerald-500" />
                        <span className="text-xs text-emerald-400 uppercase tracking-[0.3em]">
                          Budget
                        </span>
                        <div className="h-px w-8 bg-emerald-500" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3">
                        What&apos;s your weekly budget?
                      </h2>
                      <p className="text-neutral-400 font-light">
                        Set your comfortable price range per week
                      </p>
                    </div>

                    <div className="space-y-10">
                      <div className="text-center">
                        <div className="text-5xl sm:text-6xl font-extralight text-white mb-2">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                            ${preferences.budgetMin}
                          </span>
                          <span className="text-neutral-600 mx-4">—</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                            ${preferences.budgetMax}
                          </span>
                        </div>
                        <p className="text-neutral-500 text-sm uppercase tracking-widest">
                          per week
                        </p>
                      </div>

                      <div className="space-y-8 px-4">
                        <div>
                          <label
                            htmlFor="budget-min"
                            className="text-neutral-400 text-xs uppercase tracking-widest mb-4 block"
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
                            className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-emerald-500"
                          />
                          <div className="flex justify-between text-neutral-600 text-xs mt-2">
                            <span>$100</span>
                            <span>$800</span>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="budget-max"
                            className="text-neutral-400 text-xs uppercase tracking-widest mb-4 block"
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
                            className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-emerald-500"
                          />
                          <div className="flex justify-between text-neutral-600 text-xs mt-2">
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
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 mb-6"
                      >
                        <Home className="w-10 h-10 text-blue-400" />
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-blue-500" />
                        <span className="text-xs text-blue-400 uppercase tracking-[0.3em]">
                          Accommodation
                        </span>
                        <div className="h-px w-8 bg-blue-500" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3">
                        What type of accommodation interests you?
                      </h2>
                      <p className="text-neutral-400 font-light">Select all that apply</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {ACCOMMODATION_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = preferences.accommodationType.includes(type.value);
                        return (
                          <motion.button
                            key={type.value}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAccommodationType(type.value)}
                            className={`relative p-6 rounded-2xl border transition-all duration-300 text-left ${
                              isSelected
                                ? 'border-blue-500/50 bg-blue-500/10'
                                : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04]'
                            }`}
                          >
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                                isSelected ? 'bg-blue-500/20' : 'bg-white/[0.05]'
                              }`}
                            >
                              <Icon
                                className={`w-7 h-7 ${isSelected ? 'text-blue-400' : 'text-neutral-500'}`}
                              />
                            </div>
                            <h3 className="text-white font-light text-lg mb-1">{type.label}</h3>
                            <p className="text-neutral-500 text-sm font-light">
                              {type.description}
                            </p>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-blue-400 absolute top-4 right-4" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 4: Room Type */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 mb-6"
                      >
                        <Home className="w-10 h-10 text-violet-400" />
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-violet-500" />
                        <span className="text-xs text-violet-400 uppercase tracking-[0.3em]">
                          Room Type
                        </span>
                        <div className="h-px w-8 bg-violet-500" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3">
                        What room type do you prefer?
                      </h2>
                      <p className="text-neutral-400 font-light">
                        Choose your ideal living arrangement
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {ROOM_TYPES.map((room) => (
                        <motion.button
                          key={room.value}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => updatePreference('roomType', room.value)}
                          className={`w-full p-5 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between ${
                            preferences.roomType === room.value
                              ? 'border-violet-500/50 bg-violet-500/10'
                              : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div>
                            <h3 className="text-white font-light text-lg">{room.label}</h3>
                            <p className="text-neutral-500 text-sm font-light">
                              {room.description}
                            </p>
                          </div>
                          {preferences.roomType === room.value && (
                            <CheckCircle2 className="w-5 h-5 text-violet-400" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Priority Factors */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20 mb-6"
                      >
                        <Star className="w-10 h-10 text-amber-400" />
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-amber-500" />
                        <span className="text-xs text-amber-400 uppercase tracking-[0.3em]">
                          Priorities
                        </span>
                        <div className="h-px w-8 bg-amber-500" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3">
                        What matters most to you?
                      </h2>
                      <p className="text-neutral-400 font-light">
                        Rate each factor from 1 (not important) to 5 (very important)
                      </p>
                    </div>

                    <div className="space-y-6">
                      {PRIORITY_FACTORS.map((factor) => (
                        <div
                          key={factor.key}
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <span className="text-white font-light">{factor.label}</span>
                              <p className="text-neutral-600 text-xs">{factor.description}</p>
                            </div>
                            <span className="text-amber-400 font-light text-2xl">
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
                                className={`flex-1 py-3 rounded-xl transition-all duration-300 text-sm font-light ${
                                  preferences.priorityFactors[
                                    factor.key as keyof typeof preferences.priorityFactors
                                  ] >= value
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                    : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08]'
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
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20 mb-6"
                      >
                        <Sparkles className="w-10 h-10 text-teal-400" />
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-teal-500" />
                        <span className="text-xs text-teal-400 uppercase tracking-[0.3em]">
                          Amenities
                        </span>
                        <div className="h-px w-8 bg-teal-500" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3">
                        Any must-have amenities?
                      </h2>
                      <p className="text-neutral-400 font-light">
                        Select amenities that are essential for you (optional)
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {AMENITIES.map((amenity) => {
                        const Icon = amenity.icon;
                        const isSelected = preferences.mustHaveAmenities.includes(amenity.value);
                        return (
                          <motion.button
                            key={amenity.value}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAmenity(amenity.value)}
                            className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                              isSelected
                                ? 'border-teal-500/50 bg-teal-500/10'
                                : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04]'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-teal-500/20' : 'bg-white/[0.05]'
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${isSelected ? 'text-teal-400' : 'text-neutral-500'}`}
                              />
                            </div>
                            <span className="text-white font-light flex-1 text-left">
                              {amenity.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <label className="flex items-center gap-3 text-neutral-400 text-sm mb-4">
                        <MapPin className="w-4 h-4 text-teal-400" />
                        <span className="uppercase tracking-widest text-xs">
                          Maximum distance to campus: {preferences.maxDistanceToCampus} km
                        </span>
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
                        className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-neutral-600 text-xs mt-2">
                        <span>1 km</span>
                        <span>15 km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Social Preference */}
                {currentStep === 7 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/20 mb-6"
                      >
                        <Users className="w-10 h-10 text-pink-400" />
                      </motion.div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-8 bg-pink-500" />
                        <span className="text-xs text-pink-400 uppercase tracking-[0.3em]">
                          Social
                        </span>
                        <div className="h-px w-8 bg-pink-500" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3">
                        What&apos;s your social preference?
                      </h2>
                      <p className="text-neutral-400 font-light">
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
                          <motion.button
                            key={option.value}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() =>
                              updatePreference(
                                'socialPreference',
                                option.value as 'quiet' | 'social' | 'balanced'
                              )
                            }
                            className={`w-full p-6 rounded-2xl border transition-all duration-300 text-left flex items-center gap-5 ${
                              preferences.socialPreference === option.value
                                ? 'border-pink-500/50 bg-pink-500/10'
                                : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04]'
                            }`}
                          >
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                preferences.socialPreference === option.value
                                  ? 'bg-pink-500/20'
                                  : 'bg-white/[0.05]'
                              }`}
                            >
                              <Icon
                                className={`w-7 h-7 ${preferences.socialPreference === option.value ? 'text-pink-400' : 'text-neutral-500'}`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-light text-lg mb-1">{option.label}</h3>
                              <p className="text-neutral-500 text-sm font-light">
                                {option.description}
                              </p>
                            </div>
                            {preferences.socialPreference === option.value && (
                              <CheckCircle2 className="w-6 h-6 text-pink-400" />
                            )}
                          </motion.button>
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
                className="px-6 py-3 rounded-full bg-transparent border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5 disabled:opacity-30 disabled:border-neutral-800 transition-all duration-300 font-light"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:opacity-90 disabled:opacity-30 transition-all duration-300 font-light"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:opacity-90 disabled:opacity-50 transition-all duration-300 font-light"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Finding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get My Recommendations
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar - matching Hero.tsx */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-white/5"
        >
          <div className="max-w-4xl mx-auto flex justify-between items-center">
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
              Find Your Perfect Home
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
