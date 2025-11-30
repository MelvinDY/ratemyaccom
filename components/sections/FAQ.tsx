'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

const faqs = [
  {
    question: 'How do I leave a review?',
    answer:
      'Create an account using your university email address. Once verified, search for your accommodation, click on it, and select "Write a Review". Rate various aspects and add photos to help other students.',
  },
  {
    question: 'Are all reviews verified?',
    answer:
      'Yes. All reviewers must verify their identity using a valid university email address. This ensures every review comes from a real student with genuine experience.',
  },
  {
    question: 'How do I search for accommodation?',
    answer:
      'Use our search feature to filter by university, location, price range, accommodation type, and ratings. You can also compare multiple options side-by-side.',
  },
  {
    question: 'Is the service free to use?',
    answer:
      'Rate My Accom is completely free for students. Browse reviews, search accommodations, compare options, and leave your own reviews without paying anything.',
  },
  {
    question: 'How are ratings calculated?',
    answer:
      'Overall ratings average scores across six categories: location, facilities, cleanliness, value for money, management responsiveness, and community atmosphere.',
  },
  {
    question: 'Can I edit or delete my review?',
    answer:
      'Yes. Log into your account, navigate to "My Reviews", and select the review you want to modify or delete. Once deleted, reviews cannot be recovered.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative py-24 sm:py-32 bg-[#0a0a0a]" aria-labelledby="faq-heading">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Split layout: Left side fixed, right side content */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left column - Fixed header */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-px w-12 bg-purple-500" />
              <span className="text-sm text-purple-400 uppercase tracking-[0.3em] font-light">
                FAQ
              </span>
            </motion.div>

            <motion.h2
              id="faq-heading"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-extralight text-white leading-[1.1] tracking-[-0.02em] mb-8"
            >
              Got
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400">
                questions?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-neutral-400 leading-relaxed font-light mb-8"
            >
              Find answers to the most common questions about Rate My Accom.
            </motion.p>

            {/* Question selector dots */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-2"
            >
              {faqs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-10 h-10 rounded-xl border transition-all duration-300 flex items-center justify-center text-sm font-medium ${
                    activeIndex === index
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-white/[0.03] border-white/[0.1] text-neutral-500 hover:border-purple-500/50 hover:text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </motion.div>

            {/* Progress indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8"
            >
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <span>{String(activeIndex + 1).padStart(2, '0')}</span>
                <div className="flex-1 h-px bg-white/[0.1] relative">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-violet-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((activeIndex + 1) / faqs.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span>{String(faqs.length).padStart(2, '0')}</span>
              </div>
            </motion.div>
          </div>

          {/* Right column - Answer display */}
          <div className="lg:col-span-8">
            {/* Main FAQ card - not absolutely positioned */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="rounded-[2rem] bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] p-8 md:p-12">
                {/* Large number */}
                <div className="flex items-start justify-between mb-6">
                  <span className="text-[80px] md:text-[100px] font-extralight text-white/[0.06] leading-none select-none">
                    {String(activeIndex + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-2xl md:text-3xl font-light text-white mb-6 leading-tight">
                  {faqs[activeIndex]?.question}
                </h3>

                {/* Answer */}
                <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                  {faqs[activeIndex]?.answer}
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
                  <button
                    onClick={() =>
                      setActiveIndex(activeIndex > 0 ? activeIndex - 1 : faqs.length - 1)
                    }
                    className="text-neutral-500 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setActiveIndex(activeIndex < faqs.length - 1 ? activeIndex + 1 : 0)
                    }
                    className="text-white hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    Next question
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quick links below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              {faqs.map((faq, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`p-4 rounded-2xl text-left transition-all duration-300 ${
                    activeIndex === index
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  }`}
                >
                  <span
                    className={`text-xs uppercase tracking-wider mb-1 block ${
                      activeIndex === index ? 'text-purple-400' : 'text-neutral-600'
                    }`}
                  >
                    Q{index + 1}
                  </span>
                  <span
                    className={`text-sm line-clamp-2 ${
                      activeIndex === index ? 'text-white' : 'text-neutral-400'
                    }`}
                  >
                    {faq.question}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
