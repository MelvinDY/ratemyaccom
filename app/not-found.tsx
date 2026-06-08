import Link from 'next/link';
import { prisma } from '@/lib/database/prisma';
import styles from '@/components/editorial/editorial.module.css';

async function getSuggestions() {
  try {
    return await prisma.accommodation.findMany({
      orderBy: [{ featured: 'desc' }, { ratingOverall: 'desc' }],
      take: 4,
      select: { name: true, slug: true, university: true, suburb: true, ratingOverall: true },
    });
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const suggestions = await getSuggestions();

  return (
    <div className={styles.page}>
      <div className={styles.titlebarSingle}>
        <div className={styles.kicker}>§ ERROR — PAGE NOT ON THE INDEX</div>
        <h1 className={styles.h1} style={{ fontSize: 'clamp(80px, 16vw, 220px)' }}>
          404<span className={styles.dot}>.</span>
        </h1>
        <p className={styles.lede}>
          This page isn&apos;t in the catalogue. It may have moved, or never existed.{' '}
          <em>Here&apos;s where to go instead.</em>
        </p>
        <div className={styles.btnRow} style={{ marginTop: 28 }}>
          <Link href="/" className={`${styles.btnPrimary} ${styles.btnInline}`}>
            ← Back to home
          </Link>
          <Link href="/browse" className={`${styles.btnSecondary} ${styles.btnInline}`}>
            Browse all properties →
          </Link>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className={styles.section}>
          <div className={styles.kickerMute} style={{ marginBottom: 24 }}>
            ↘ A FEW WORTH SEEING
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 0,
              border: '1px solid var(--ink)',
              borderRight: 0,
              borderBottom: 0,
            }}
          >
            {suggestions.map((s) => (
              <Link
                key={s.slug}
                href={`/accommodation/${s.slug}`}
                style={{
                  padding: 24,
                  borderRight: '1px solid var(--ink)',
                  borderBottom: '1px solid var(--ink)',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--ed-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-mute)',
                    marginBottom: 8,
                  }}
                >
                  {s.university} · {s.suburb}
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
                  {s.name}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 18,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span style={{ color: 'var(--blue)', fontStyle: 'italic', marginRight: 4 }}>
                    ★
                  </span>
                  {s.ratingOverall.toFixed(1)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.colophon}>
        <span>© 2026 RATEMYACCOM · SYDNEY NSW</span>
        <span>
          SET IN INTER · <em>printed on the internet</em>
        </span>
      </footer>
    </div>
  );
}
