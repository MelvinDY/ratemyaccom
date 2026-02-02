'use client';

import { motion } from 'framer-motion';
import { Search, Star, UserCheck, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse',
    description: 'Explore accommodations across 5 NSW universities.',
    number: '01',
  },
  {
    icon: Star,
    title: 'Compare',
    description: 'Read verified reviews from real students.',
    number: '02',
  },
  {
    icon: UserCheck,
    title: 'Verify',
    description: 'Sign up with your university email.',
    number: '03',
  },
  {
    icon: CheckCircle,
    title: 'Decide',
    description: 'Make confident housing decisions.',
    number: '04',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 bg-[#e0e5ec]">
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm text-blue-600 font-medium uppercase tracking-wider">
            How it works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">Four simple steps</h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-[#e0e5ec]
                shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
                hover:shadow-[8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.9)]
                transition-all duration-300"
            >
              {/* Number */}
              <span className="text-4xl font-bold text-slate-200">{step.number}</span>

              {/* Icon */}
              <div
                className="mt-4 w-12 h-12 rounded-xl flex items-center justify-center
                bg-gradient-to-br from-blue-500 to-indigo-600
                shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
              >
                <step.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="mt-4 text-lg font-semibold text-slate-800">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
