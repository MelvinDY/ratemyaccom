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
    <div className="min-h-screen bg-[#e0e5ec] pt-24">
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-8">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-slate-500 font-medium">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div
          className="h-2 rounded-full mb-8 bg-[#e0e5ec]
          shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Quiz Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-[#e0e5ec] p-8 sm:p-10
              shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
          >
            {/* Step 1: University */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                      bg-gradient-to-br from-blue-500 to-indigo-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <GraduationCap className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-sm text-blue-600 font-medium uppercase tracking-wider block mb-2">
                    University
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    Which university are you attending?
                  </h2>
                  <p className="text-slate-500">
                    We&apos;ll find accommodations close to your campus
                  </p>
                </div>

                <div className="grid gap-3">
                  {UNIVERSITIES.map((uni) => {
                    const Icon = uni.icon;
                    return (
                      <motion.button
                        key={uni.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => updatePreference('university', uni.value)}
                        className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all duration-300
                          ${
                            preferences.university === uni.value
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]'
                              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]'
                          }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center
                            ${
                              preferences.university === uni.value
                                ? 'bg-white/20'
                                : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)]'
                            }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${preferences.university === uni.value ? 'text-white' : 'text-blue-600'}`}
                          />
                        </div>
                        <span
                          className={`font-medium flex-1 ${preferences.university === uni.value ? 'text-white' : 'text-slate-700'}`}
                        >
                          {uni.label}
                        </span>
                        {preferences.university === uni.value && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                      bg-gradient-to-br from-emerald-500 to-green-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <DollarSign className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-sm text-emerald-600 font-medium uppercase tracking-wider block mb-2">
                    Budget
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    What&apos;s your weekly budget?
                  </h2>
                  <p className="text-slate-500">Set your comfortable price range per week</p>
                </div>

                <div className="space-y-10">
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold text-slate-800 mb-2">
                      <span className="text-emerald-600">${preferences.budgetMin}</span>
                      <span className="text-slate-300 mx-4">—</span>
                      <span className="text-emerald-600">${preferences.budgetMax}</span>
                    </div>
                    <p className="text-slate-500 text-sm uppercase tracking-wider">per week</p>
                  </div>

                  <div className="space-y-8 px-4">
                    <div>
                      <label
                        htmlFor="budget-min"
                        className="text-slate-600 text-sm font-medium mb-4 block"
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
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-[#e0e5ec]
                          shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                      />
                      <div className="flex justify-between text-slate-400 text-xs mt-2">
                        <span>$100</span>
                        <span>$800</span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="budget-max"
                        className="text-slate-600 text-sm font-medium mb-4 block"
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
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-[#e0e5ec]
                          shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                      />
                      <div className="flex justify-between text-slate-400 text-xs mt-2">
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                      bg-gradient-to-br from-cyan-500 to-blue-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <Home className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-sm text-cyan-600 font-medium uppercase tracking-wider block mb-2">
                    Accommodation
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    What type of accommodation interests you?
                  </h2>
                  <p className="text-slate-500">Select all that apply</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {ACCOMMODATION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = preferences.accommodationType.includes(type.value);
                    return (
                      <motion.button
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleAccommodationType(type.value)}
                        className={`relative p-6 rounded-xl text-left transition-all duration-300
                          ${
                            isSelected
                              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]'
                              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]'
                          }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4
                            ${
                              isSelected
                                ? 'bg-white/20'
                                : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)]'
                            }`}
                        >
                          <Icon
                            className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-cyan-600'}`}
                          />
                        </div>
                        <h3
                          className={`font-semibold text-lg mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}
                        >
                          {type.label}
                        </h3>
                        <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {type.description}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-white absolute top-4 right-4" />
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                      bg-gradient-to-br from-violet-500 to-purple-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <Home className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-sm text-violet-600 font-medium uppercase tracking-wider block mb-2">
                    Room Type
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    What room type do you prefer?
                  </h2>
                  <p className="text-slate-500">Choose your ideal living arrangement</p>
                </div>

                <div className="grid gap-3">
                  {ROOM_TYPES.map((room) => (
                    <motion.button
                      key={room.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => updatePreference('roomType', room.value)}
                      className={`w-full p-5 rounded-xl text-left flex items-center justify-between transition-all duration-300
                        ${
                          preferences.roomType === room.value
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]'
                            : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]'
                        }`}
                    >
                      <div>
                        <h3
                          className={`font-semibold text-lg ${preferences.roomType === room.value ? 'text-white' : 'text-slate-800'}`}
                        >
                          {room.label}
                        </h3>
                        <p
                          className={`text-sm ${preferences.roomType === room.value ? 'text-white/80' : 'text-slate-500'}`}
                        >
                          {room.description}
                        </p>
                      </div>
                      {preferences.roomType === room.value && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                      bg-gradient-to-br from-amber-500 to-orange-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <Star className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-sm text-amber-600 font-medium uppercase tracking-wider block mb-2">
                    Priorities
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    What matters most to you?
                  </h2>
                  <p className="text-slate-500">
                    Rate each factor from 1 (not important) to 5 (very important)
                  </p>
                </div>

                <div className="space-y-4">
                  {PRIORITY_FACTORS.map((factor) => (
                    <div
                      key={factor.key}
                      className="p-5 rounded-xl bg-[#e0e5ec]
                        shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-slate-800 font-medium">{factor.label}</span>
                          <p className="text-slate-400 text-xs">{factor.description}</p>
                        </div>
                        <span className="text-amber-600 font-bold text-2xl">
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
                            className={`flex-1 py-3 rounded-xl transition-all duration-300 text-sm font-medium
                              ${
                                preferences.priorityFactors[
                                  factor.key as keyof typeof preferences.priorityFactors
                                ] >= value
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]'
                                  : 'bg-[#e0e5ec] text-slate-500 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]'
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                      bg-gradient-to-br from-teal-500 to-cyan-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-sm text-teal-600 font-medium uppercase tracking-wider block mb-2">
                    Amenities
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    Any must-have amenities?
                  </h2>
                  <p className="text-slate-500">
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleAmenity(amenity.value)}
                        className={`p-5 rounded-xl flex items-center gap-4 transition-all duration-300
                          ${
                            isSelected
                              ? 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]'
                              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]'
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center
                            ${
                              isSelected
                                ? 'bg-white/20'
                                : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)]'
                            }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-teal-600'}`}
                          />
                        </div>
                        <span
                          className={`font-medium flex-1 text-left ${isSelected ? 'text-white' : 'text-slate-700'}`}
                        >
                          {amenity.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </motion.button>
                    );
                  })}
                </div>

                <div
                  className="mt-8 p-5 rounded-xl bg-[#e0e5ec]
                  shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                >
                  <label className="flex items-center gap-3 text-slate-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="font-medium">
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
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-teal-500 bg-[#e0e5ec]
                      shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]"
                  />
                  <div className="flex justify-between text-slate-400 text-xs mt-2">
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
                      bg-gradient-to-br from-pink-500 to-rose-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                  >
                    <Users className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-sm text-pink-600 font-medium uppercase tracking-wider block mb-2">
                    Social
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    What&apos;s your social preference?
                  </h2>
                  <p className="text-slate-500">
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
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() =>
                          updatePreference(
                            'socialPreference',
                            option.value as 'quiet' | 'social' | 'balanced'
                          )
                        }
                        className={`w-full p-6 rounded-xl text-left flex items-center gap-5 transition-all duration-300
                          ${
                            preferences.socialPreference === option.value
                              ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]'
                              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]'
                          }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center
                            ${
                              preferences.socialPreference === option.value
                                ? 'bg-white/20'
                                : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)]'
                            }`}
                        >
                          <Icon
                            className={`w-7 h-7 ${preferences.socialPreference === option.value ? 'text-white' : 'text-pink-600'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-lg mb-1 ${preferences.socialPreference === option.value ? 'text-white' : 'text-slate-800'}`}
                          >
                            {option.label}
                          </h3>
                          <p
                            className={`text-sm ${preferences.socialPreference === option.value ? 'text-white/80' : 'text-slate-500'}`}
                          >
                            {option.description}
                          </p>
                        </div>
                        {preferences.socialPreference === option.value && (
                          <CheckCircle2 className="w-6 h-6 text-white" />
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
            className="px-6 py-3 rounded-xl bg-[#e0e5ec] border-0 text-slate-600 font-medium
              shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
              hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
              disabled:opacity-50 disabled:shadow-none transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-xl font-medium text-white
                bg-gradient-to-br from-blue-500 to-indigo-600
                shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
                disabled:opacity-50 transition-all duration-300"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-medium text-white
                bg-gradient-to-br from-blue-500 to-indigo-600
                shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
                disabled:opacity-50 transition-all duration-300"
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
  );
}
