'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MessageSquare, ShieldCheck, Filter, Image, Info, Scale } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Real Reviews',
    description: 'Authentic experiences from students who have lived there. No fake reviews.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Students',
    description: 'All reviewers verified with university email addresses for trustworthy feedback.',
  },
  {
    icon: Filter,
    title: 'Smart Filters',
    description:
      'Find exactly what you need with advanced filtering by location, price, and amenities.',
  },
  {
    icon: Image,
    title: 'Photo Galleries',
    description: 'Browse student-uploaded photos to see what accommodations really look like.',
  },
  {
    icon: Info,
    title: 'Detailed Info',
    description: 'Comprehensive details including amenities, transport links, and nearby services.',
  },
  {
    icon: Scale,
    title: 'Easy Comparison',
    description: 'Compare options side-by-side based on price, location, ratings, and features.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 bg-neutral-950 overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-purple-400 text-sm font-medium tracking-wide uppercase mb-4">
            Features
          </p>
          <h2
            id="features-heading"
            className="text-4xl sm:text-5xl font-semibold text-white mb-6 tracking-tight"
          >
            Everything you need.
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Powerful tools to help you find the perfect student accommodation.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="group">
              <div className="relative h-full bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-300">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-300">
                  <feature.icon
                    className="w-6 h-6 text-neutral-400 group-hover:text-purple-400 transition-colors"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
