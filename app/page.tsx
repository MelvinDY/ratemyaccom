import Link from 'next/link';
import { prisma } from '@/lib/database/prisma';
import HeroRotator from '@/components/home/HeroRotator';
import { getPlatformStats } from '@/lib/stats';
import styles from './page.module.css';

async function getFeaturedAccommodations() {
  try {
    return await prisma.accommodation.findMany({
      orderBy: [{ featured: 'desc' }, { ratingOverall: 'desc' }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        university: true,
        suburb: true,
        type: true,
        priceMin: true,
        priceMax: true,
        ratingOverall: true,
        totalReviews: true,
        distanceToCampus: true,
        reviews: {
          where: { status: 'PUBLISHED' },
          orderBy: { rating: 'desc' },
          take: 1,
          select: { text: true, rating: true, user: { select: { name: true } } },
        },
      },
    });
  } catch {
    return [];
  }
}

const DIMS = [
  ['CLEANLINESS', 4.5],
  ['LOCATION', 4.8],
  ['VALUE', 4.0],
  ['AMENITIES', 4.4],
  ['MANAGEMENT', 4.2],
  ['SAFETY', 4.7],
] as const;

export default async function HomePage() {
  const [allAccoms, stats] = await Promise.all([getFeaturedAccommodations(), getPlatformStats()]);
  const heroes = allAccoms.slice(0, 2);
  const index = allAccoms.slice(2, 8);
  const avgRating =
    allAccoms.length > 0
      ? (allAccoms.reduce((s, a) => s + a.ratingOverall, 0) / allAccoms.length).toFixed(1)
      : '—';
  const fmt = (n: number) => (n > 0 ? n.toLocaleString('en-AU') : '—');

  return (
    <div className={styles.page}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.coverKicker}>
          ── COVER STORY · <em>The</em> 2026 NSW STUDENT HOUSING REPORT
        </div>

        <h1 className={styles.heroH1}>
          Where you&apos;ll
          <br />
          <HeroRotator />
        </h1>

        <div className={styles.heroRight}>
          <p className={styles.heroLede}>
            Real student reviews. Every NSW building worth knowing about.{' '}
            <em>One brief: tell the truth.</em>
          </p>
          <div className={styles.heroCtas}>
            <Link href="/browse" className={styles.ctaPrimary}>
              BROWSE THE LIST →
            </Link>
            <Link href="/write-review" className={styles.ctaSecondary}>
              WRITE A REVIEW
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div>
              <div className={styles.statNum}>{fmt(stats.properties)}</div>
              <div className={styles.statLabel}>PROPERTIES</div>
            </div>
            <div>
              <div className={styles.statNum}>{fmt(stats.reviews)}</div>
              <div className={styles.statLabel}>REVIEWS</div>
            </div>
            <div>
              <div className={styles.statNum}>
                {avgRating} <span style={{ color: 'var(--ed-blue)', fontStyle: 'italic' }}>★</span>
              </div>
              <div className={styles.statLabel}>AVG. RATING</div>
            </div>
            <div>
              <div className={styles.statNum}>
                {stats.universities > 0 ? stats.universities : '—'}
              </div>
              <div className={styles.statLabel}>UNIVERSITIES</div>
            </div>
          </div>
        </div>

        {/* Cover — strip-drop animation (CSS globals heroB-*) */}
        <div className={`heroB-cover ${styles.cover}`}>
          <div className="heroB-strip" />
          <div className="heroB-strip" />
          <div className="heroB-strip" />
          <div className="heroB-strip" />
          <div className="heroB-frame" />
          <div
            className="mono"
            style={{
              position: 'absolute',
              top: 16,
              right: 18,
              color: 'rgba(255,255,255,0.92)',
              opacity: 0.6,
              zIndex: 6,
            }}
          >
            FIG. 01 / COVER
          </div>
          <div
            className="mono"
            style={{
              position: 'absolute',
              bottom: 16,
              left: 18,
              color: 'rgba(255,255,255,0.92)',
              opacity: 0.85,
              zIndex: 6,
            }}
          >
            NSW STUDENT HOUSING REPORT · 2026 · EDITORIAL
          </div>
          <div className="heroB-float">
            <span className="big">N° 01</span>a place worth coming home to.
          </div>
        </div>
      </section>

      {/* ── ROLLING MARQUEE ── */}
      <div className="heroB-marquee-wrap">
        <div className="heroB-marquee">
          <span>No paid placements.</span>
          <span className="dot" />
          <span>
            <i>Verified students only.</i>
          </span>
          <span className="dot" />
          <span>Six numbers, not one star.</span>
          <span className="dot" />
          <span>
            <i>Reviews stay up.</i>
          </span>
          <span className="dot" />
          <span>Independent.</span>
          <span className="dot" />
          <span>
            <i>Student-run.</i>
          </span>
          <span className="dot" />
          <span>No paid placements.</span>
          <span className="dot" />
          <span>
            <i>Verified students only.</i>
          </span>
          <span className="dot" />
          <span>Six numbers, not one star.</span>
          <span className="dot" />
          <span>
            <i>Reviews stay up.</i>
          </span>
          <span className="dot" />
          <span>Independent.</span>
          <span className="dot" />
          <span>
            <i>Student-run.</i>
          </span>
          <span className="dot" />
        </div>
      </div>

      {/* ── MANIFESTO ── */}
      <section className={styles.manifesto}>
        <div className={styles.manifestoKicker}>↘ THE PITCH, IN SEVENTEEN WORDS</div>
        <p className={styles.manifestoText}>
          We don&apos;t list <em>the places that pay us.</em>{' '}
          <span className={styles.manifestoBlue}>
            We list <em>the places students survived,</em>
          </span>{' '}
          rated, and would do again.
        </p>
      </section>

      {/* ── TWO HERO ARTICLES ── */}
      <section className={styles.indexSection}>
        <div className={styles.indexHead}>
          <div>
            <div className={styles.indexHeadMono}>§ 01 — THE INDEX</div>
            <div className={`${styles.indexHeadMono} ${styles.indexHeadMonoMute}`}>P. 03 — 07</div>
          </div>
          <h2 className={styles.indexH2}>
            Two hero buildings.
            <br />
            <em>The rest of the week&apos;s index below.</em>
          </h2>
        </div>

        {heroes.map((accom, i) => (
          <Link
            key={accom.id}
            href={`/accommodation/${accom.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <article
              className={`${styles.heroArticle} ${i === heroes.length - 1 ? styles.heroArticleLast : ''}`}
            >
              <div className={styles.articleNum}>0{i + 1}</div>
              <div>
                <div className={styles.articleUni}>{accom.university.toUpperCase()}</div>
                <h3 className={styles.articleName}>{accom.name}</h3>
                <div className={styles.articleTag}>
                  ↳ {accom.type.replace('-', ' ')} · {accom.suburb}
                </div>
                {accom.reviews[0] ? (
                  <>
                    <p className={styles.articleQuote}>
                      &ldquo;{accom.reviews[0].text.slice(0, 140)}&rdquo;
                    </p>
                    <div className={styles.articleByline}>
                      — {accom.reviews[0].user.name.toUpperCase()} ·{' '}
                      {accom.reviews[0].rating.toFixed(1)} ★
                    </div>
                  </>
                ) : (
                  <p className={styles.articleQuote}>
                    <em>
                      ★ {accom.ratingOverall.toFixed(1)} overall · {accom.totalReviews} reviews
                    </em>
                  </p>
                )}
              </div>
              <div>
                <div className={styles.articlePhoto}>
                  <div className={styles.articlePhotoFig}>FIG. 0{i + 2}</div>
                  <div className={styles.articlePhotoLabel}>{accom.name.toUpperCase()}</div>
                </div>
                <div className={styles.articleDataGrid}>
                  {(
                    [
                      ['SUBURB', accom.suburb],
                      ['DISTANCE', accom.distanceToCampus ? `${accom.distanceToCampus} km` : '—'],
                      ['RATING', `${accom.ratingOverall.toFixed(1)} (${accom.totalReviews})`],
                      ['PRICE / WEEK', `$${accom.priceMin}–${accom.priceMax}`],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <div key={k} className={styles.articleDataCell}>
                      <div className={styles.articleDataKey}>{k}</div>
                      <div className={styles.articleDataVal}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </Link>
        ))}

        {heroes.length === 0 && (
          <div
            style={{
              padding: '48px 0',
              textAlign: 'center',
              fontStyle: 'italic',
              color: 'var(--ed-mute)',
              borderTop: '1px solid var(--ed-ink)',
            }}
          >
            No properties yet.{' '}
            <Link href="/browse" style={{ color: 'var(--ed-blue)' }}>
              Browse all →
            </Link>
          </div>
        )}
      </section>

      {/* ── WEEKLY INDEX GRID ── */}
      {index.length > 0 && (
        <section className={styles.weeklySection}>
          <div className={styles.weeklyHead}>
            <h3 className={styles.weeklyH3}>
              <em>The rest of</em> this week&apos;s index
            </h3>
            <div className={styles.weeklyHeadRight}>
              SHOWING {index.length} OF {fmt(stats.properties)} ·{' '}
              <Link href="/browse">SEE ALL →</Link>
            </div>
          </div>
          <div className={styles.indexGrid}>
            {index.map((accom, i) => (
              <Link
                key={accom.id}
                href={`/accommodation/${accom.slug}`}
                className={styles.indexCard}
              >
                <div className={styles.indexCardTopRow}>
                  <span className={styles.indexCardNum}>N° {String(i + 3).padStart(2, '0')}</span>
                  <span className={styles.indexCardKicker}>{accom.type.replace('-', ' ')}</span>
                </div>
                <div className={styles.indexCardPhoto} />
                <div>
                  <div className={styles.indexCardMeta}>
                    {accom.university.toUpperCase()} · {accom.suburb.toUpperCase()}
                  </div>
                  <h4 className={styles.indexCardName}>{accom.name}</h4>
                </div>
                <div className={styles.indexCardFooter}>
                  <div className={styles.indexCardStat}>
                    {accom.ratingOverall.toFixed(1)}
                    <span className={styles.indexCardStatSub}>({accom.totalReviews})</span>
                  </div>
                  <div className={styles.indexCardStat}>
                    <span className={styles.indexCardFrom}>from</span>${accom.priceMin}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── BLUE SLAB ── */}
      <section className={styles.blueSlab}>
        <div className={styles.blueSlabSection}>§ 02 — THE METHOD</div>
        <h2 className={styles.blueSlabH2}>
          Six numbers,
          <br />
          <em>not one star.</em>
        </h2>
        <div className={styles.blueSlabCols}>
          <p className={styles.blueSlabCol}>
            Every review is broken down across{' '}
            <em>cleanliness, location, value, amenities, management, and safety.</em> So a
            &ldquo;good place&rdquo; doesn&apos;t hide a bad lease.
          </p>
          <p className={styles.blueSlabCol}>
            Only verified students can post. We check the university email, then the receipt.{' '}
            <em>No agents, no astroturf,</em> no five-star reviews from accounts three days old.
          </p>
          <p className={styles.blueSlabCol}>
            Reviews stay up. The good ones, the embarrassing ones, the angry ones. Operators get{' '}
            <em>a right of reply,</em> not a right of deletion.
          </p>
        </div>
        <div className={styles.blueSlabDims}>
          {DIMS.map(([key, val]) => (
            <div key={key}>
              <div className={styles.blueSlabDimKey}>{key}</div>
              <div className={styles.blueSlabDimVal}>{val}</div>
              <div className={styles.blueSlabBar}>
                <div className={styles.blueSlabBarFill} style={{ width: `${(val / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUIZ STRIP ── */}
      <section className={styles.quizStrip}>
        <div className={styles.quizGrid}>
          <div>
            <div className={styles.quizKicker}>§ 03 — THE QUIZ</div>
            <h2 className={styles.quizH2}>
              Twelve
              <br />
              questions.
              <br />
              <em>One real list.</em>
            </h2>
          </div>
          <div>
            <p className={styles.quizBody}>
              Loud or quiet. Cooks every night, or once a week.{' '}
              <em>Tell us how you actually live.</em> We&apos;ll rank the properties against your
              shape, and show you the top six.
            </p>
            <div className={styles.quizStats}>
              <div>
                <div className={styles.quizStatNum}>2:14</div>
                <div className={styles.quizStatLabel}>AVG. COMPLETION</div>
              </div>
              <div>
                <div className={styles.quizStatNum}>87%</div>
                <div className={styles.quizStatLabel}>SIGNED A SHORTLISTED PLACE</div>
              </div>
            </div>
            <Link href="/quiz" className={styles.quizCta}>
              BEGIN THE QUIZ →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
