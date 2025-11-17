'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Target, Award, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Users,
    number: '5,000+',
    label: 'Active Students',
    description: 'Verified students contributing reviews',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    number: '200+',
    label: 'Accommodations',
    description: 'Across NSW universities',
    gradient: 'from-pink-500 to-purple-600',
  },
  {
    icon: TrendingUp,
    number: '98%',
    label: 'Satisfaction Rate',
    description: 'Students found helpful info',
    gradient: 'from-purple-600 to-indigo-500',
  },
  {
    icon: Target,
    number: '15K+',
    label: 'Reviews',
    description: 'Honest feedback shared',
    gradient: 'from-indigo-500 to-blue-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function AboutUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 left-0 w-1/3 h-1/3 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-0 w-1/3 h-1/3 bg-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-md rounded-full border border-purple-300/30 mb-6"
            >
              <span className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                About Us
              </span>
            </motion.div>

            <h2
              id="about-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Empowering Students to{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Make Better Choices
              </span>
            </h2>

            <div className="space-y-6 text-purple-100/80 text-lg leading-relaxed">
              <p>
                We understand that finding the right accommodation is one of the most important
                decisions you&apos;ll make during your university journey. That&apos;s why we
                created Rate My Accom — a platform built by students, for students.
              </p>

              <p>
                Our mission is simple: to provide{' '}
                <span className="text-purple-300 font-semibold">honest, verified reviews</span>{' '}
                from real students who have lived in these accommodations. No marketing fluff, no
                fake reviews — just genuine experiences to help you make informed decisions.
              </p>

              <p>
                We believe in{' '}
                <span className="text-pink-300 font-semibold">transparency, trust, and community</span>.
                Every review comes from a verified university student, ensuring that the feedback
                you read is authentic and reliable. Together, we&apos;re building a community that
                helps future students avoid the pitfalls and find their perfect home away from home.
              </p>
            </div>

            {/* Mission Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Target className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                  <p className="text-purple-100/70">
                    To create the most trusted and comprehensive student accommodation review
                    platform in NSW, helping thousands of students find safe, comfortable, and
                    affordable homes near their universities.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                  aria-hidden="true"
                />

                {/* Card */}
                <div className="relative h-full bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-4">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                    >
                      <stat.icon className="w-6 h-6 text-white" strokeWidth={2} aria-hidden="true" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-4xl font-extrabold text-white mb-2">{stat.number}</div>
                  <div className="text-lg font-semibold text-purple-200 mb-1">{stat.label}</div>
                  <div className="text-sm text-purple-100/60">{stat.description}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
