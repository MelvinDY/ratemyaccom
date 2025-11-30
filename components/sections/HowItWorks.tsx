'use client';

import { motion } from 'framer-motion';
import { Search, Star, UserCheck, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse',
    description:
      'Explore accommodations across 5 NSW universities. Filter by price, location, and amenities.',
  },
  {
    icon: Star,
    title: 'Compare',
    description: 'Read verified reviews from students. See ratings across 6 key categories.',
  },
  {
    icon: UserCheck,
    title: 'Verify',
    description: 'Sign up with your .edu.au email. Access full reviews and contribute your own.',
  },
  {
    icon: CheckCircle,
    title: 'Decide',
    description: 'Make confident housing decisions backed by real student experiences.',
  },
];

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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

  return (
    <section className="py-24 sm:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.p
            variants={itemVariants}
            className="text-purple-400 text-sm font-medium tracking-wide uppercase mb-4"
          >
            How it works
          </motion.p>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-semibold text-white mb-6 tracking-tight"
          >
            Four simple steps.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Finding your ideal student accommodation has never been easier.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={itemVariants} className="group relative">
              <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-300 h-full">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-400">{index + 1}</span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-300">
                  <step.icon className="w-6 h-6 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
