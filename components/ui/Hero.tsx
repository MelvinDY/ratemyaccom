'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]"
        animate={{
          y: [0, 20, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center px-6 sm:px-12 lg:px-20 py-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-neutral-500 uppercase tracking-widest">Live</span>
          </div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">Est. 2024</div>
        </motion.div>

        {/* Hero content */}
        <div className="flex-1 flex items-center px-6 sm:px-12 lg:px-20 pb-20">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left column - Typography */}
              <div>
                {/* Overline */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-4 mb-8"
                >
                  <div className="h-px w-12 bg-purple-500" />
                  <span className="text-sm text-purple-400 uppercase tracking-[0.3em] font-light">
                    NSW Universities
                  </span>
                </motion.div>

                {/* Main headline */}
                <div className="space-y-2 mb-8">
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extralight text-white leading-[0.9] tracking-[-0.03em]"
                  >
                    Student
                  </motion.h1>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extralight leading-[0.9] tracking-[-0.03em]"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400">
                      Housing
                    </span>
                  </motion.h1>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extralight text-white leading-[0.9] tracking-[-0.03em]"
                  >
                    Reviews
                  </motion.h1>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="text-lg text-neutral-400 max-w-md leading-relaxed font-light mb-10"
                >
                  Discover verified reviews from real students. Find your perfect accommodation with
                  confidence.
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link href="/browse">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-sm uppercase tracking-wider hover:bg-purple-100 transition-colors"
                    >
                      Explore
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </motion.button>
                  </Link>
                  <Link href="/quiz">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 text-white rounded-full font-medium text-sm uppercase tracking-wider border border-neutral-700 hover:border-neutral-500 hover:bg-white/5 transition-all"
                    >
                      Take Quiz
                    </motion.button>
                  </Link>
                </motion.div>
              </div>

              {/* Right column - Stats cards */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative"
              >
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="col-span-2 p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-neutral-500 uppercase tracking-widest">
                        Total Reviews
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-purple-400 fill-purple-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-5xl sm:text-6xl font-extralight text-white">100+</p>
                    <p className="text-sm text-neutral-500 mt-2">Verified student reviews</p>
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20"
                  >
                    <p className="text-4xl sm:text-5xl font-extralight text-white mb-2">5</p>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider">
                      Universities
                    </p>
                  </motion.div>

                  {/* Card 3 */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10"
                  >
                    <p className="text-4xl sm:text-5xl font-extralight text-white mb-2">50+</p>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider">Listings</p>
                  </motion.div>

                  {/* Card 4 - Feature highlight */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Verified Only</p>
                        <p className="text-sm text-neutral-500">All reviews from real students</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-white/5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              {['UNSW', 'Sydney', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
                <span
                  key={uni}
                  className="text-xs text-neutral-600 uppercase tracking-widest hover:text-neutral-400 transition-colors cursor-default"
                >
                  {uni}
                </span>
              ))}
            </div>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs text-neutral-600 uppercase tracking-widest"
            >
              Scroll to explore
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
