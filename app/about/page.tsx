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
  Building2,
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
    { icon: Building2, value: '5', label: 'Universities' },
    { icon: Home, value: '50+', label: 'Accommodations' },
    { icon: Star, value: '100+', label: 'Reviews' },
    { icon: Users, value: '6', label: 'Rating Categories' },
  ];

  return (
    <div className="min-h-screen bg-[#e0e5ec]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm text-blue-600 font-medium uppercase tracking-wider">
              About RateMyAccom
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-800 leading-tight">
              Helping students find their <span className="text-blue-600">perfect home</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              The trusted platform for NSW university students to discover honest, verified
              accommodation reviews from peers who&apos;ve actually lived there.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
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
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm text-blue-600 font-medium uppercase tracking-wider">
                Our Mission
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                Empowering informed decisions
              </h2>
              <p className="mt-6 text-slate-500 leading-relaxed">
                Finding the right accommodation shapes your entire university experience. We created
                RateMyAccom because students deserve honest, comprehensive reviews from peers
                who&apos;ve actually lived there.
              </p>
              <p className="mt-4 text-slate-500 leading-relaxed">
                No marketing fluff. No paid placements. Just genuine student experiences to help you
                make confident housing decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="p-8 rounded-2xl bg-[#e0e5ec]
                shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center
                    bg-gradient-to-br from-blue-500 to-indigo-600
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                  >
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">4.8/5</p>
                    <p className="text-sm text-slate-500">Average satisfaction</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {['Verified reviews only', 'Multi-criteria ratings', 'Real student photos'].map(
                    (item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center
                          bg-[#e0e5ec]
                          shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.6)]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-slate-600">{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
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
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">
              Everything you need
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="p-6 rounded-2xl bg-[#e0e5ec]
                  shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]
                  hover:shadow-[8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.9)]
                  transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-sm text-blue-600 font-medium uppercase tracking-wider">
              Our Values
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">
              Principles we live by
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl bg-[#e0e5ec]
                  shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center
                    bg-gradient-to-br from-blue-500 to-indigo-600
                    shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.6)]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{value.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm text-blue-600 font-medium uppercase tracking-wider">
              The Developer
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">
              Built with passion
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-[#e0e5ec]
              shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
                >
                  MD
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Melvin DY</h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  Full-stack developer and university student passionate about building tools that
                  make student life better. RateMyAccom combines technical skills with firsthand
                  understanding of accommodation challenges students face.
                </p>
                <a
                  href="https://melvindy.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white
                    bg-gradient-to-br from-blue-500 to-indigo-600
                    shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                    hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
                    transition-all duration-300"
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
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div
            className="p-8 md:p-12 rounded-2xl bg-slate-800
            shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.8)]"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium uppercase tracking-wider">
                    Open Source
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                  Contribute to RateMyAccom
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Built in the open. Join us in making accommodation search better for students
                  everywhere.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://github.com/MelvinDY/ratemyaccom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-800 font-medium
                    hover:bg-slate-100 transition-colors"
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
              >
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <Heart className="w-8 h-8 text-pink-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-4">Ways to Contribute</h3>
                  <ul className="space-y-3 text-slate-400">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Ready to find your perfect home?
            </h2>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
              Join thousands of NSW students making informed accommodation decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-white
                    bg-gradient-to-br from-blue-500 to-indigo-600
                    shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                    hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
                    transition-all duration-300"
                >
                  Browse Accommodations
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-slate-700
                    bg-[#e0e5ec]
                    shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)]
                    hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)]
                    transition-all duration-300"
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
            className="mt-16 pt-12 border-t border-slate-300/50"
          >
            <p className="text-slate-500 mb-2">Have questions?</p>
            <a
              href="mailto:support@ratemyaccom.com.au"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              support@ratemyaccom.com.au
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
