'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  // Track scroll position for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Page-specific theme configuration
  const getPageTheme = () => {
    if (pathname === '/about' || pathname?.startsWith('/about')) {
      return {
        bg: scrolled
          ? 'bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900/95 backdrop-blur-xl'
          : 'bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900',
        border: scrolled ? 'border-blue-500/20' : 'border-transparent',
        accentGradient: 'from-blue-600 via-indigo-600 to-teal-600',
        navBg: 'bg-blue-500/10',
        navBorder: 'border-blue-500/20',
        navHover: 'hover:bg-blue-500/20',
        activeText: 'text-blue-400',
      };
    }

    if (pathname === '/support' || pathname?.startsWith('/support')) {
      return {
        bg: scrolled
          ? 'bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900/95 backdrop-blur-xl'
          : 'bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900',
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
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="RMA Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
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
            {isAuthenticated && user ? (
              <>
                <Link href="/write-review">
                  <button
                    className={`bg-gradient-to-r ${theme.accentGradient} text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm`}
                  >
                    Write Review
                  </button>
                </Link>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 border-2 border-white/20 text-white/90 px-3 py-2 rounded-xl font-medium hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300 text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-charcoal border border-white/20 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-medium truncate">{user.name}</p>
                        <p className="text-white/50 text-sm truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="border-2 border-white/20 text-white/90 px-4 py-2 rounded-xl font-medium hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300 text-sm">
                    Sign In
                  </button>
                </Link>
                <Link href="/write-review">
                  <button
                    className={`bg-gradient-to-r ${theme.accentGradient} text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm`}
                  >
                    Write Review
                  </button>
                </Link>
              </>
            )}
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
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-white/50 text-sm truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link href="/write-review" onClick={() => setMobileMenuOpen(false)}>
                    <button
                      className={`w-full bg-gradient-to-r ${theme.accentGradient} text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300`}
                    >
                      Write Review
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 border-2 border-white/20 text-white/90 px-4 py-3 rounded-xl font-medium hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full border-2 border-white/20 text-white/90 px-4 py-3 rounded-xl font-medium hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/write-review" onClick={() => setMobileMenuOpen(false)}>
                    <button
                      className={`w-full bg-gradient-to-r ${theme.accentGradient} text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300`}
                    >
                      Write Review
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
