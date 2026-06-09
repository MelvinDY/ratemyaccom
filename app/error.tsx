'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from '@/components/editorial/editorial.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for monitoring / debugging.
    console.error(error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.titlebarSingle}>
        <div className={styles.kicker}>§ ERROR — SOMETHING BROKE</div>
        <h1 className={styles.h1} style={{ fontSize: 'clamp(72px, 15vw, 200px)' }}>
          500<span className={styles.dot}>.</span>
        </h1>
        <p className={styles.lede}>
          Something went wrong on our end — <em>not your fault.</em> Try again, or head back to the
          index.
        </p>
        <div className={styles.btnRow} style={{ marginTop: 28 }}>
          <button
            type="button"
            onClick={reset}
            className={`${styles.btnPrimary} ${styles.btnInline}`}
          >
            ↻ Try again
          </button>
          <Link href="/" className={`${styles.btnSecondary} ${styles.btnInline}`}>
            ← Back to home
          </Link>
          <Link href="/browse" className={`${styles.btnSecondary} ${styles.btnInline}`}>
            Browse all properties →
          </Link>
        </div>
        {error.digest && (
          <p
            style={{
              marginTop: 24,
              fontFamily: 'var(--ed-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ed-mute)',
            }}
          >
            REF: {error.digest}
          </p>
        )}
      </div>

      <footer className={styles.colophon}>
        <span>© 2026 RATEMYACCOM · SYDNEY NSW</span>
        <span>
          SET IN INTER · <em>printed on the internet</em>
        </span>
      </footer>
    </div>
  );
}
