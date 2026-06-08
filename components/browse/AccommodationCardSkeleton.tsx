'use client';

import { motion } from 'framer-motion';

export default function AccommodationCardSkeleton() {
  return (
    <div
      className="relative h-full rounded-2xl bg-[#e0e5ec] overflow-hidden
      shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
    >
      {/* Image skeleton */}
      <div className="relative h-56 bg-gradient-to-br from-blue-100/50 via-slate-100/50 to-indigo-100/50 overflow-hidden rounded-t-2xl">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Badge placeholder */}
        <div
          className="absolute top-4 right-4 h-8 w-20 bg-[#e0e5ec]/80 rounded-xl
          shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
        />

        {/* Rating placeholder */}
        <div
          className="absolute bottom-4 right-4 h-9 w-28 bg-[#e0e5ec]/80 rounded-xl
          shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
        />
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* University tag placeholder */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-6 bg-blue-300" />
          <div className="h-3 bg-blue-100 rounded-lg w-16" />
        </div>

        {/* Title skeleton */}
        <div
          className="h-6 bg-slate-200 rounded-lg w-3/4 mb-4
          shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
        />

        {/* Location skeleton */}
        <div
          className="h-4 bg-slate-200/70 rounded-lg w-2/3 mb-5
          shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
        />

        {/* Amenities skeleton */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div
            className="h-7 bg-[#e0e5ec] rounded-lg w-16
            shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
          />
          <div
            className="h-7 bg-[#e0e5ec] rounded-lg w-20
            shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
          />
          <div
            className="h-7 bg-[#e0e5ec] rounded-lg w-14
            shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
          />
        </div>

        {/* Pricing skeleton */}
        <div className="flex items-end justify-between pt-5 border-t border-slate-300">
          <div className="space-y-2">
            <div className="h-2 bg-slate-200/70 rounded-lg w-10" />
            <div
              className="h-8 bg-slate-200 rounded-lg w-28
              shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
            />
          </div>
          <div
            className="w-12 h-12 bg-[#e0e5ec] rounded-xl
            shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
          />
        </div>
      </div>

      {/* Subtle pulse animation overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100/10 to-transparent pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
