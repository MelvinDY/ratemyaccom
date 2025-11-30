'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Accommodation } from '@/types';
import { CheckCircle2, Star, MapPin, ArrowUpRight } from 'lucide-react';

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export default function AccommodationCard({ accommodation }: AccommodationCardProps) {
  return (
    <Link href={`/accommodation/${accommodation.slug}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="group relative h-full rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] hover:border-purple-500/30 overflow-hidden backdrop-blur-sm"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          {/* Placeholder gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-violet-900/40" />

          {/* Accommodation Image */}
          {accommodation.images && accommodation.images.length > 0 && accommodation.images[0] && (
            <Image
              src={accommodation.images[0]}
              alt={accommodation.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {accommodation.featured && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white text-[10px] font-medium uppercase tracking-[0.15em] shadow-lg shadow-purple-500/30"
              >
                Featured
              </motion.span>
            )}
            {accommodation.verified && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-wider border border-white/20"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified
              </motion.span>
            )}
          </div>

          {/* Rating badge - bottom right of image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-sm font-light">
              {accommodation.ratings.overall.toFixed(1)}
            </span>
            <span className="text-neutral-500 text-xs">({accommodation.ratings.totalReviews})</span>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 p-6">
          {/* University tag */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-6 bg-purple-500" />
            <p className="text-[10px] text-purple-400 uppercase tracking-[0.2em] font-light">
              {accommodation.university.includes('(')
                ? (accommodation.university.split('(')[1]?.replace(')', '') ??
                  accommodation.university)
                : accommodation.university}
            </p>
          </div>

          {/* Title */}
          <h3 className="text-xl font-light text-white mb-4 group-hover:text-purple-200 transition-colors duration-300 line-clamp-1 tracking-tight">
            {accommodation.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-neutral-400 mb-5">
            <MapPin className="w-4 h-4 text-purple-400/70" />
            <span className="font-light">
              {accommodation.location.suburb} · {accommodation.distance.toCampus}km to campus
            </span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-6">
            {accommodation.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="text-[10px] text-neutral-400 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] uppercase tracking-wider font-light"
              >
                {amenity.name}
              </span>
            ))}
            {accommodation.amenities.length > 3 && (
              <span className="text-[10px] text-purple-400 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 uppercase tracking-wider font-light">
                +{accommodation.amenities.length - 3}
              </span>
            )}
          </div>

          {/* Pricing and CTA */}
          <div className="flex items-end justify-between pt-5 border-t border-white/[0.06]">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-1">From</p>
              <p className="text-3xl font-extralight text-white tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                  ${accommodation.pricing.min}
                </span>
                <span className="text-neutral-500 text-sm font-light ml-1">
                  /{accommodation.pricing.period}
                </span>
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500/20 group-hover:to-violet-500/10 group-hover:border-purple-500/30 transition-all duration-300"
            >
              <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-purple-400 transition-colors duration-300" />
            </motion.div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </Link>
  );
}
