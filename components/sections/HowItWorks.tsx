'use client';

import { motion } from 'framer-motion';
import { Search, Star, CheckCircle, UserCheck } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse & Search',
    description:
      'Explore student accommodations across 5 NSW universities. Filter by location, price, and amenities.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Star,
    title: 'Read Reviews',
    description:
      'Get honest insights from verified students who actually lived there. See ratings across 6 categories.',
    color: 'from-pink-500 to-orange-500',
  },
  {
    icon: UserCheck,
    title: 'Verify & Sign Up',
    description:
      'Create an account with your .edu.au email to access full features and contribute your own reviews.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: CheckCircle,
    title: 'Make Your Choice',
    description:
      'Compare options, save favorites, and confidently choose the accommodation that fits your needs.',
    color: 'from-yellow-500 to-green-500',
  },
];

export default function HowItWorks() {
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
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-purple-500/10 rounded-full border border-purple-500/20"
          >
            <span className="text-sm font-medium text-purple-300">Simple Process</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            How It Works
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-purple-200/70 max-w-2xl mx-auto"
          >
            Finding your ideal student accommodation has never been easier. Follow these simple
            steps to get started.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={itemVariants} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
              )}

              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 h-full">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-purple-200/60 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
