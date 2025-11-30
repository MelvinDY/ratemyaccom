'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Star, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [400, 700], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Hero Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-purple-300/30">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-100">Built for NSW Students</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight"
          >
            <span className="block">Find Your Perfect</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Student Accommodation
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl mt-2">in NSW</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-purple-100/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Real reviews from real students. Make informed decisions about where you&apos;ll call
            home during your university years.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/browse">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 flex items-center gap-2"
              >
                <span>Explore Accommodations</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border-2 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                Find My Perfect Match
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center gap-6 md:gap-10"
          >
            <div className="flex items-center gap-2 text-purple-200/80">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-sm font-medium">Verified Reviews Only</span>
            </div>
            <div className="flex items-center gap-2 text-purple-200/80">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-sm font-medium">5 NSW Universities</span>
            </div>
            <div className="flex items-center gap-2 text-purple-200/80">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Star className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-sm font-medium">6 Rating Categories</span>
            </div>
            <div className="flex items-center gap-2 text-purple-200/80">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-sm font-medium">By Students, For Students</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
    </div>
  );
}
