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
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-blue-400/20 rounded-3xl blur-3xl"
        />

        {/* Icon container - Neumorphic style */}
        <div className="relative w-28 h-28 rounded-3xl bg-[#e0e5ec] flex items-center justify-center
          shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)]">
          <Search className="h-12 w-12 text-blue-500" strokeWidth={1} />

          {/* Decorative sparkles */}
          <motion.div
            animate={{
              y: [-2, 2, -2],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-5 h-5 text-blue-400/60" />
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
        <div className="h-px w-8 bg-blue-500" />
        <span className="text-xs text-blue-600 uppercase tracking-[0.3em] font-medium">
          No Results
        </span>
        <div className="h-px w-8 bg-blue-500" />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-4xl font-bold text-slate-800 mb-4 tracking-tight"
      >
        Nothing Found
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-slate-500 text-center mb-10 max-w-md leading-relaxed font-medium"
      >
        We couldn&apos;t find any accommodations matching your criteria. Try adjusting your filters
        or search terms.
      </motion.p>

      {/* Clear filters button - Neumorphic style */}
      {onClearFilters && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{
            scale: 1.02,
            y: -2,
            boxShadow:
              '8px 8px 16px rgba(163,177,198,0.4), -8px -8px 16px rgba(255,255,255,0.9)',
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onClearFilters}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#e0e5ec] text-slate-700
            shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
            hover:text-blue-600 transition-all duration-300"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
          <span className="text-sm font-medium uppercase tracking-wider">Clear All Filters</span>
        </motion.button>
      )}

      {/* Decorative bottom element */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-16 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
      />
    </motion.div>
  );
}
