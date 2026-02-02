'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import AnimatedJoinButton from './AnimatedJoinButton';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="relative h-screen bg-[#e0e5ec] overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-violet-50/30" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-100/20 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center px-6 sm:px-12 lg:px-24 pt-16">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left side - Content */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full
                bg-[#e0e5ec]
                shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-600">NSW Student Accommodations</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-[1.1] mb-6"
            >
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                Student Home
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-500 mb-10 leading-relaxed"
            >
              Verified reviews from real students across 5 NSW universities.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-md mx-auto lg:mx-0"
            >
              <div
                className="flex items-center p-1.5 rounded-2xl bg-[#e0e5ec]
                shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]"
              >
                <div className="flex items-center gap-3 flex-1 px-4">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search university or suburb..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-slate-700 placeholder:text-slate-400
                      outline-none py-3 text-base"
                  />
                </div>
                <Link href={`/browse${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl font-semibold text-white
                      bg-gradient-to-r from-blue-600 to-indigo-600
                      shadow-[4px_4px_8px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.5),0_4px_15px_rgba(79,70,229,0.3)]
                      hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),0_6px_20px_rgba(79,70,229,0.4)]
                      transition-all duration-200 flex items-center gap-2"
                  >
                    Search
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Secondary link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 flex items-center justify-center lg:justify-start gap-6"
            >
              <Link
                href="/browse"
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                Browse all listings →
              </Link>
              <Link
                href="/quiz"
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                Take the quiz →
              </Link>
            </motion.div>
          </div>

          {/* Right side - Animated Join Button */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="hidden lg:flex items-center justify-center"
          >
            <AnimatedJoinButton />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
