'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './Header.module.css';

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
}

interface NavLink {
  href: string;
  label: string;
  thePrefix?: boolean;
}

const navLinks: NavLink[] = [
  { href: '/browse', label: 'Browse' },
  { href: '/browse/universities', label: 'Universities' },
  { href: '/quiz', label: 'Quiz', thePrefix: true },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
];

function NavLabel({ link }: { link: NavLink }) {
  if (link.thePrefix) {
    return (
      <>
        <em>The</em> {link.label}
      </>
    );
  }
  return <>{link.label}</>;
}

interface HeaderProps {
  stats?: { properties: number; reviews: number; universities: number };
}

export default function Header({ stats }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userAreaRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const now = new Date();
  const week = getISOWeek(now).toString().padStart(2, '0');
  const year = now.getFullYear();

  // Live counts when available; fall back to em dashes on an empty/unseeded DB.
  const fmt = (n?: number) => (n && n > 0 ? n.toLocaleString('en-AU') : '—');
  const statLine = `${fmt(stats?.properties)} PROPERTIES · ${fmt(stats?.reviews)} REVIEWS · ${
    stats?.universities && stats.universities > 0 ? stats.universities : '—'
  } UNIS`;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userAreaRef.current && !userAreaRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className={styles.root}>
      {/* ── TOP BAR ── */}
      <div className={styles.topBar}>
        <div className={styles.dateline}>
          <span className={styles.liveDot} aria-hidden="true" />
          LIVE · VOL. 02 · NSW · WK {week} / {year}
        </div>
        <Link href="/" className={styles.wordmark}>
          Rate<em>My</em>Accom
        </Link>
        <div className={styles.stats}>{statLine}</div>
      </div>

      {/* ── SUBNAV ── */}
      <nav className={styles.subnav} aria-label="Main navigation">
        <div className={styles.subnavLinks}>
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <NavLabel link={link} />
              </Link>
            );
          })}
        </div>

        {/* Auth area — desktop */}
        <div className={styles.authArea}>
          {isAuthenticated && user ? (
            <>
              <Link href="/write-review" className={styles.writeReviewBtn}>
                Write a review →
              </Link>
              <div className={styles.userArea} ref={userAreaRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                >
                  <em>{user.name.split(' ')[0]}</em>
                  <span
                    className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ''}`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>
                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userDropdownHeader}>
                      <span className={styles.userDropdownName}>{user.name}</span>
                      <span className={styles.userDropdownEmail}>{user.email}</span>
                    </div>
                    <Link
                      href="/write-review"
                      className={styles.userDropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Write a review
                    </Link>
                    <button
                      className={`${styles.userDropdownItem} ${styles.signOutItem}`}
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className={styles.authLink}>
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <NavLabel link={link} />
              </Link>
            );
          })}
          <div className={styles.mobileDivider} />
          <div className={styles.mobileAuthSection}>
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/write-review"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Write a review
                </Link>
                <button className={styles.mobileNavLink} onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={styles.mobileNavLink}
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
