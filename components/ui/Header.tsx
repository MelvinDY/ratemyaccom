'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/quiz', label: 'Find My Accom' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
];

export default function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const { user, isAuthenticated, logout } = useAuth();

  // Pages with light backgrounds (neumorphism style)
  const lightBackgroundPages = ['/', '/about', '/support', '/browse', '/quiz'];
  const isLightPage = lightBackgroundPages.some(
    (page) => pathname === page || (page !== '/' && pathname?.startsWith(page))
  );
  const isHomePage = pathname === '/';

  // Hide header on scroll down, show on scroll up, track scrolled state
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Track if scrolled past threshold for background
      setScrolled(currentScrollY > 20);

      // Hide on scroll for homepage only
      if (isHomePage) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  // Determine if we should use light theme for header (dark text)
  const useLightTheme = isLightPage && !scrolled;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#e0e5ec]/95 backdrop-blur-xl shadow-[0_4px_20px_#b8bcc4]'
          : isLightPage
            ? 'bg-transparent'
            : 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`relative w-11 h-11 rounded-2xl overflow-hidden transition-all duration-300 ${
                useLightTheme
                  ? 'bg-[#e0e5ec] shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff]'
                  : 'border border-white/[0.1] group-hover:border-purple-500/30'
              }`}
            >
              <Image
                src="/logo.png"
                alt="RMA Logo"
                fill
                sizes="44px"
                className="object-contain"
                priority
              />
            </motion.div>
            <div className="hidden sm:block">
              <span
                className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${
                  useLightTheme
                    ? 'text-slate-800 group-hover:text-blue-600'
                    : 'text-white group-hover:text-purple-200'
                }`}
              >
                Rate My Accom
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.2em] block -mt-0.5 ${
                  useLightTheme ? 'text-blue-600' : 'text-purple-400'
                }`}
              >
                NSW
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div
              className={`inline-flex rounded-full p-1.5 transition-all duration-300 ${
                useLightTheme
                  ? 'bg-[#e0e5ec] shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff]'
                  : 'border border-white/[0.08] bg-white/[0.03] backdrop-blur-md'
              }`}
            >
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

                return (
                  <Link key={link.href} href={link.href}>
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 block ${
                        useLightTheme
                          ? isActive
                            ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[2px_2px_6px_#b8bcc4,-2px_-2px_6px_#ffffff]'
                            : 'text-slate-600 hover:text-blue-600'
                          : isActive
                            ? 'text-white bg-white/[0.1]'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {link.label}
                      {isActive && !useLightTheme && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link href="/write-review">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.1em] font-medium transition-all duration-300 ${
                      useLightTheme
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                        : 'bg-white text-black hover:bg-purple-100'
                    }`}
                  >
                    Write Review
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.button>
                </Link>
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 ${
                      useLightTheme
                        ? 'bg-[#e0e5ec] shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_6px_#b8bcc4,-2px_-2px_6px_#ffffff]'
                        : 'border border-white/[0.1] hover:border-white/[0.2] bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span
                      className={`text-xs font-medium tracking-wide max-w-[80px] truncate ${
                        useLightTheme ? 'text-slate-700' : 'text-white'
                      }`}
                    >
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''} ${
                        useLightTheme ? 'text-slate-500' : 'text-neutral-400'
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#e0e5ec] shadow-[8px_8px_20px_#b8bcc4,-8px_-8px_20px_#ffffff] overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-200/50">
                          <p className="text-slate-800 font-medium truncate">{user.name}</p>
                          <p className="text-slate-500 text-xs truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white/50 hover:text-slate-800 transition-all duration-300"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider font-medium">
                              Sign Out
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.1em] font-medium transition-all duration-300 ${
                      useLightTheme
                        ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 shadow-sm'
                        : 'border border-white/[0.1] hover:border-white/[0.2] text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/write-review">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.1em] font-medium transition-all duration-300 ${
                      useLightTheme
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                        : 'bg-white text-black hover:bg-purple-100'
                    }`}
                  >
                    Write Review
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`md:hidden w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
              useLightTheme
                ? 'bg-[#e0e5ec] shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff] text-slate-700'
                : 'border border-white/[0.1] bg-white/[0.03] text-white hover:bg-white/[0.06]'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div
                className={`py-6 space-y-2 border-t ${useLightTheme ? 'border-slate-200/50' : 'border-white/[0.06]'}`}
              >
                {navLinks.map((link, index) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== '/' && pathname?.startsWith(link.href));

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                          useLightTheme
                            ? isActive
                              ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff]'
                              : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                            : isActive
                              ? 'text-white bg-white/[0.06]'
                              : 'text-neutral-400 hover:bg-white/[0.03] hover:text-white'
                        }`}
                      >
                        <span className="text-sm uppercase tracking-[0.15em] font-medium">
                          {link.label}
                        </span>
                        {isActive && !useLightTheme && (
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                <div
                  className={`pt-6 space-y-3 border-t mt-4 ${useLightTheme ? 'border-slate-200/50' : 'border-white/[0.06]'}`}
                >
                  {isAuthenticated && user ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`p-5 rounded-2xl ${
                          useLightTheme
                            ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_10px_#b8bcc4,inset_-4px_-4px_10px_#ffffff]'
                            : 'bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium truncate ${useLightTheme ? 'text-slate-800' : 'text-white'}`}
                            >
                              {user.name}
                            </p>
                            <p
                              className={`text-xs truncate ${useLightTheme ? 'text-slate-500' : 'text-neutral-500'}`}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      <Link href="/write-review" onClick={() => setMobileMenuOpen(false)}>
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs uppercase tracking-[0.15em] font-medium ${
                            useLightTheme
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff]'
                              : 'bg-white text-black'
                          }`}
                        >
                          Write Review
                          <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                      </Link>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all duration-300 ${
                          useLightTheme
                            ? 'bg-[#e0e5ec] shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff] text-slate-600 hover:text-slate-800'
                            : 'border border-white/[0.1] text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-[0.15em] font-medium">
                          Sign Out
                        </span>
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className={`w-full py-4 rounded-2xl text-xs uppercase tracking-[0.15em] font-medium transition-colors duration-300 ${
                            useLightTheme
                              ? 'bg-[#e0e5ec] shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff] text-slate-700 hover:text-blue-600'
                              : 'border border-white/[0.1] text-white hover:bg-white/[0.03]'
                          }`}
                        >
                          Sign In
                        </motion.button>
                      </Link>
                      <Link href="/write-review" onClick={() => setMobileMenuOpen(false)}>
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs uppercase tracking-[0.15em] font-medium ${
                            useLightTheme
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[4px_4px_10px_#b8bcc4,-4px_-4px_10px_#ffffff]'
                              : 'bg-white text-black'
                          }`}
                        >
                          Write Review
                          <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
