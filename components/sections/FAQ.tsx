'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How do I leave a review?',
    answer:
      'Create an account using your university email address. Once verified, search for your accommodation and select "Write a Review".',
  },
  {
    question: 'Are all reviews verified?',
    answer:
      'Yes. All reviewers must verify their identity using a valid university email address to ensure authentic reviews.',
  },
  {
    question: 'How do I search for accommodation?',
    answer:
      'Use our search feature to filter by university, location, price range, and ratings. Compare multiple options side-by-side.',
  },
  {
    question: 'Is the service free to use?',
    answer:
      'Rate My Accom is completely free for students. Browse, search, compare, and leave reviews without paying anything.',
  },
  {
    question: 'How are ratings calculated?',
    answer:
      'Overall ratings average scores across six categories: location, facilities, cleanliness, value, management, and community.',
  },
  {
    question: 'Can I edit or delete my review?',
    answer:
      'Yes. Log into your account, navigate to "My Reviews", and select the review you want to modify or delete.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-24 bg-[#e0e5ec]" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm text-blue-600 font-medium uppercase tracking-wider">FAQ</span>
          <h2 id="faq-heading" className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">
            Frequently asked questions
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl bg-[#e0e5ec]
                shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-slate-800 pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    bg-[#e0e5ec]
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-slate-500 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
