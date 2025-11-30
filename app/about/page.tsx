'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  Shield,
  Star,
  MessageSquare,
  TrendingUp,
  Github,
  ExternalLink,
  Code,
  Heart,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: 'Student-Verified',
      description: 'All reviews from verified .edu.au email addresses',
    },
    {
      icon: Home,
      title: 'NSW Coverage',
      description: 'Accommodations across all major NSW universities',
    },
    {
      icon: Star,
      title: 'Detailed Ratings',
      description: 'Multi-criteria ratings for comprehensive insights',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security protecting your data',
    },
    {
      icon: MessageSquare,
      title: 'Community Driven',
      description: 'Students helping students find their perfect home',
    },
    {
      icon: TrendingUp,
      title: 'Data Insights',
      description: 'Aggregate data for informed decision-making',
    },
  ];

  const values = [
    { title: 'Transparency', desc: 'Honest reviews without interference or payment' },
    { title: 'Community First', desc: 'Built by students, for students' },
    { title: 'Privacy', desc: 'Your data is sacred and never shared' },
    { title: 'Accountability', desc: 'High standards for respectful, genuine reviews' },
  ];

  const stats = [
    { value: '5', label: 'Universities' },
    { value: '50+', label: 'Accommodations' },
    { value: '100+', label: 'Reviews' },
    { value: '6', label: 'Rating Categories' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-[100px] translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            {/* Overline */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-purple-600" />
              <span className="text-sm text-purple-600 font-medium tracking-wide">
                About RateMyAccom
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Helping students find their <span className="text-purple-600">perfect home</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              The trusted platform for NSW university students to discover honest, verified
              accommodation reviews from peers who&apos;ve actually lived there.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 rounded-l-2xl" />
                <p className="text-4xl font-semibold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm text-purple-600 font-medium tracking-wide uppercase">
                Our Mission
              </span>
              <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mt-4 mb-6">
                Empowering informed decisions
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Finding the right accommodation shapes your entire university experience. We created
                RateMyAccom because students deserve honest, comprehensive reviews from peers
                who&apos;ve actually lived there.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                No marketing fluff. No paid placements. Just genuine student experiences to help you
                make confident housing decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Decorative card stack */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-purple-100 rounded-3xl" />
                <div className="absolute -top-2 -left-2 w-full h-full bg-purple-50 rounded-3xl" />
                <div className="relative p-10 bg-white rounded-3xl border border-gray-100 shadow-lg">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">4.8/5</p>
                      <p className="text-sm text-gray-500">Average satisfaction</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {['Verified reviews only', 'Multi-criteria ratings', 'Real student photos'].map(
                      (item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm text-purple-600 font-medium tracking-wide uppercase">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mt-4">
              Everything you need
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-5 transition-colors">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-purple-50/50 to-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm text-purple-600 font-medium tracking-wide uppercase">
              Our Values
            </span>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mt-4">
              Principles we live by
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-5 p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-sm text-purple-600 font-medium tracking-wide uppercase">
              The Developer
            </span>
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mt-4">
              Built with passion
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-10 rounded-3xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  MD
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-semibold text-gray-900 mb-3">Melvin DY</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Full-stack developer and university student passionate about building tools that
                  make student life better. RateMyAccom combines technical skills with firsthand
                  understanding of accommodation challenges students face.
                </p>
                <a
                  href="https://melvindy.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  View Portfolio
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium tracking-wide uppercase">
                  Open Source
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight mb-6">
                Contribute to RateMyAccom
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Built in the open. Join us in making accommodation search better for students
                everywhere.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'].map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <a
                href="https://github.com/MelvinDY/ratemyaccom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <Heart className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Ways to Contribute</h3>
                <ul className="space-y-3 text-gray-400">
                  {[
                    'Report bugs and suggest features',
                    'Submit pull requests with improvements',
                    'Improve documentation',
                    'Share feedback and ideas',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Ready to find your perfect home?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of NSW students making informed accommodation decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  Browse Accommodations
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-gray-900 font-medium border-2 border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-all"
                >
                  Create Account
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 pt-12 border-t border-gray-100"
          >
            <p className="text-gray-500 mb-2">Have questions?</p>
            <a
              href="mailto:support@ratemyaccom.com.au"
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              support@ratemyaccom.com.au
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
