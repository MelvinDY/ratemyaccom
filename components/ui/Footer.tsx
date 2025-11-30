'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Github, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    quickLinks: [
      { href: '/', label: 'Home' },
      { href: '/browse', label: 'Browse' },
      { href: '/about', label: 'About' },
      { href: '/quiz', label: 'Quiz' },
    ],
    universities: [
      { href: '/browse?university=unsw', label: 'UNSW' },
      { href: '/browse?university=sydney', label: 'Sydney' },
      { href: '/browse?university=uts', label: 'UTS' },
      { href: '/browse?university=macquarie', label: 'Macquarie' },
      { href: '/browse?university=wsu', label: 'WSU' },
    ],
    support: [
      { href: '/support?tab=help', label: 'Help Center' },
      { href: '/support?tab=contact', label: 'Contact' },
      { href: '/support?tab=privacy', label: 'Privacy' },
      { href: '/support?tab=terms', label: 'Terms' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/MelvinDY/ratemyaccom', label: 'GitHub' },
    { icon: Mail, href: 'mailto:support@ratemyaccom.com.au', label: 'Email' },
  ];

  return (
    <footer className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Decorative gradient overlays - matching Hero */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-500/[0.05] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/5 to-transparent pointer-events-none" />

      {/* Floating orb */}
      <motion.div
        className="absolute -top-20 right-40 w-64 h-64 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Top border line */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center gap-4 group mb-8">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="RMA Logo"
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-light text-white tracking-tight">Rate My Accom</span>
              </Link>

              <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-sm font-light">
                Helping NSW students find their perfect accommodation through honest, verified
                reviews from real students.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 text-neutral-500 group-hover:text-purple-400 transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-3 gap-8">
                {/* Quick Links */}
                <div>
                  <h4 className="text-xs text-neutral-500 uppercase tracking-[0.2em] mb-6 font-light">
                    Navigate
                  </h4>
                  <ul className="space-y-4">
                    {footerLinks.quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-neutral-400 hover:text-white transition-colors duration-300 font-light inline-flex items-center gap-1 group"
                        >
                          {link.label}
                          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Universities */}
                <div>
                  <h4 className="text-xs text-neutral-500 uppercase tracking-[0.2em] mb-6 font-light">
                    Universities
                  </h4>
                  <ul className="space-y-4">
                    {footerLinks.universities.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-neutral-400 hover:text-white transition-colors duration-300 font-light inline-flex items-center gap-1 group"
                        >
                          {link.label}
                          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h4 className="text-xs text-neutral-500 uppercase tracking-[0.2em] mb-6 font-light">
                    Support
                  </h4>
                  <ul className="space-y-4">
                    {footerLinks.support.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-neutral-400 hover:text-white transition-colors duration-300 font-light inline-flex items-center gap-1 group"
                        >
                          {link.label}
                          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs text-neutral-600 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Rate My Accom NSW
            </p>
            <p className="text-xs text-neutral-600 uppercase tracking-widest">
              Made by students, for students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
