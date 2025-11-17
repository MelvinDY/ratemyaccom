'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Star,
  DollarSign,
  Users,
  Building2,
  CheckCircle2,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Accommodation } from '@/types';
import { cn } from '@/lib/utils';

interface ModalListProps {
  items: Accommodation[];
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  onItemClick?: (item: Accommodation) => void;
  showFilters?: boolean;
  maxHeight?: string;
}

export function ModalList({
  items,
  title = 'Browse Accommodations',
  description = 'Explore student accommodations across NSW universities',
  trigger,
  onItemClick,
  showFilters = true,
  maxHeight = '600px',
}: ModalListProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'on-campus' | 'off-campus'>('all');
  const [sortBy, setSortBy] = React.useState<'rating' | 'price-low' | 'price-high'>('rating');

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.ratings?.overall || 0) - (a.ratings?.overall || 0);
        case 'price-low':
          return a.pricing.min - b.pricing.min;
        case 'price-high':
          return b.pricing.max - a.pricing.max;
        default:
          return 0;
      }
    });

    return sorted;
  }, [items, searchQuery, filterType, sortBy]);

  const handleItemClick = (item: Accommodation) => {
    if (onItemClick) {
      onItemClick(item);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Building2 className="mr-2 h-5 w-5" />
            Browse All Accommodations
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-purple-500/20">
          <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
          <DialogDescription className="text-purple-200">{description}</DialogDescription>
        </DialogHeader>

        {showFilters && (
          <div className="px-6 py-4 border-b border-purple-500/20 bg-white/5">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                <input
                  type="text"
                  placeholder="Search accommodations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-purple-300" />
                  <span className="text-sm text-purple-200">Filter:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={cn(
                      'h-7 px-3 text-xs',
                      filterType === 'all'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-purple-200 hover:bg-white/10'
                    )}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterType('on-campus')}
                    className={cn(
                      'h-7 px-3 text-xs',
                      filterType === 'on-campus'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-purple-200 hover:bg-white/10'
                    )}
                  >
                    On-Campus
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterType('off-campus')}
                    className={cn(
                      'h-7 px-3 text-xs',
                      filterType === 'off-campus'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-purple-200 hover:bg-white/10'
                    )}
                  >
                    Off-Campus
                  </Button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-purple-200">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'rating' | 'price-low' | 'price-high')
                    }
                    className="h-7 px-3 text-xs bg-white/10 border border-purple-500/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="rating" className="bg-slate-800">
                      Highest Rated
                    </option>
                    <option value="price-low" className="bg-slate-800">
                      Price: Low to High
                    </option>
                    <option value="price-high" className="bg-slate-800">
                      Price: High to Low
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="px-6" style={{ height: maxHeight }}>
          <div className="py-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <Search className="h-12 w-12 text-purple-300/50 mx-auto mb-4" />
                  <p className="text-purple-200 text-lg">No accommodations found</p>
                  <p className="text-purple-300/70 text-sm mt-2">
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      layout
                    >
                      <button
                        onClick={() => handleItemClick(item)}
                        className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-0.5"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                              <Building2 className="h-8 w-8 text-purple-300" />
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors line-clamp-1">
                                    {item.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-purple-300">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="line-clamp-1">
                                      {item.location.suburb}, {item.location.state}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                  {item.verified && (
                                    <Badge
                                      variant="default"
                                      className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30"
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'border-purple-500/30',
                                      item.type === 'on-campus'
                                        ? 'bg-purple-500/20 text-purple-200'
                                        : 'bg-pink-500/20 text-pink-200 border-pink-500/30'
                                    )}
                                  >
                                    {item.type === 'on-campus' ? 'On Campus' : 'Off Campus'}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-sm text-purple-200/80 line-clamp-2 mb-3">
                                {item.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5 text-yellow-400">
                                  <Star className="h-4 w-4 fill-yellow-400" />
                                  <span className="font-semibold">
                                    {item.ratings?.overall.toFixed(1) || 'N/A'}
                                  </span>
                                  <span className="text-purple-300">
                                    ({item.ratings?.totalReviews || 0} reviews)
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-green-400">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-semibold">
                                    ${item.pricing.min}-${item.pricing.max}
                                  </span>
                                  <span className="text-purple-300">/{item.pricing.period}</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-blue-400">
                                  <Users className="h-4 w-4" />
                                  <span className="font-semibold">{item.capacity}</span>
                                  <span className="text-purple-300">capacity</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-purple-500/20 bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-200">
              Showing {filteredItems.length} of {items.length} accommodations
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-purple-200 hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
