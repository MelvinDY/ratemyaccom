'use client';

import { motion } from 'framer-motion';
import { Search, Star, MapPin, Users, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { icon: Building2, value: '5', label: 'Universities', color: 'from-blue-500 to-blue-600' },
    { icon: MapPin, value: '50+', label: 'Listings', color: 'from-indigo-500 to-indigo-600' },
    { icon: Star, value: '100+', label: 'Reviews', color: 'from-amber-500 to-amber-600' },
    { icon: Users, value: '500+', label: 'Students', color: 'from-emerald-500 to-emerald-600' },
    { icon: ShieldCheck, value: '100%', label: 'Verified', color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <div className="relative min-h-screen bg-[#e0e5ec] overflow-hidden">
      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100/40 via-transparent to-indigo-100/30" />

      {/* Decorative blurred circles */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-28 pb-12">
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12">
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full
                bg-[#e0e5ec] shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff]"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">NSW Student Accommodations</span>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 leading-tight">
                Find Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                  Student Home
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Discover verified reviews from real students across 5 NSW universities. Make informed
              decisions about your next accommodation.
            </motion.p>

            {/* Search Bar - Neumorphic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6 max-w-2xl mx-auto"
            >
              <div
                className="relative flex items-center p-2 rounded-2xl
                bg-[#e0e5ec] shadow-[inset_4px_4px_10px_#b8bcc4,inset_-4px_-4px_10px_#ffffff]"
              >
                <div className="flex items-center gap-3 flex-1 px-4">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by university or suburb..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-slate-700 placeholder:text-slate-400
                      outline-none py-3.5 text-base"
                  />
                </div>
                <Link href={`/browse${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3.5 rounded-xl font-semibold text-white
                      bg-blue-600 hover:bg-blue-700
                      shadow-lg shadow-blue-600/30
                      hover:shadow-xl hover:shadow-blue-600/40
                      transition-all duration-300"
                  >
                    Search
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-16"
            >
              <span className="text-sm text-slate-500">Popular:</span>
              {['UNSW', 'Sydney Uni', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
                <Link key={uni} href={`/browse?university=${encodeURIComponent(uni)}`}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-1.5 rounded-full text-sm text-blue-600 font-medium
                      bg-[#e0e5ec] shadow-[3px_3px_6px_#b8bcc4,-3px_-3px_6px_#ffffff]
                      hover:shadow-[inset_2px_2px_4px_#b8bcc4,inset_-2px_-2px_4px_#ffffff]
                      cursor-pointer transition-all duration-200"
                  >
                    {uni}
                  </motion.span>
                </Link>
              ))}
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-3xl mx-auto mb-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-4 rounded-2xl bg-[#e0e5ec] text-center
                    shadow-[6px_6px_15px_#b8bcc4,-6px_-6px_15px_#ffffff]"
                >
                  <div
                    className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center
                    bg-gradient-to-br ${stat.color}
                    shadow-[3px_3px_8px_#b8bcc4,-3px_-3px_8px_#ffffff]`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/browse">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl font-semibold text-white
                    bg-blue-600 hover:bg-blue-700
                    shadow-lg shadow-blue-600/30
                    hover:shadow-xl hover:shadow-blue-600/40
                    transition-all duration-300"
                >
                  Browse All Accommodations
                </motion.button>
              </Link>
              <Link href="/quiz">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl font-semibold text-blue-600
                    bg-white hover:bg-blue-50
                    border-2 border-blue-600
                    shadow-lg shadow-slate-200/50
                    hover:shadow-xl hover:shadow-slate-300/50
                    transition-all duration-300"
                >
                  Take the Quiz
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="px-6 sm:px-12 mt-auto"
        >
          <div className="max-w-4xl mx-auto">
            <div
              className="p-5 rounded-2xl bg-[#e0e5ec] text-center
              shadow-[6px_6px_15px_#b8bcc4,-6px_-6px_15px_#ffffff]"
            >
              <p className="text-sm text-slate-500 mb-3">Trusted by students from</p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                {[
                  'UNSW',
                  'University of Sydney',
                  'UTS',
                  'Macquarie University',
                  'Western Sydney',
                ].map((uni) => (
                  <span
                    key={uni}
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600
                      transition-colors cursor-default"
                  >
                    {uni}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
