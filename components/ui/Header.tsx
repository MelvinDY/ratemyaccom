'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll position for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Page-specific theme configuration
  const getPageTheme = () => {
    if (pathname === '/about' || pathname?.startsWith('/about')) {
      return {
        bg: scrolled ? 'bg-transparent backdrop-blur-xl' : 'bg-transparent',
        border: scrolled ? 'border-blue-500/20' : 'border-transparent',
        accentGradient: 'from-blue-600 via-indigo-600 to-teal-600',
        navBg: 'bg-blue-500/10',
        navBorder: 'border-blue-500/20',
        navHover: 'hover:bg-blue-500/20',
        activeText: 'text-blue-400',
      };
    }

    if (pathname === '/browse' || pathname?.startsWith('/browse')) {
      return {
        bg: scrolled ? 'bg-charcoal/80' : 'bg-charcoal/40',
        border: 'border-white/10',
        accentGradient: 'from-lyra-purple-start to-lyra-purple-end',
        navBg: 'bg-white/5',
        navBorder: 'border-white/10',
        navHover: 'hover:bg-white/10',
        activeText: 'text-lyra-purple-start',
      };
    }

    // Default theme for home and other pages
    return {
      bg: scrolled ? 'bg-charcoal/80' : 'bg-transparent',
      border: scrolled ? 'border-white/10' : 'border-transparent',
      accentGradient: 'from-purple-600 to-pink-600',
      navBg: 'bg-white/5',
      navBorder: 'border-white/10',
      navHover: 'hover:bg-white/10',
      activeText: 'text-purple-400',
    };
  };

  const theme = getPageTheme();

  return (
    <header
      className={`${theme.bg} ${scrolled ? 'shadow-xl' : ''} sticky top-0 z-50 border-b ${theme.border} transition-all duration-300`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div
                className={`bg-gradient-to-r ${theme.accentGradient} text-white font-bold text-xl px-3 py-1 rounded-lg shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300`}
              >
                RMA
              </div>
              <span className="text-xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent hidden sm:block">
                Rate My Accom NSW
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div
              className={`inline-flex rounded-xl border ${theme.navBorder} ${theme.navBg} backdrop-blur-sm p-1 shadow-lg`}
            >
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

                return (
                  <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    className={`${
                      isActive ? `${theme.activeText} bg-white/10 font-semibold` : 'text-white/70'
                    } ${theme.navHover} hover:text-white rounded-lg transition-all duration-300`}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button className="border-2 border-white/20 text-white/90 px-4 py-2 rounded-xl font-medium hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300 text-sm">
              Sign In
            </button>
            <button
              className={`bg-gradient-to-r ${theme.accentGradient} text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-lyra-purple-start/50 hover:scale-105 transition-all duration-300 text-sm`}
            >
              Write Review
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/10 mt-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg ${
                    isActive ? `${theme.activeText} bg-white/10 font-semibold` : 'text-white/70'
                  } hover:bg-white/10 hover:text-white transition-all duration-300`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 space-y-2 border-t border-white/10 mt-4">
              <button className="w-full border-2 border-white/20 text-white/90 px-4 py-3 rounded-xl font-medium hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                Sign In
              </button>
              <button
                className={`w-full bg-gradient-to-r ${theme.accentGradient} text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300`}
              >
                Write Review
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
