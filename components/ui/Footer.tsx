import Link from 'next/link';
import styles from './Footer.module.css';

const COLS = [
  {
    head: 'BROWSE',
    links: [
      { href: '/browse', label: 'All properties' },
      { href: '/browse/universities', label: 'By university' },
      { href: '/browse?sort=priceLow', label: 'By price' },
    ],
  },
  {
    head: 'STUDENTS',
    links: [
      { href: '/write-review', label: 'Write a review' },
      { href: '/quiz', label: 'Take the quiz' },
      { href: '/register', label: 'Verify your email' },
    ],
  },
  {
    head: 'COLOPHON',
    links: [
      { href: '/about', label: 'About' },
      { href: '/about#method', label: 'The method' },
      { href: '/support?tab=privacy', label: 'Privacy' },
      { href: '/support?tab=terms', label: 'Terms' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.root}>
      <div className={styles.main}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandWordmark}>
            Rate<em>My</em>Accom
          </Link>
          <div className={styles.brandMeta}>EST. SYDNEY, 2024</div>
          <p className={styles.brandDesc}>
            An <em>independent, student-run</em> review platform for student accommodation across
            New South Wales. <em>No commercial relationship with operators.</em>
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.head} className={styles.col}>
            <span className={styles.colHead}>{col.head}</span>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className={styles.colLink}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.colophon}>
        <span>© {year} RATEMYACCOM PTY LTD · SYDNEY NSW</span>
        <span>
          SET IN INTER · <em>printed on the internet</em>
        </span>
      </div>
    </footer>
  );
}
