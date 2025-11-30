'use client';

import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters?: () => void;
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-full flex flex-col items-center justify-center py-32 px-4"
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mb-10"
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-3xl"
        />

        {/* Icon container */}
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
          <Search className="h-12 w-12 text-purple-400" strokeWidth={1} />

          {/* Decorative sparkles */}
          <motion.div
            animate={{
              y: [-2, 2, -2],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-5 h-5 text-purple-400/50" />
          </motion.div>
        </div>
      </motion.div>

      {/* Overline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="h-px w-8 bg-purple-500" />
        <span className="text-xs text-purple-400 uppercase tracking-[0.3em] font-light">
          No Results
        </span>
        <div className="h-px w-8 bg-purple-500" />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-4xl font-extralight text-white mb-4 tracking-tight"
      >
        Nothing Found
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-neutral-400 text-center mb-10 max-w-md leading-relaxed font-light"
      >
        We couldn&apos;t find any accommodations matching your criteria. Try adjusting your filters
        or search terms.
      </motion.p>

      {/* Clear filters button */}
      {onClearFilters && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClearFilters}
          className="group flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] text-white hover:border-purple-500/30 hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-300"
        >
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 group-hover:text-purple-400 transition-colors" />
          <span className="text-sm font-light uppercase tracking-wider">Clear All Filters</span>
        </motion.button>
      )}

      {/* Decorative bottom element */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-16 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
      />
    </motion.div>
  );
}
