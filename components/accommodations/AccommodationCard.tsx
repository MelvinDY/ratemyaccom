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
        whileHover={{
          y: -8,
          boxShadow: '10px 10px 20px rgba(163,177,198,0.4), -10px -10px 20px rgba(255,255,255,0.9)',
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="group relative h-full rounded-2xl bg-[#e0e5ec] overflow-hidden
          shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
      >
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          {/* Placeholder gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100" />

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
          <div className="absolute inset-0 bg-gradient-to-t from-[#e0e5ec] via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {accommodation.featured && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-medium uppercase tracking-[0.15em]
                  shadow-[3px_3px_6px_rgba(0,0,0,0.2)]"
              >
                Featured
              </motion.span>
            )}
            {accommodation.verified && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#e0e5ec]/90 backdrop-blur-md text-slate-700 text-[10px] font-medium uppercase tracking-wider
                  shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Verified
              </motion.span>
            )}
          </div>

          {/* Rating badge - bottom right of image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e0e5ec]/90 backdrop-blur-md
              shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-slate-800 text-sm font-semibold">
              {accommodation.ratings.overall.toFixed(1)}
            </span>
            <span className="text-slate-500 text-xs">({accommodation.ratings.totalReviews})</span>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 p-6">
          {/* University tag */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-6 bg-blue-500" />
            <p className="text-[10px] text-blue-600 uppercase tracking-[0.2em] font-medium">
              {accommodation.university.includes('(')
                ? (accommodation.university.split('(')[1]?.replace(')', '') ??
                  accommodation.university)
                : accommodation.university}
            </p>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1 tracking-tight">
            {accommodation.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
            <MapPin className="w-4 h-4 text-blue-500/70" />
            <span className="font-medium">
              {accommodation.location.suburb} · {accommodation.distance.toCampus}km to campus
            </span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-6">
            {accommodation.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="text-[10px] text-slate-600 px-3 py-1.5 rounded-lg bg-[#e0e5ec] uppercase tracking-wider font-medium
                  shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
              >
                {amenity.name}
              </span>
            ))}
            {accommodation.amenities.length > 3 && (
              <span
                className="text-[10px] text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50 uppercase tracking-wider font-medium
                shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.5)]"
              >
                +{accommodation.amenities.length - 3}
              </span>
            )}
          </div>

          {/* Pricing and CTA */}
          <div className="flex items-end justify-between pt-5 border-t border-slate-300">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">From</p>
              <p className="text-3xl font-bold text-slate-800 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  ${accommodation.pricing.min}
                </span>
                <span className="text-slate-500 text-sm font-medium ml-1">
                  /{accommodation.pricing.period}
                </span>
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl bg-[#e0e5ec] flex items-center justify-center
                shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600
                group-hover:shadow-[4px_4px_8px_rgba(163,177,198,0.4),0_4px_12px_rgba(79,70,229,0.3)]
                transition-all duration-300"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors duration-300" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
