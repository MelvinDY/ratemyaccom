'use client';

import { motion } from 'framer-motion';

export default function AccommodationCardSkeleton() {
  return (
    <div className="relative h-full rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
      {/* Image skeleton */}
      <div className="relative h-56 bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-violet-900/10 overflow-hidden">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Badge placeholder */}
        <div className="absolute top-4 right-4 h-8 w-20 bg-white/[0.06] rounded-full" />

        {/* Rating placeholder */}
        <div className="absolute bottom-4 right-4 h-9 w-28 bg-black/30 rounded-full backdrop-blur-sm" />
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* University tag placeholder */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-6 bg-purple-500/30" />
          <div className="h-3 bg-purple-500/10 rounded-lg w-16" />
        </div>

        {/* Title skeleton */}
        <div className="h-6 bg-white/[0.06] rounded-lg w-3/4 mb-4" />

        {/* Location skeleton */}
        <div className="h-4 bg-white/[0.04] rounded-lg w-2/3 mb-5" />

        {/* Amenities skeleton */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="h-7 bg-white/[0.04] rounded-full w-16" />
          <div className="h-7 bg-white/[0.04] rounded-full w-20" />
          <div className="h-7 bg-white/[0.04] rounded-full w-14" />
        </div>

        {/* Pricing skeleton */}
        <div className="flex items-end justify-between pt-5 border-t border-white/[0.06]">
          <div className="space-y-2">
            <div className="h-2 bg-white/[0.04] rounded-lg w-10" />
            <div className="h-8 bg-white/[0.06] rounded-lg w-28" />
          </div>
          <div className="w-12 h-12 bg-white/[0.04] rounded-2xl" />
        </div>
      </div>

      {/* Subtle pulse animation overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
