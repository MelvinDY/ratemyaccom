'use client';

import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, Filter, Image, Info, Scale } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Real Reviews',
    description: 'Authentic experiences from students who have lived there.',
    stat: '100+',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Students',
    description: 'All reviewers verified with university email addresses.',
    stat: '100%',
  },
  {
    icon: Filter,
    title: 'Smart Filters',
    description: 'Advanced filtering by location, price, and amenities.',
    stat: '20+',
  },
  {
    icon: Image,
    title: 'Photo Galleries',
    description: 'Student-uploaded photos of real accommodations.',
    stat: '500+',
  },
  {
    icon: Info,
    title: 'Detailed Info',
    description: 'Amenities, transport links, and nearby services.',
    stat: '50+',
  },
  {
    icon: Scale,
    title: 'Easy Comparison',
    description: 'Compare options side-by-side on key metrics.',
    stat: '6',
  },
];

export default function Features() {
  return (
    <section className="relative py-24 bg-[#e0e5ec]" aria-labelledby="features-heading">
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
            Features
          </span>
          <h2 id="features-heading" className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">
            Everything you need
          </h2>
          <p className="mt-4 text-slate-500 max-w-lg mx-auto">
            Powerful tools to help you find the perfect student accommodation.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="p-6 rounded-2xl bg-[#e0e5ec]
                shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
                hover:shadow-[8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.9)]
                transition-all duration-300"
            >
              {/* Icon and Stat */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-300">{feature.stat}</span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
