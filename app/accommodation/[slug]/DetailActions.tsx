'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const SHORTLIST_KEY = 'rma:shortlist';

function readShortlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

const crumbReset: React.CSSProperties = {
  background: 'none',
  border: 0,
  padding: 0,
  cursor: 'pointer',
};

/** Save / un-save this property to a localStorage shortlist. */
export function SaveButton({
  slug,
  mode = 'crumb',
}: {
  slug: string;
  mode?: 'crumb' | 'ghost' | 'secondary';
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readShortlist().includes(slug));
  }, [slug]);

  const toggle = () => {
    const list = readShortlist();
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
    setSaved(next.includes(slug));
  };

  if (mode === 'ghost') {
    return (
      <button onClick={toggle} className={styles.btnGhost}>
        {saved ? '★ SAVED TO SHORTLIST' : '★ ADD TO SHORTLIST'}
      </button>
    );
  }

  if (mode === 'secondary') {
    return (
      <button onClick={toggle} className={styles.btnSecondary} style={{ gridColumn: '1 / -1' }}>
        {saved ? '★ SAVED TO SHORTLIST' : '★ ADD TO SHORTLIST'}
      </button>
    );
  }

  return (
    <button onClick={toggle} className={styles.crumbAction} style={crumbReset}>
      ★ <span className={styles.crumbActionItalic}>{saved ? 'Saved' : 'Save to shortlist'}</span>
    </button>
  );
}

/** Share via the Web Share API, falling back to copying the link. */
export function ShareButton({
  title,
  mode = 'crumb',
}: {
  title: string;
  mode?: 'crumb' | 'ghost';
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  if (mode === 'ghost') {
    return (
      <button onClick={share} className={styles.btnGhost}>
        {copied ? '✓ LINK COPIED' : '↗ SHARE'}
      </button>
    );
  }

  return (
    <button onClick={share} className={styles.crumbAction} style={crumbReset}>
      ↗ <span className={styles.crumbActionItalic}>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  );
}
