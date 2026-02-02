'use client';

import { motion } from 'framer-motion';
import { Building2, Users, Shield, Star } from 'lucide-react';

const stats = [
  { icon: Building2, value: '5', label: 'Universities' },
  { icon: Users, value: '50+', label: 'Listings' },
  { icon: Shield, value: '100%', label: 'Verified' },
  { icon: Star, value: '100+', label: 'Reviews' },
];

export default function AboutUs() {
  return (
    <section className="relative py-24 bg-[#e0e5ec]" aria-labelledby="about-heading">
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
            About us
          </span>
          <h2 id="about-heading" className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">
            Built by students, for students
          </h2>
          <p className="mt-4 text-slate-500 max-w-lg mx-auto">
            We created Rate My Accom to help you make housing decisions with confidence.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-[#e0e5ec] text-center
                shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
            >
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center
                bg-gradient-to-br from-blue-500 to-indigo-600
                shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-800">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-8 rounded-2xl bg-[#e0e5ec] text-center
            shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
        >
          <p className="text-lg text-slate-600 leading-relaxed">
            &ldquo;No marketing fluff — just genuine student experiences to help you find the
            perfect accommodation.&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
