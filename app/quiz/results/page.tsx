'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { QuizPreferences, RecommendationScore } from '@/types';
import api from '@/lib/api/client';
import styles from '@/components/editorial/editorial.module.css';

interface RecommendationResponse {
  success: boolean;
  data: {
    recommendations: RecommendationScore[];
    totalMatches: number;
    preferences: { university: string; budgetRange: string; prioritizedFactors: string[] };
  };
}

function scoreLabel(score: number) {
  if (score >= 90) {
    return 'Perfect match';
  }
  if (score >= 80) {
    return 'Excellent match';
  }
  if (score >= 70) {
    return 'Great match';
  }
  if (score >= 60) {
    return 'Good match';
  }
  if (score >= 50) {
    return 'Decent match';
  }
  return 'Partial match';
}

export default function QuizResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const stored = sessionStorage.getItem('quizPreferences');
        if (!stored) {
          router.push('/quiz');
          return;
        }
        const parsed: QuizPreferences = JSON.parse(stored);
        const response = await api.post<RecommendationResponse>('/recommendations', parsed);
        if (response.success && response.data) {
          setRecommendations(response.data.recommendations);
          setTotalMatches(response.data.totalMatches);
        } else {
          setError('Failed to get recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, [router]);

  const handleRetakeQuiz = () => {
    sessionStorage.removeItem('quizPreferences');
    router.push('/quiz');
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.titlebarSingle}>
          <div className={styles.kicker}>§ THE QUIZ · BUILDING YOUR LIST</div>
          <h1 className={styles.h1}>
            Finding your
            <br />
            <em>shortlist…</em>
          </h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.titlebarSingle}>
          <div className={styles.kicker}>§ THE QUIZ · ERROR</div>
          <h1 className={styles.h1}>
            Something
            <br />
            <em>broke.</em>
          </h1>
          <p className={styles.lede}>{error}</p>
          <button
            onClick={handleRetakeQuiz}
            className={`${styles.btnPrimary} ${styles.btnInline}`}
            style={{ marginTop: 24 }}
          >
            Try again →
          </button>
        </div>
      </div>
    );
  }

  const excellent = recommendations.filter((r) => r.score >= 80).length;
  const avg =
    recommendations.length > 0
      ? Math.round(recommendations.reduce((s, r) => s + r.score, 0) / recommendations.length)
      : 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.titlebar}>
        <div>
          <div className={styles.kicker}>§ THE QUIZ · YOUR SHORTLIST</div>
          <h1 className={styles.h1}>
            Your
            <br />
            <em>shortlist.</em>
          </h1>
        </div>
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0,
              border: '1px solid var(--ink)',
            }}
          >
            {[
              [totalMatches, 'MATCHES'],
              [excellent, 'EXCELLENT'],
              [`${avg}%`, 'AVG. SCORE'],
            ].map(([v, l], i) => (
              <div
                key={l}
                style={{ padding: '16px 18px', borderRight: i < 2 ? '1px solid var(--ink)' : 0 }}
              >
                <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em' }}>{v}</div>
                <div
                  style={{
                    fontFamily: 'var(--ed-mono)',
                    fontSize: 9,
                    letterSpacing: '0.06em',
                    color: 'var(--ed-mute)',
                    marginTop: 2,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleRetakeQuiz}
            className={`${styles.btnSecondary} ${styles.btnInline}`}
            style={{ width: '100%', marginTop: 10 }}
          >
            ↻ Retake the quiz
          </button>
        </div>
      </div>

      {/* Results */}
      <section className={styles.section}>
        {recommendations.length === 0 ? (
          <div className={styles.center} style={{ padding: '48px 0' }}>
            <p className={styles.h3} style={{ marginBottom: 16 }}>
              No matches yet.
            </p>
            <p className={styles.hint}>
              Try widening your budget or distance.{' '}
              <button
                onClick={handleRetakeQuiz}
                className={styles.resend}
                style={{ textTransform: 'none', letterSpacing: 0 }}
              >
                Adjust preferences →
              </button>
            </p>
          </div>
        ) : (
          <div>
            <div className={styles.kickerMute} style={{ marginBottom: 24 }}>
              ↘ RANKED FOR HOW YOU LIVE
            </div>
            <div style={{ borderTop: '1px solid var(--ink)' }}>
              {recommendations.map((result, index) => {
                const a = result.accommodation;
                return (
                  <article
                    key={a.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '64px 220px 1fr auto',
                      gap: 24,
                      alignItems: 'start',
                      padding: '28px 0',
                      borderBottom: '1px solid var(--ink)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--ed-mono)',
                        fontSize: 13,
                        fontStyle: 'italic',
                        color: 'var(--blue)',
                      }}
                    >
                      N° {String(index + 1).padStart(2, '0')}
                    </div>
                    <div
                      style={{
                        position: 'relative',
                        height: 140,
                        overflow: 'hidden',
                        background: 'var(--ed-blue-soft)',
                      }}
                    >
                      {a.images && a.images[0] && (
                        <Image src={a.images[0]} alt={a.name} fill style={{ objectFit: 'cover' }} />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--ed-mono)',
                          fontSize: 10,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--ed-mute)',
                          marginBottom: 6,
                        }}
                      >
                        {a.university} · {a.location.suburb}, {a.location.state}
                      </div>
                      <h3
                        style={{
                          fontSize: 28,
                          fontWeight: 600,
                          letterSpacing: '-0.03em',
                          margin: '0 0 8px',
                        }}
                      >
                        {a.name}
                      </h3>
                      <div
                        style={{
                          fontSize: 14,
                          color: 'var(--ed-ink-2)',
                          display: 'flex',
                          gap: 18,
                          marginBottom: 12,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>
                          <span style={{ color: 'var(--blue)', fontStyle: 'italic' }}>★</span>{' '}
                          {a.ratings.overall.toFixed(1)} ({a.ratings.totalReviews})
                        </span>
                        <span>
                          <em style={{ color: 'var(--ed-mute)', fontStyle: 'italic' }}>from</em> $
                          {a.pricing.min}–{a.pricing.max}/wk
                        </span>
                      </div>
                      {result.matchReasons.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {result.matchReasons.slice(0, 4).map((reason, i) => (
                            <span
                              key={i}
                              style={{
                                fontFamily: 'var(--ed-mono)',
                                fontSize: 10,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                padding: '4px 8px',
                                border: '1px solid var(--ed-rule)',
                                color: 'var(--blue)',
                              }}
                            >
                              + {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 160 }}>
                      <div
                        style={{
                          fontSize: 40,
                          fontWeight: 700,
                          letterSpacing: '-0.04em',
                          color: 'var(--blue)',
                          lineHeight: 1,
                        }}
                      >
                        {result.score}%
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--ed-mono)',
                          fontSize: 10,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'var(--ed-mute)',
                          margin: '4px 0 14px',
                        }}
                      >
                        {scoreLabel(result.score)}
                      </div>
                      <Link
                        href={`/accommodation/${a.slug}`}
                        className={`${styles.btnPrimary} ${styles.btnInline}`}
                        style={{ width: '100%' }}
                      >
                        View →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.btnRow} style={{ marginTop: 40 }}>
          <Link href="/browse" className={`${styles.btnSecondary} ${styles.btnInline}`}>
            Browse all properties →
          </Link>
        </div>
      </section>

      <footer className={styles.colophon}>
        <span>© 2026 RATEMYACCOM · SYDNEY NSW</span>
        <span>{totalMatches} MATCHES FOUND</span>
      </footer>
    </div>
  );
}
