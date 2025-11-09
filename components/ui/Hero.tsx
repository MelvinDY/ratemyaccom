'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, ShieldCheck } from 'lucide-react';
import LiquidBackground from './LiquidBackground';

export default function Hero() {
  const [currentText, setCurrentText] = useState('');
  const fullText = 'Find Your Perfect Student Accommodation in NSW';

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setCurrentText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const stats = [
    {
      icon: MessageSquare,
      title: '5,000+ Reviews',
      description: 'Honest feedback from students',
      color: 'bg-purple-500/20 text-purple-300',
    },
    {
      icon: MapPin,
      title: '200+ Locations',
      description: 'Across NSW universities',
      color: 'bg-blue-500/20 text-blue-300',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Students',
      description: 'University email verified',
      color: 'bg-indigo-500/20 text-indigo-300',
    },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
      {/* Liquid Background */}
      <LiquidBackground className="absolute inset-0" />

      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 py-12 max-w-6xl mx-auto"
      >
        {/* Main Headline with Typewriter Effect */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          style={{
            textShadow: '0 0 30px rgba(147, 51, 234, 0.5)',
          }}
        >
          {currentText}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-purple-300"
          >
            |
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed"
          style={{
            textShadow: '0 0 20px rgba(147, 51, 234, 0.3)',
          }}
        >
          Real reviews from real students. Make informed decisions about where you&apos;ll call home
          during your university years.
        </motion.p>

        {/* Stats Badges */}
        <motion.div variants={containerVariants} className="flex flex-wrap justify-center gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              style={{
                boxShadow: 'inset 0 0 0 0px rgba(147, 51, 234, 0.3), 0 4px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">{stat.title}</div>
                <div className="text-sm text-gray-300">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
