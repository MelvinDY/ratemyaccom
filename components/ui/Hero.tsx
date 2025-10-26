'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, ShieldCheck } from 'lucide-react';

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
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => {
            const randomOpacity = Math.random() * 0.4 + 0.4; // Random between 0.4 and 0.8
            return (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: randomOpacity, scale: Math.random() * 0.5 + 0.5 }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>

        {/* Glowing orbs */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Purple glow effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full opacity-15 blur-2xl"></div>
      </div>

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
