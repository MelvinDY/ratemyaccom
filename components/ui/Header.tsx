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
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const { user, isAuthenticated, logout } = useAuth();

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        // Scrolling down & past threshold - hide header
        setHidden(true);
      } else {
        // Scrolling up - show header
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  // Simple transparent theme for all pages
  const theme = {
    accentGradient: 'from-purple-500 to-violet-500',
    navBg: 'bg-white/[0.05]',
    navBorder: 'border-white/[0.1]',
    navHover: 'hover:bg-white/[0.08]',
    activeText: 'text-purple-400',
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-transparent transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
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
              className={`inline-flex rounded-xl border ${theme.navBorder} ${theme.navBg} backdrop-blur-md p-1`}
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
