'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Review } from '@/types';
import styles from './page.module.css';

const DIMS: { key: keyof Review['ratingBreakdown']; label: string }[] = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'location', label: 'Location' },
  { key: 'value', label: 'Value' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'management', label: 'Management' },
  { key: 'safety', label: 'Safety' },
];

type Filter = 'all' | 'positive' | 'critical' | 'newest';

function fmtDate(d: Date | string) {
  return new Date(d)
    .toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function ReviewEntry({ review }: { review: Review }) {
  return (
    <div className={styles.rentry}>
      <div className={styles.rentryHead}>
        <div className={styles.rentryRate}>
          <span className={styles.reviewStar}>★</span>
          {review.rating.toFixed(1)}
        </div>
        <div className={styles.rentryByline}>
          — <b>{review.userName.toUpperCase()}</b>
          {review.userUniversity && ` · ${review.userUniversity.toUpperCase()}`} ·{' '}
          {fmtDate(review.createdAt)}
        </div>
      </div>
      <h4 className={styles.rentryH4}>{review.title || <em>Student review</em>}</h4>
      <p className={styles.rentryText}>
        {review.text.slice(0, 280)}
        {review.text.length > 280 ? '…' : ''}
      </p>
      {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
        <div className={styles.prosCons}>
          {review.pros && review.pros.length > 0 && (
            <div className={`${styles.prosConsCol} ${styles.prosConsColP}`}>
              <h5>↑ PROS</h5>
              <ul className={styles.prosConsList}>
                {review.pros.slice(0, 3).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div className={styles.prosConsCol}>
              <h5>↓ CONS</h5>
              <ul className={`${styles.prosConsList} ${styles.consConsList}`}>
                {review.cons.slice(0, 3).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DetailReviews({
  reviews,
  totalReviews,
  writeReviewHref,
}: {
  reviews: Review[];
  totalReviews: number;
  writeReviewHref: string;
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const criticalCount = reviews.filter((r) => r.rating < 4).length;

  const filtered = useMemo(() => {
    switch (filter) {
      case 'positive':
        return reviews.filter((r) => r.rating >= 4);
      case 'critical':
        return reviews.filter((r) => r.rating < 4);
      case 'newest':
        return [...reviews].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return reviews;
    }
  }, [reviews, filter]);

  const featured = filtered[0] ?? null;
  const others = filtered.slice(1, 5);
  const leftCol = others.filter((_, i) => i % 2 === 0);
  const rightCol = others.filter((_, i) => i % 2 === 1);

  const tab = (key: Filter, label: string) => (
    <button
      className={`${styles.reviewToolbarBtn} ${filter === key ? styles.reviewToolbarBtnActive : ''}`}
      onClick={() => setFilter(key)}
    >
      {label}
    </button>
  );

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.reviewsHead}>
        <h3 className={styles.reviewsH3}>
          Reviews <em>from</em> students.
        </h3>
        <div className={styles.reviewToolbar}>
          {tab('all', `★ ALL · ${totalReviews}`)}
          {tab('positive', `↑ POSITIVE · ${positiveCount}`)}
          {tab('critical', `↓ CRITICAL · ${criticalCount}`)}
          {tab('newest', 'NEWEST')}
        </div>
      </div>

      {featured ? (
        <>
          <article className={styles.reviewFeatured}>
            <div className={styles.figmark}>
              <span>FEATURED REVIEW</span>
              <span className={styles.figmarkBig}>{featured.rating.toFixed(1)}</span>
              <span className={styles.figmarkStar}>
                {Array.from({ length: 5 }, (_, i) =>
                  i < Math.round(featured.rating) ? '★' : '☆'
                ).join(' ')}
              </span>
            </div>
            <div>
              <p className={styles.featuredQuote}>
                &ldquo;{featured.title || featured.text.slice(0, 120)}&rdquo;
              </p>
              <p className={styles.featuredBody}>{featured.text}</p>
              <div className={styles.featuredByline}>
                — <b>{featured.userName.toUpperCase()}</b>
                {featured.userUniversity && ` · ${featured.userUniversity.toUpperCase()}`}
                {featured.roomType && ` · ${featured.roomType.toUpperCase()}`}
                {featured.stayDuration && `, ${featured.stayDuration.toUpperCase()}`} · POSTED{' '}
                {fmtDate(featured.createdAt)}
              </div>
            </div>
            <div className={styles.ratingBreakdownGrid}>
              {DIMS.map(({ key, label }) => (
                <div key={key} className={styles.ratingBreakdownItem}>
                  <span className={styles.ratingItemLabel}>{label.toUpperCase().slice(0, 5)}</span>
                  <span className={styles.ratingItemVal}>
                    <span className={styles.reviewStar}>★</span>
                    {featured.ratingBreakdown[key].toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {others.length > 0 && (
            <div className={styles.reviewCols}>
              <div className={styles.reviewCol}>
                {leftCol.map((review) => (
                  <ReviewEntry key={review.id} review={review} />
                ))}
              </div>
              <div className={styles.reviewCol}>
                {rightCol.map((review) => (
                  <ReviewEntry key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            padding: '48px 0',
            borderTop: '1px solid var(--ed-ink)',
            textAlign: 'center',
            color: 'var(--ed-mute)',
            fontFamily: 'var(--ed-mono)',
            fontSize: 13,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {totalReviews === 0 ? 'NO REVIEWS YET — ' : 'NONE IN THIS FILTER — '}
          <Link
            href={writeReviewHref}
            style={{
              color: 'var(--ed-blue)',
              fontStyle: 'italic',
              textTransform: 'none',
              letterSpacing: 0,
            }}
          >
            {totalReviews === 0 ? 'be the first to write one.' : 'write a review.'}
          </Link>
        </div>
      )}
    </section>
  );
}
