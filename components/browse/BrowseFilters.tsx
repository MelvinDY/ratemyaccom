'use client';

import { SearchFilters } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  'Macquarie University',
  'University of Technology Sydney (UTS)',
];

// Rating options
const RATINGS = [
  { label: 'All Ratings', value: '0' },
  { label: '4+ Stars', value: '4' },
  { label: '3+ Stars', value: '3' },
  { label: '2+ Stars', value: '2' },
  { label: '1+ Stars', value: '1' },
];

export default function BrowseFilters({ filters, onFilterChange, onClearFilters }: BrowseFiltersProps) {
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
    <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-lg shadow-black/20 p-6 border border-white/10 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-lyra-purple-start hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* University Filter */}
        <div className="space-y-2">
          <Label htmlFor="university" className="text-sm font-semibold text-white/80">
            University
          </Label>
          <Select
            value={filters.university || 'All Universities'}
            onValueChange={handleUniversityChange}
          >
            <SelectTrigger
              id="university"
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 hover:border-white/20 focus:border-lyra-purple-start/50 focus:ring-2 focus:ring-lyra-purple-start/30 transition-all duration-300 rounded-xl"
              aria-label="Filter by university"
            >
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-light border-white/10 backdrop-blur-md">
              {UNIVERSITIES.map((uni) => (
                <SelectItem key={uni} value={uni} className="text-white hover:bg-white/10 focus:bg-white/10">
                  {uni}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-semibold text-white/80">
            Location
          </Label>
          <Input
            id="location"
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="e.g., Kensington, Ultimo"
            className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-white/40 hover:bg-white/10 hover:border-white/20 focus:bg-white/10 focus:border-lyra-purple-start/50 focus:ring-2 focus:ring-lyra-purple-start/30 transition-all duration-300 rounded-xl"
            aria-label="Filter by location"
          />
        </div>

        {/* Price Range Filter */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-white/80">
            Price Range (per week)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin" className="text-xs text-white/60">
                Min ($)
              </Label>
              <Input
                id="priceMin"
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                placeholder="0"
                min="0"
                step="50"
                className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-white/40 hover:bg-white/10 hover:border-white/20 focus:bg-white/10 focus:border-lyra-purple-start/50 focus:ring-2 focus:ring-lyra-purple-start/30 transition-all duration-300 rounded-xl"
                aria-label="Minimum price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax" className="text-xs text-white/60">
                Max ($)
              </Label>
              <Input
                id="priceMax"
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                placeholder="1000"
                min="0"
                step="50"
                className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-white/40 hover:bg-white/10 hover:border-white/20 focus:bg-white/10 focus:border-lyra-purple-start/50 focus:ring-2 focus:ring-lyra-purple-start/30 transition-all duration-300 rounded-xl"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-2">
          <Label htmlFor="rating" className="text-sm font-semibold text-white/80">
            Minimum Rating
          </Label>
          <Select
            value={filters.rating?.toString() || '0'}
            onValueChange={handleRatingChange}
          >
            <SelectTrigger
              id="rating"
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 hover:border-white/20 focus:border-lyra-purple-start/50 focus:ring-2 focus:ring-lyra-purple-start/30 transition-all duration-300 rounded-xl"
              aria-label="Filter by minimum rating"
            >
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent className="bg-charcoal-light border-white/10 backdrop-blur-md">
              {RATINGS.map((rating) => (
                <SelectItem key={rating.value} value={rating.value} className="text-white hover:bg-white/10 focus:bg-white/10">
                  {rating.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm font-semibold text-white/80 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.university && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-lyra-purple-start/20 to-lyra-purple-end/20 text-lyra-purple-start border border-lyra-purple-start/30">
                {filters.university}
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-lyra-purple-start/20 to-lyra-purple-end/20 text-lyra-purple-start border border-lyra-purple-start/30">
                {filters.location}
              </span>
            )}
            {filters.priceMin && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-lyra-purple-start/20 to-lyra-purple-end/20 text-lyra-purple-start border border-lyra-purple-start/30">
                Min: ${filters.priceMin}
              </span>
            )}
            {filters.priceMax && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-lyra-purple-start/20 to-lyra-purple-end/20 text-lyra-purple-start border border-lyra-purple-start/30">
                Max: ${filters.priceMax}
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-lyra-purple-start/20 to-lyra-purple-end/20 text-lyra-purple-start border border-lyra-purple-start/30">
                {filters.rating}+ Stars
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
