'use client';

import { motion } from 'framer-motion';
import { SearchFilters } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, SlidersHorizontal, MapPin, DollarSign, Star, GraduationCap } from 'lucide-react';

interface BrowseFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

// Common universities in the system
const UNIVERSITIES = [
  'All Universities',
  'University of New South Wales (UNSW)',
  'University of Sydney',
  'University of Technology Sydney (UTS)',
  'Macquarie University',
  'Western Sydney University',
];

// Rating options
const RATINGS = [
  { label: 'All Ratings', value: '0' },
  { label: '4+ Stars', value: '4' },
  { label: '3+ Stars', value: '3' },
  { label: '2+ Stars', value: '2' },
  { label: '1+ Stars', value: '1' },
];

export default function BrowseFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: BrowseFiltersProps) {
  const handleUniversityChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === 'All Universities') {
      delete newFilters.university;
    } else {
      newFilters.university = value;
    }
    onFilterChange(newFilters);
  };

  const handleLocationChange = (value: string) => {
    const newFilters = { ...filters };
    if (value.trim() === '') {
      delete newFilters.location;
    } else {
      newFilters.location = value;
    }
    onFilterChange(newFilters);
  };

  const handlePriceMinChange = (value: string) => {
    const newFilters = { ...filters };
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue === 0) {
      delete newFilters.priceMin;
    } else {
      newFilters.priceMin = numValue;
    }
    onFilterChange(newFilters);
  };

  const handlePriceMaxChange = (value: string) => {
    const newFilters = { ...filters };
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue === 0) {
      delete newFilters.priceMax;
    } else {
      newFilters.priceMax = numValue;
    }
    onFilterChange(newFilters);
  };

  const handleRatingChange = (value: string) => {
    const newFilters = { ...filters };
    const numValue = parseFloat(value);
    if (numValue === 0) {
      delete newFilters.rating;
    } else {
      newFilters.rating = numValue;
    }
    onFilterChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="w-full">
      {/* Header - Neumorphic style */}
      <div className="pb-6 mb-6 border-b border-slate-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Overline accent */}
            <div className="h-px w-8 bg-blue-500" />
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{
                  boxShadow:
                    '8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.9)',
                }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center
                  shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
              >
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <span className="text-xs text-blue-600 uppercase tracking-[0.2em] font-medium block mb-1">
                  Refine
                </span>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Filters</h2>
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600
                bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]
                hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)]
                transition-all duration-300"
              aria-label="Clear all filters"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </motion.button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* University Filter */}
        <div className="space-y-3">
          <Label
            htmlFor="university"
            className="flex items-center gap-3 text-sm font-medium text-slate-700"
          >
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span className="uppercase tracking-wider text-xs">University</span>
          </Label>
          <Select
            value={filters.university || 'All Universities'}
            onValueChange={handleUniversityChange}
          >
            <SelectTrigger
              id="university"
              className="w-full bg-[#e0e5ec] border-0 text-slate-700
                shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
                focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0
                transition-all duration-300 rounded-xl h-12 font-medium"
              aria-label="Filter by university"
            >
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent className="bg-[#e0e5ec] border-slate-300 rounded-xl shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]">
              {UNIVERSITIES.map((uni) => (
                <SelectItem
                  key={uni}
                  value={uni}
                  className="text-slate-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg font-medium"
                >
                  {uni}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <Label
            htmlFor="location"
            className="flex items-center gap-3 text-sm font-medium text-slate-700"
          >
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="uppercase tracking-wider text-xs">Location</span>
          </Label>
          <input
            id="location"
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="e.g., Kensington, Ultimo"
            className="w-full px-5 py-3.5 bg-[#e0e5ec] border-0 text-slate-700 placeholder:text-slate-400
              shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
              hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
              focus:ring-2 focus:ring-blue-500/30 focus:outline-none
              transition-all duration-300 rounded-xl text-sm font-medium"
            aria-label="Filter by location"
          />
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="uppercase tracking-wider text-xs">Price Range</span>
            <span className="text-slate-400 text-xs normal-case tracking-normal">/week</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Min</span>
              <input
                id="priceMin"
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                placeholder="$0"
                min="0"
                step="50"
                className="w-full px-4 py-3 bg-[#e0e5ec] border-0 text-slate-700 placeholder:text-slate-400
                  shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                  hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
                  focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
                  focus:ring-2 focus:ring-blue-500/30 focus:outline-none
                  transition-all duration-300 rounded-xl text-sm font-medium"
                aria-label="Minimum price"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest pl-1">Max</span>
              <input
                id="priceMax"
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                placeholder="$1000"
                min="0"
                step="50"
                className="w-full px-4 py-3 bg-[#e0e5ec] border-0 text-slate-700 placeholder:text-slate-400
                  shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                  hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
                  focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
                  focus:ring-2 focus:ring-blue-500/30 focus:outline-none
                  transition-all duration-300 rounded-xl text-sm font-medium"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label
            htmlFor="rating"
            className="flex items-center gap-3 text-sm font-medium text-slate-700"
          >
            <Star className="w-4 h-4 text-blue-500" />
            <span className="uppercase tracking-wider text-xs">Min Rating</span>
          </Label>
          <Select value={filters.rating?.toString() || '0'} onValueChange={handleRatingChange}>
            <SelectTrigger
              id="rating"
              className="w-full bg-[#e0e5ec] border-0 text-slate-700
                shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
                focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0
                transition-all duration-300 rounded-xl h-12 font-medium"
              aria-label="Filter by minimum rating"
            >
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent className="bg-[#e0e5ec] border-slate-300 rounded-xl shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]">
              {RATINGS.map((rating) => (
                <SelectItem
                  key={rating.value}
                  value={rating.value}
                  className="text-slate-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg font-medium"
                >
                  {rating.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Summary - Neumorphic style */}
      {hasActiveFilters && (
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-[#e0e5ec]
              shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs text-blue-600 uppercase tracking-[0.2em] font-medium">
                Active Filters
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.university && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium
                    bg-[#e0e5ec] text-slate-700
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  {filters.university.includes('(')
                    ? (filters.university.split('(')[1]?.replace(')', '') ?? filters.university)
                    : filters.university}
                </motion.span>
              )}
              {filters.location && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium
                    bg-[#e0e5ec] text-slate-700
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  {filters.location}
                </motion.span>
              )}
              {filters.priceMin && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium
                    bg-[#e0e5ec] text-slate-700
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  Min: ${filters.priceMin}
                </motion.span>
              )}
              {filters.priceMax && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium
                    bg-[#e0e5ec] text-slate-700
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  Max: ${filters.priceMax}
                </motion.span>
              )}
              {filters.rating && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium
                    bg-[#e0e5ec] text-slate-700
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  {filters.rating}+ Stars
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
