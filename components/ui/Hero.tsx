'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  // Staggered text animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1] as const,
      },
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1] as const,
      },
    },
  };

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1] as const,
      },
    },
  };

  const words = ['Find', 'your', 'perfect'];
  const highlightWords = ['student', 'home.'];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]"
          animate={{
            background: [
              'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Hero Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Link href="/browse">
              <motion.div
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] backdrop-blur-sm rounded-full border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                <span className="text-sm text-neutral-400 font-light tracking-wide">
                  NSW&apos;s Student Housing Platform
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all duration-300" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Main headline with character animation */}
          <div className="mb-8 overflow-hidden perspective-[1000px]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center gap-x-[0.3em] gap-y-2"
            >
              {words.map((word, wordIndex) => (
                <motion.span
                  key={wordIndex}
                  variants={letterVariants}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] font-medium text-white tracking-[-0.04em] leading-[0.95]"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center gap-x-[0.3em] gap-y-2 mt-2"
            >
              {highlightWords.map((word, wordIndex) => (
                <motion.span
                  key={wordIndex}
                  variants={letterVariants}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] font-medium tracking-[-0.04em] leading-[0.95] bg-gradient-to-r from-purple-300 via-violet-400 to-purple-400 bg-clip-text text-transparent"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light tracking-[-0.01em]"
          >
            Verified reviews from real students.
            <br className="hidden sm:block" />
            <span className="text-neutral-500"> Make confident housing decisions.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <Link href="/browse">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative px-8 py-4 bg-white text-black font-medium rounded-full overflow-hidden transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2 text-[15px]">
                  Browse Accommodations
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-100 to-violet-100"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>

            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-transparent text-white font-medium rounded-full border border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02] transition-all duration-300 text-[15px]"
              >
                Take the Quiz
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats with refined animation */}
          <motion.div
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.2 }}
            className="flex justify-center items-center"
          >
            <div className="flex items-center gap-8 sm:gap-12 md:gap-16 px-8 py-6 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.05]">
              {[
                { value: '5', label: 'Universities' },
                { value: '50+', label: 'Listings' },
                { value: '100+', label: 'Reviews' },
              ].map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-8 sm:gap-12 md:gap-16">
                  {index > 0 && (
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-neutral-700 to-transparent" />
                  )}
                  <div className="text-center">
                    <motion.p
                      className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light tracking-wide uppercase">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-light">
              Scroll
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-neutral-600 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
    </div>
  );
}
