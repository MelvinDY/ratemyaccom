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
    <div className="w-full rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
      {/* Header - Hero style */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Overline accent */}
            <div className="h-px w-8 bg-purple-500" />
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20 flex items-center justify-center"
              >
                <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              </motion.div>
              <div>
                <span className="text-xs text-purple-400 uppercase tracking-[0.2em] font-light block mb-1">
                  Refine
                </span>
                <h2 className="text-xl font-extralight text-white tracking-tight">Filters</h2>
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
              aria-label="Clear all filters"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </motion.button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* University Filter */}
        <div className="space-y-3">
          <Label
            htmlFor="university"
            className="flex items-center gap-3 text-sm font-light text-neutral-300"
          >
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span className="uppercase tracking-wider text-xs">University</span>
          </Label>
          <Select
            value={filters.university || 'All Universities'}
            onValueChange={handleUniversityChange}
          >
            <SelectTrigger
              id="university"
              className="w-full bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/[0.15] focus:border-purple-500/50 focus:ring-0 focus:ring-offset-0 transition-all duration-300 rounded-2xl h-12 font-light"
              aria-label="Filter by university"
            >
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent className="bg-[#151515] border-white/10 rounded-2xl backdrop-blur-xl">
              {UNIVERSITIES.map((uni) => (
                <SelectItem
                  key={uni}
                  value={uni}
                  className="text-neutral-300 hover:bg-white/10 focus:bg-white/10 rounded-xl font-light"
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
            className="flex items-center gap-3 text-sm font-light text-neutral-300"
          >
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="uppercase tracking-wider text-xs">Location</span>
          </Label>
          <input
            id="location"
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="e.g., Kensington, Ultimo"
            className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 hover:bg-white/[0.06] hover:border-white/[0.15] focus:bg-white/[0.06] focus:border-purple-500/50 focus:outline-none transition-all duration-300 rounded-2xl text-sm font-light"
            aria-label="Filter by location"
          />
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-3 text-sm font-light text-neutral-300">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span className="uppercase tracking-wider text-xs">Price Range</span>
            <span className="text-neutral-600 text-xs normal-case tracking-normal">/week</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest pl-1">
                Min
              </span>
              <input
                id="priceMin"
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                placeholder="$0"
                min="0"
                step="50"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 hover:bg-white/[0.06] hover:border-white/[0.15] focus:bg-white/[0.06] focus:border-purple-500/50 focus:outline-none transition-all duration-300 rounded-2xl text-sm font-light"
                aria-label="Minimum price"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest pl-1">
                Max
              </span>
              <input
                id="priceMax"
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                placeholder="$1000"
                min="0"
                step="50"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 hover:bg-white/[0.06] hover:border-white/[0.15] focus:bg-white/[0.06] focus:border-purple-500/50 focus:outline-none transition-all duration-300 rounded-2xl text-sm font-light"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label
            htmlFor="rating"
            className="flex items-center gap-3 text-sm font-light text-neutral-300"
          >
            <Star className="w-4 h-4 text-purple-400" />
            <span className="uppercase tracking-wider text-xs">Min Rating</span>
          </Label>
          <Select value={filters.rating?.toString() || '0'} onValueChange={handleRatingChange}>
            <SelectTrigger
              id="rating"
              className="w-full bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/[0.15] focus:border-purple-500/50 focus:ring-0 focus:ring-offset-0 transition-all duration-300 rounded-2xl h-12 font-light"
              aria-label="Filter by minimum rating"
            >
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent className="bg-[#151515] border-white/10 rounded-2xl backdrop-blur-xl">
              {RATINGS.map((rating) => (
                <SelectItem
                  key={rating.value}
                  value={rating.value}
                  className="text-neutral-300 hover:bg-white/10 focus:bg-white/10 rounded-xl font-light"
                >
                  {rating.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Summary - Hero card style */}
      {hasActiveFilters && (
        <div className="p-6 pt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/[0.12] to-purple-500/[0.04] border border-purple-500/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <p className="text-xs text-purple-400 uppercase tracking-[0.2em]">Active Filters</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.university && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-light bg-white/[0.06] text-white border border-white/[0.1]"
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
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-light bg-white/[0.06] text-white border border-white/[0.1]"
                >
                  {filters.location}
                </motion.span>
              )}
              {filters.priceMin && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-light bg-white/[0.06] text-white border border-white/[0.1]"
                >
                  Min: ${filters.priceMin}
                </motion.span>
              )}
              {filters.priceMax && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-light bg-white/[0.06] text-white border border-white/[0.1]"
                >
                  Max: ${filters.priceMax}
                </motion.span>
              )}
              {filters.rating && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-light bg-white/[0.06] text-white border border-white/[0.1]"
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
