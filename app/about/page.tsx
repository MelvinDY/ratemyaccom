'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  Sparkles,
  CheckCircle2,
  ChevronDown,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white scroll-smooth snap-y snap-mandatory overflow-y-scroll">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/50 to-teal-50/30 snap-start">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-[500px] h-[500px] bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold mb-8 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Empowering Student Decisions
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-extrabold text-gray-900 mb-8 tracking-tight leading-none"
            >
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
                RateMyAccom
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-16 font-medium max-w-3xl mx-auto"
            >
              The trusted platform helping NSW university students find their perfect accommodation
              through honest, verified reviews.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              {[
                { label: 'Reviews', value: '1,000+' },
                { label: 'Accommodations', value: '200+' },
                { label: 'Universities', value: '13' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-8 rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl border border-blue-100/50"
                >
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 font-semibold text-base">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="h-10 w-10 text-blue-500/60" />
          </motion.div>
        </div>
      </section>

      {/* Mission & Features Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 snap-start py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
              Finding the right accommodation shapes your entire university experience. We created
              RateMyAccom because students deserve honest, comprehensive reviews from peers
              who&apos;ve actually lived there.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className="flex flex-col items-start p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all border border-gray-100">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-teal-500 text-white shadow-lg"
                  >
                    <feature.icon className="h-7 w-7" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50/50 to-slate-50 snap-start py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Our Values
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 font-medium">
              Principles that guide everything we do
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 10, scale: 1.02 }}
                className="flex gap-6 p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all border border-gray-100"
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50 snap-start py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Meet the Developer
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 font-medium">
              Built with passion by a fellow student
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={scaleIn}
          >
            <Card className="p-10 md:p-14 border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="flex-shrink-0">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-teal-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                    MD
                  </div>
                </motion.div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-4xl font-extrabold text-gray-900 mb-4">Melvin DY</h3>
                  <p className="text-gray-700 mb-8 leading-relaxed text-xl font-medium">
                    Full-stack developer and university student passionate about building tools that
                    make student life better. RateMyAccom combines my technical skills with
                    firsthand understanding of accommodation challenges students face.
                  </p>
                  <motion.a
                    href="https://melvindy.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all text-lg"
                  >
                    View Portfolio
                    <ExternalLink className="h-6 w-6" />
                  </motion.a>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white snap-start py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold mb-8 shadow-lg">
              <Code className="h-4 w-4" />
              Open Source
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Contribute to RateMyAccom
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 font-medium">
              Built in the open. Join us in making accommodation search better for students
              everywhere.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-10 mb-16"
          >
            <motion.div variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }}>
              <Card className="p-8 bg-white/5 backdrop-blur-md border-white/10 h-full rounded-3xl shadow-2xl">
                <Github className="h-10 w-10 mb-5 text-blue-300" />
                <h3 className="text-2xl font-bold mb-4">Open Source Project</h3>
                <p className="text-blue-100 mb-6 leading-relaxed text-base">
                  RateMyAccom is open source and welcomes contributions. Whether you&apos;re fixing
                  bugs, adding features, or improving documentation—every contribution helps.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'].map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.1 }}
                      className="px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm text-blue-100 text-sm font-semibold"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }}>
              <Card className="p-8 bg-white/5 backdrop-blur-md border-white/10 h-full rounded-3xl shadow-2xl">
                <Heart className="h-10 w-10 mb-5 text-pink-300" />
                <h3 className="text-2xl font-bold mb-4">Ways to Contribute</h3>
                <ul className="space-y-3 text-blue-100">
                  {[
                    'Report bugs and suggest features',
                    'Submit pull requests with improvements',
                    'Improve documentation',
                    'Share feedback and ideas',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-base">
                      <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={scaleIn}
            className="text-center"
          >
            <motion.a
              href="https://github.com/MelvinDY/ratemyaccom"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-gray-900 font-bold shadow-2xl hover:shadow-3xl transition-all text-lg"
            >
              <Github className="h-6 w-6" />
              View on GitHub
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 snap-start py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
            >
              Ready to Find Your Perfect Home?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-700 mb-12 font-medium"
            >
              Join thousands of NSW students making informed accommodation decisions.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:opacity-90 text-white px-12 py-7 text-xl font-bold shadow-2xl hover:shadow-3xl rounded-2xl"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </Link>
              <Link href="/">
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-7 text-xl font-bold shadow-xl hover:shadow-2xl rounded-2xl"
                  >
                    Browse Reviews
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-20 pt-16 border-t border-gray-200"
          >
            <p className="text-gray-700 mb-3 text-lg font-medium">Have questions or feedback?</p>
            <a
              href="mailto:support@ratemyaccom.com.au"
              className="text-blue-600 hover:text-indigo-700 font-bold transition-colors text-lg"
            >
              support@ratemyaccom.com.au
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
