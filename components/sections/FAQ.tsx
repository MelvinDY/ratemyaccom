'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 bg-neutral-950 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-purple-400 text-sm font-medium tracking-wide uppercase mb-4">FAQ</p>
          <h2
            id="faq-heading"
            className="text-4xl sm:text-5xl font-semibold text-white mb-6 tracking-tight"
          >
            Questions & answers.
          </h2>
          <p className="text-lg text-neutral-400">
            Everything you need to know about Rate My Accom.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl overflow-hidden"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border-neutral-800 px-6 transition-colors hover:bg-white/[0.02]"
                >
                  <AccordionTrigger className="text-left py-5 text-white hover:no-underline hover:text-purple-400 transition-colors">
                    <span className="text-base font-medium pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-500 text-sm leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-500 text-sm mb-4">Still have questions?</p>
          <motion.a
            href="mailto:support@ratemyaccom.com"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-100 transition-all duration-200 text-sm"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
