import Link from 'next/link';
import styles from '@/components/editorial/editorial.module.css';

export const metadata = {
  title: 'About — The Method · Rate My Accom',
  description:
    'Why Rate My Accom exists: an independent, student-run review platform. Six numbers, not one star. No paid placements, verified students only.',
};

const DIMS = [
  ['CLEANLINESS', 'Is it actually kept clean, or just photographed clean?'],
  ['LOCATION', 'How far is the walk you’ll do twice a day for a year?'],
  ['VALUE', 'What you pay versus what you actually get.'],
  ['AMENITIES', 'Gym, study rooms, laundry — and whether they work.'],
  ['MANAGEMENT', 'Do they answer the phone when something breaks?'],
  ['SAFETY', 'How it feels walking home at 1am.'],
] as const;

const VALUES = [
  [
    'Independent',
    'No commercial relationship with operators. We don’t list the places that pay us.',
  ],
  ['Verified', 'Only students with a university email can post. No agents, no astroturf.'],
  [
    'Permanent',
    'Reviews stay up — the good, the embarrassing, the angry. Operators get a reply, not a delete.',
  ],
  ['Private', 'Your email verifies you once. We don’t sell it, share it, or surface it.'],
] as const;

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* ── TITLE ── */}
      <div className={styles.titlebar}>
        <div>
          <div className={styles.kicker}>§ ABOUT — THE METHOD</div>
          <h1 className={styles.h1}>
            Six numbers,
            <br />
            <em>not one star.</em>
          </h1>
        </div>
        <p className={styles.lede}>
          Rate My Accom is an <em>independent, student-run</em> review platform for student
          accommodation across New South Wales. We exist because choosing where to live shapes your
          whole degree — and <em>nobody honest was telling you the truth.</em>
        </p>
      </div>

      {/* ── MANIFESTO ── */}
      <section className={styles.section}>
        <div className={styles.kickerMute} style={{ marginBottom: 8 }}>
          ↘ THE PITCH, IN SEVENTEEN WORDS
        </div>
        <p className={styles.h2} style={{ maxWidth: 1100 }}>
          We don&apos;t list <em>the places that pay us.</em> We list{' '}
          <em>the places students survived,</em> rated, and would do again.
        </p>
      </section>

      {/* ── THE METHOD (blue slab) ── */}
      <section className={styles.slab}>
        <div className={styles.slabKicker}>§ 01 — HOW THE RATING WORKS</div>
        <h2 className={styles.slabH2}>
          Every review,
          <br />
          <em>six dimensions.</em>
        </h2>
        <p className={styles.slabBody} style={{ marginBottom: 56 }}>
          A single star hides everything that matters. So each review is broken down across six
          numbers — and a &ldquo;good place&rdquo; can&apos;t hide a bad lease.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 32,
            borderTop: '1px solid rgba(255,255,255,0.3)',
            paddingTop: 40,
          }}
        >
          {DIMS.map(([name, desc]) => (
            <div key={name}>
              <div
                style={{
                  fontFamily: 'var(--ed-mono)',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  marginBottom: 10,
                  opacity: 0.7,
                }}
              >
                {name}
              </div>
              <p style={{ fontSize: 17, lineHeight: 1.45, opacity: 0.95, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.kicker}>§ 02 — WHAT WE STAND FOR</div>
          <h2 className={styles.h2}>
            Four things we <em>won&apos;t</em> compromise.
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 0,
            border: '1px solid var(--ink)',
            borderRight: 0,
            borderBottom: 0,
          }}
        >
          {VALUES.map(([title, desc]) => (
            <div
              key={title}
              style={{
                padding: 32,
                borderRight: '1px solid var(--ink)',
                borderBottom: '1px solid var(--ink)',
              }}
            >
              <h3 className={styles.h3} style={{ marginBottom: 12 }}>
                {title}
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ed-ink-2)', margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEVELOPER ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.kicker}>§ 03 — THE COLOPHON</div>
          <h2 className={styles.h2}>
            Built by a student, <em>for students.</em>
          </h2>
        </div>
        <div className={styles.body} style={{ maxWidth: 720 }}>
          <p>
            Rate My Accom is built and maintained by <em>Melvin DY</em>, a full-stack developer and
            university student who got tired of choosing accommodation blind. It&apos;s open source,
            built in the open with Next.js, TypeScript, Prisma and PostgreSQL.
          </p>
          <div className={styles.btnRow} style={{ marginTop: 8 }}>
            <a
              href="https://melvindy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btnSecondary} ${styles.btnInline}`}
            >
              View portfolio →
            </a>
            <a
              href="https://github.com/MelvinDY/ratemyaccom"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btnSecondary} ${styles.btnInline}`}
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.section} style={{ borderBottom: 0 }}>
        <h2 className={styles.h2} style={{ marginBottom: 28 }}>
          Ready to find your <em>place?</em>
        </h2>
        <div className={styles.btnRow}>
          <Link href="/browse" className={`${styles.btnPrimary} ${styles.btnInline}`}>
            Browse accommodations →
          </Link>
          <Link href="/register" className={`${styles.btnSecondary} ${styles.btnInline}`}>
            Create an account
          </Link>
        </div>
      </section>

      <footer className={styles.colophon}>
        <span>© 2026 RATEMYACCOM · SYDNEY NSW</span>
        <span>
          SET IN INTER · <em>printed on the internet</em>
        </span>
      </footer>
    </div>
  );
}
