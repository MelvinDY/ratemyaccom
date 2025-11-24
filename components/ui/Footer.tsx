'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Page-specific theme configuration
  const getPageTheme = () => {
    if (pathname === '/about' || pathname?.startsWith('/about')) {
      return {
        bg: 'bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900',
        border: 'border-blue-500/20',
        accentColor: 'text-blue-400',
        accentHover: 'hover:text-blue-300',
        linkHover: 'hover:text-blue-400',
        iconBg: 'bg-blue-500/10',
        iconBorder: 'border-blue-500/20',
        iconHover: 'hover:bg-blue-500/20 hover:border-blue-400/40',
      };
    }

    if (pathname === '/browse' || pathname?.startsWith('/browse')) {
      return {
        bg: 'bg-charcoal/95',
        border: 'border-white/10',
        accentColor: 'text-lyra-purple-start',
        accentHover: 'hover:text-lyra-purple-start',
        linkHover: 'hover:text-lyra-purple-start',
        iconBg: 'bg-white/5',
        iconBorder: 'border-white/10',
        iconHover: 'hover:bg-white/10 hover:border-lyra-purple-start/40',
      };
    }

    // Default theme for home and other pages
    return {
      bg: 'bg-charcoal/95',
      border: 'border-white/10',
      accentColor: 'text-purple-400',
      accentHover: 'hover:text-purple-300',
      linkHover: 'hover:text-purple-400',
      iconBg: 'bg-white/5',
      iconBorder: 'border-white/10',
      iconHover: 'hover:bg-white/10 hover:border-purple-400/40',
    };
  };

  const theme = getPageTheme();

  const footerLinks = {
    quickLinks: [
      { href: '/', label: 'Home' },
      { href: '/browse', label: 'Browse' },
      { href: '/about', label: 'About' },
    ],
    universities: [
      { href: '/browse?university=unsw', label: 'UNSW' },
      { href: '/browse?university=sydney', label: 'University of Sydney' },
      { href: '/browse?university=macquarie', label: 'Macquarie University' },
    ],
    legal: [
      { href: '/help', label: 'Help Center' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/MelvinDY/ratemyaccom', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:support@ratemyaccom.com.au', label: 'Email' },
  ];

  return (
    <footer className={`${theme.bg} backdrop-blur-xl border-t ${theme.border} text-white`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand Section - Larger on desktop */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center space-x-2 group mb-6">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white font-bold text-xl px-3 py-1.5 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                  RMA
                </div>
                <span className="text-xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  Rate My Accom NSW
                </span>
              </Link>
              <p className="text-white/70 text-base leading-relaxed mb-6 max-w-md">
                Helping NSW students find their perfect accommodation through honest, verified
                reviews from real students.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-xl ${theme.iconBg} border ${theme.iconBorder} ${theme.iconHover} transition-all duration-300 group`}
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-lg mb-5 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-white/70 ${theme.linkHover} transition-all duration-300 text-sm font-medium inline-flex items-center group`}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Universities */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-lg mb-5 text-white">Universities</h4>
              <ul className="space-y-3">
                {footerLinks.universities.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-white/70 ${theme.linkHover} transition-all duration-300 text-sm font-medium inline-flex items-center group`}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-3">
              <h4 className="font-bold text-lg mb-5 text-white">Support & Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-white/70 ${theme.linkHover} transition-all duration-300 text-sm font-medium inline-flex items-center group`}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${theme.border} py-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60 text-center md:text-left">
              &copy; {new Date().getFullYear()} Rate My Accom NSW. All rights reserved.
            </p>
            <p className="text-sm text-white/60 flex items-center gap-2">
              Made with <Heart className={`h-4 w-4 ${theme.accentColor} fill-current`} /> by
              students, for students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
