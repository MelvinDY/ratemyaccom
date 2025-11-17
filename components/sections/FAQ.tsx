'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HelpCircle } from 'lucide-react';
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
      'To leave a review, first create an account using your university email address. Once verified, search for your accommodation, click on it, and select "Write a Review". You can rate various aspects like location, facilities, value for money, and more. Don\'t forget to add photos and detailed comments to help other students!',
  },
  {
    question: 'Are all reviews verified?',
    answer:
      'Yes! All reviewers must verify their identity using a valid university email address. This ensures that every review comes from a real student who has genuine experience with the accommodation. We also have a moderation system in place to detect and remove any suspicious or inappropriate content.',
  },
  {
    question: 'How do I search for accommodation?',
    answer:
      'Use our advanced search feature on the homepage or navigation bar. You can filter by university, location, price range, accommodation type, amenities, and ratings. You can also view accommodations on a map, compare multiple options side-by-side, and save your favorites for later.',
  },
  {
    question: 'Is the service free to use?',
    answer:
      'Absolutely! Rate My Accom is completely free for students. You can browse all reviews, search for accommodations, compare options, and leave your own reviews without paying anything. Our goal is to help students make informed decisions, not to profit from them.',
  },
  {
    question: 'How are ratings calculated?',
    answer:
      'Overall ratings are calculated by averaging scores across multiple categories including location, facilities, cleanliness, value for money, management responsiveness, and community atmosphere. Each category is weighted equally, and the final score is rounded to one decimal place. The more reviews an accommodation has, the more accurate the rating.',
  },
  {
    question: 'Can I edit or delete my review?',
    answer:
      'Yes, you can edit your review at any time by logging into your account, navigating to "My Reviews", and selecting the review you want to modify. You can also delete a review if you no longer want it published. However, once deleted, it cannot be recovered, so make sure you\'re certain before removing it.',
  },
  {
    question: 'What if I find incorrect information about an accommodation?',
    answer:
      'If you notice any incorrect details about an accommodation (such as outdated pricing, wrong address, or misleading photos), please use the "Report Issue" button on the accommodation page. Our team will investigate and update the information as soon as possible. You can also contact us directly at support@ratemyaccom.com.',
  },
  {
    question: 'Can accommodation providers respond to reviews?',
    answer:
      'Yes, verified accommodation providers and managers can claim their listing and respond to reviews. This creates a transparent dialogue between students and providers. Provider responses are clearly marked and appear below the original review. However, providers cannot edit or delete student reviews.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-gray-900 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-1/2 h-1/2 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-md rounded-full border border-purple-300/30 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-purple-300" aria-hidden="true" />
            <span className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
              FAQ
            </span>
          </motion.div>
          <h2
            id="faq-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6"
          >
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-purple-100/80">
            Got questions? We&apos;ve got answers. Find everything you need to know about using Rate
            My Accom.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border-white/10 px-6 md:px-8 transition-colors hover:bg-white/5"
                >
                  <AccordionTrigger className="text-left py-6 text-white hover:no-underline hover:text-purple-300 transition-colors">
                    <span className="text-lg md:text-xl font-semibold pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-purple-100/80 text-base md:text-lg leading-relaxed pb-6">
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
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-purple-100/70 text-lg mb-4">Still have questions?</p>
          <motion.a
            href="mailto:support@ratemyaccom.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
          >
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
