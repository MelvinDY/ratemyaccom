'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Target } from 'lucide-react';

const stats = [
  { value: '5', label: 'Universities', description: 'NSW universities covered' },
  { value: '50+', label: 'Accommodations', description: 'Verified listings' },
  { value: '100%', label: 'Verified', description: 'Real student reviews' },
  { value: '6', label: 'Categories', description: 'Rating dimensions' },
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

export default function AboutUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 bg-black overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-purple-400 text-sm font-medium tracking-wide uppercase mb-4">
              About us
            </p>

            <h2
              id="about-heading"
              className="text-4xl sm:text-5xl font-semibold text-white mb-6 tracking-tight leading-tight"
            >
              Built by students,
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                for students.
              </span>
            </h2>

            <div className="space-y-5 text-neutral-400 text-base leading-relaxed">
              <p>
                Finding the right accommodation is one of the most important decisions during your
                university journey. We created Rate My Accom to help you make that decision with
                confidence.
              </p>

              <p>
                Every review comes from a verified university student, ensuring authentic and
                trustworthy feedback. No marketing fluff — just genuine experiences from people
                who&apos;ve been there.
              </p>
            </div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 p-6 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Our Mission</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    To create the most trusted student accommodation platform in NSW, helping
                    students find safe, comfortable homes near their universities.
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
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="group">
                <div className="relative h-full bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all duration-300">
                  <div className="text-4xl font-semibold text-white mb-2 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-base font-medium text-neutral-300 mb-1">{stat.label}</div>
                  <div className="text-sm text-neutral-500">{stat.description}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
