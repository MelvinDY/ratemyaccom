'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MessageSquare, ShieldCheck, Filter, Image, Info, Scale } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Real Student Reviews',
    description:
      'Read authentic experiences from students who have lived in the accommodation. No fake reviews, just honest feedback.',
    gradient: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Students Only',
    description:
      'All reviewers are verified with their university email addresses, ensuring genuine and trustworthy feedback.',
    gradient: 'from-pink-500 to-purple-600',
    bgGlow: 'bg-pink-500/20',
  },
  {
    icon: Filter,
    title: 'Comprehensive Filters',
    description:
      'Find exactly what you need with advanced filters for location, price range, ratings, amenities, and more.',
    gradient: 'from-purple-600 to-indigo-500',
    bgGlow: 'bg-indigo-500/20',
  },
  {
    icon: Image,
    title: 'Photo Galleries',
    description:
      'Browse through extensive photo galleries uploaded by students to see what accommodations really look like.',
    gradient: 'from-indigo-500 to-blue-500',
    bgGlow: 'bg-blue-500/20',
  },
  {
    icon: Info,
    title: 'Detailed Information',
    description:
      'Access comprehensive details about each accommodation including amenities, facilities, transport links, and nearby services.',
    gradient: 'from-blue-500 to-purple-500',
    bgGlow: 'bg-purple-500/20',
  },
  {
    icon: Scale,
    title: 'Compare Accommodations',
    description:
      'Side-by-side comparison tool to help you make the best decision based on price, location, ratings, and features.',
    gradient: 'from-pink-600 to-purple-500',
    bgGlow: 'bg-pink-600/20',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-gray-900 overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-md rounded-full border border-purple-300/30 mb-6"
          >
            <span className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
              Features
            </span>
          </motion.div>
          <h2
            id="features-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6"
          >
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Find Your Home
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-purple-100/80 max-w-3xl mx-auto">
            Discover how Rate My Accom helps students make informed decisions about their
            accommodation.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Glow effect on hover */}
              <div
                className={`absolute inset-0 ${feature.bgGlow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                aria-hidden="true"
              />

              {/* Card */}
              <div className="relative h-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                {/* Icon */}
                <div className="mb-6">
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  >
                    <feature.icon
                      className="w-8 h-8 text-white"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-purple-100/70 leading-relaxed">{feature.description}</p>
                </div>

                {/* Decorative corner accent */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-bl-full rounded-tr-2xl`}
                  aria-hidden="true"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
