'use client';

import { useEffect } from 'react';
import './globals.css';
import styles from '@/components/editorial/editorial.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className={styles.page}>
          <div className={styles.titlebarSingle}>
            <div className={styles.kicker}>§ ERROR — SOMETHING BROKE</div>
            <h1 className={styles.h1} style={{ fontSize: 'clamp(72px, 15vw, 200px)' }}>
              500<span className={styles.dot}>.</span>
            </h1>
            <p className={styles.lede}>
              Something went wrong on our end — <em>not your fault.</em> Try reloading the page.
            </p>
            <div className={styles.btnRow} style={{ marginTop: 28 }}>
              <button
                type="button"
                onClick={reset}
                className={`${styles.btnPrimary} ${styles.btnInline}`}
              >
                ↻ Try again
              </button>
              <a href="/" className={`${styles.btnSecondary} ${styles.btnInline}`}>
                ← Back to home
              </a>
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
      </body>
    </html>
  );
}
