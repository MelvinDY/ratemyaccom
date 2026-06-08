import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/database/prisma';
import type { Accommodation, Review } from '@/types';
import DetailReviews from './DetailReviews';
import { SaveButton, ShareButton } from './DetailActions';
import styles from './page.module.css';

interface AccommodationPageProps {
  params: { slug: string };
}

interface ComparableAccom {
  id: string;
  name: string;
  slug: string;
  university: string;
  suburb: string;
  type: string;
  priceMin: number;
  ratingOverall: number;
  totalReviews: number;
}

async function getAccommodation(slug: string): Promise<{
  accommodation: Accommodation;
  reviews: Review[];
  comparables: ComparableAccom[];
} | null> {
  try {
    const dbAccommodation = await prisma.accommodation.findFirst({
      where: { OR: [{ id: slug }, { slug: slug }] },
      include: {
        amenities: { include: { amenity: true } },
        reviews: {
          where: { status: 'PUBLISHED' },
          orderBy: { rating: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true, university: true, verified: true } },
          },
        },
      },
    });

    if (!dbAccommodation) {
      return null;
    }

    const comparables = await prisma.accommodation.findMany({
      where: { university: dbAccommodation.university, id: { not: dbAccommodation.id } },
      select: {
        id: true,
        name: true,
        slug: true,
        university: true,
        suburb: true,
        type: true,
        priceMin: true,
        ratingOverall: true,
        totalReviews: true,
      },
      orderBy: { ratingOverall: 'desc' },
      take: 3,
    });

    const accommodation: Accommodation = {
      id: dbAccommodation.id,
      name: dbAccommodation.name,
      slug: dbAccommodation.slug,
      university: dbAccommodation.university,
      location: {
        address: dbAccommodation.address,
        suburb: dbAccommodation.suburb,
        state: dbAccommodation.state,
        postcode: dbAccommodation.postcode,
        ...(dbAccommodation.latitude && dbAccommodation.longitude
          ? { coordinates: { lat: dbAccommodation.latitude, lng: dbAccommodation.longitude } }
          : {}),
      },
      description: dbAccommodation.description,
      type: dbAccommodation.type.toLowerCase().replace('_', '-') as Accommodation['type'],
      images: dbAccommodation.images,
      amenities: dbAccommodation.amenities.map((aa) => ({
        id: aa.amenity.id,
        name: aa.amenity.name,
        ...(aa.amenity.icon ? { icon: aa.amenity.icon } : {}),
        available: aa.available,
      })),
      pricing: {
        min: dbAccommodation.priceMin,
        max: dbAccommodation.priceMax,
        currency: dbAccommodation.currency,
        period: dbAccommodation.pricePeriod.toLowerCase() as 'week' | 'month' | 'semester' | 'year',
      },
      capacity: dbAccommodation.capacity,
      roomTypes: dbAccommodation.roomTypes,
      contactInfo: dbAccommodation.contactInfo as {
        phone?: string;
        email?: string;
        website?: string;
      },
      ratings: {
        overall: dbAccommodation.ratingOverall,
        breakdown: {
          cleanliness: dbAccommodation.ratingCleanliness,
          location: dbAccommodation.ratingLocation,
          value: dbAccommodation.ratingValue,
          amenities: dbAccommodation.ratingAmenities,
          management: dbAccommodation.ratingManagement,
          safety: dbAccommodation.ratingSafety,
        },
        totalReviews: dbAccommodation.totalReviews,
      },
      distance: {
        toCampus: dbAccommodation.distanceToCampus || 0,
        toTransport: dbAccommodation.distanceToTransport || 0,
      },
      verified: dbAccommodation.verified,
      featured: dbAccommodation.featured,
      createdAt: dbAccommodation.createdAt,
      updatedAt: dbAccommodation.updatedAt,
      lastVerified: dbAccommodation.lastVerified,
      sourceUrl: dbAccommodation.sourceUrl,
    };

    const reviews: Review[] = dbAccommodation.reviews.map((r) => ({
      id: r.id,
      accommodationId: r.accommodationId,
      userId: r.userId,
      userName: r.user.name,
      ...(r.user.university ? { userUniversity: r.user.university } : {}),
      rating: r.rating,
      ratingBreakdown: {
        cleanliness: r.ratingCleanliness,
        location: r.ratingLocation,
        value: r.ratingValue,
        amenities: r.ratingAmenities,
        management: r.ratingManagement,
        safety: r.ratingSafety,
      },
      title: r.title,
      text: r.text,
      pros: r.pros,
      cons: r.cons,
      verified: r.verified,
      ...(r.roomType ? { roomType: r.roomType } : {}),
      ...(r.stayDuration ? { stayDuration: r.stayDuration } : {}),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      helpful: r.helpful,
      reported: r.reported,
    }));

    return { accommodation, reviews, comparables };
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    return null;
  }
}

export async function generateMetadata({ params }: AccommodationPageProps): Promise<Metadata> {
  const result = await getAccommodation(params.slug);
  if (!result) {
    return { title: 'Not Found' };
  }
  const { accommodation } = result;
  return {
    title: `${accommodation.name} — Rate My Accom`,
    description: `${accommodation.ratings.totalReviews} student reviews for ${accommodation.name}. ★${accommodation.ratings.overall.toFixed(1)} overall · from $${accommodation.pricing.min}/${accommodation.pricing.period}.`,
  };
}

/* ── helpers ── */
const bw = (rating: number) => `${Math.round((rating / 5) * 100)}%`;

const NSW_AVG: Record<string, { pct: string; val: number }> = {
  cleanliness: { pct: '76%', val: 3.8 },
  location: { pct: '78%', val: 3.9 },
  value: { pct: '82%', val: 4.1 },
  amenities: { pct: '74%', val: 3.7 },
  management: { pct: '72%', val: 3.6 },
  safety: { pct: '80%', val: 4.0 },
};

function fmtDelta(actual: number, dim: string) {
  const avg = NSW_AVG[dim]?.val ?? 3.8;
  const diff = actual - avg;
  const sign = diff >= 0 ? '+' : '−';
  const abs = Math.abs(diff).toFixed(1);
  return { sign, abs, positive: diff >= 0 };
}

function fmtDate(d: Date) {
  return new Date(d)
    .toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function fmtPeriod(p: string) {
  if (p === 'week') {
    return '/wk';
  }
  if (p === 'month') {
    return '/mo';
  }
  return `/${p}`;
}

function fmtDist(km: number) {
  if (km < 1) {
    return { val: `${Math.round(km * 1000)}`, unit: 'm' };
  }
  return { val: km.toFixed(1), unit: 'km' };
}

type DimKey = keyof typeof NSW_AVG;

/* Split "UNSW Village" → ["UNSW", "Village"] for two-line hero h1 */
function splitNameLines(name: string): [string, string] {
  const i = name.lastIndexOf(' ');
  return i === -1 ? [name, ''] : [name.slice(0, i), name.slice(i + 1)];
}

export default async function AccommodationPage({ params }: AccommodationPageProps) {
  const result = await getAccommodation(params.slug);
  if (!result) {
    notFound();
  }

  const { accommodation, reviews, comparables } = result;
  const { ratings, pricing, location, amenities, contactInfo, distance } = accommodation;

  const featuredReview = reviews[0] ?? null;

  const photos = accommodation.images.slice(0, 3);

  /* Pricing tiers from roomTypes */
  const roomTypes = accommodation.roomTypes.length > 0 ? accommodation.roomTypes : ['Standard'];
  const priceRange = pricing.max - pricing.min;
  const pricingTiers = roomTypes.slice(0, 3).map((type, idx) => {
    const total = Math.min(roomTypes.length, 3);
    const price = Math.round(pricing.min + (priceRange * idx) / Math.max(total - 1, 1));
    const featured = total === 3 ? idx === 1 : idx === 0;
    return { type, price, featured };
  });

  /* Dimension rows */
  const dims: { key: DimKey; label: string }[] = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'location', label: 'Location' },
    { key: 'value', label: 'Value' },
    { key: 'amenities', label: 'Amenities' },
    { key: 'management', label: 'Management' },
    { key: 'safety', label: 'Safety' },
  ];

  const availableAmenities = amenities.filter((a) => a.available);
  const campus = fmtDist(distance.toCampus);
  const transport = fmtDist(distance.toTransport);
  const [nameLine1, nameLine2] = splitNameLines(accommodation.name);

  return (
    <div className={styles.page}>
      {/* ── BREADCRUMB ── */}
      <nav className={styles.crumbs}>
        <Link href="/browse" className={styles.crumbAction}>
          Browse
        </Link>
        <span className={styles.crumbSep}>/</span>
        <span>{accommodation.university}</span>
        <span className={styles.crumbSep}>/</span>
        <span>{location.suburb}</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbHere}>
          <em>{accommodation.name}</em>
        </span>
        <div className={styles.crumbActions}>
          <SaveButton slug={accommodation.slug} mode="crumb" />
          <ShareButton title={accommodation.name} mode="crumb" />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroRow}>
          <div>
            <div className={styles.kicker}>
              § FILE N° 001 · ON THE INDEX · {accommodation.type.toUpperCase().replace('-', ' ')}
            </div>
            <h1 className={styles.heroH1}>
              {nameLine1}
              {nameLine2 && (
                <>
                  <br />
                  {nameLine2}
                </>
              )}
              <span className={styles.heroDot}>.</span>
            </h1>
            <div className={styles.heroTags}>
              {accommodation.featured && (
                <span className={`${styles.tag} ${styles.tagBlue}`}>★ FEATURED</span>
              )}
              {accommodation.verified && (
                <span className={`${styles.tag} ${styles.tagFill}`}>VERIFIED</span>
              )}
              <span className={`${styles.tag} ${styles.tagItalic}`}>
                {accommodation.type.replace('-', ' ')}
              </span>
              {accommodation.capacity > 0 && (
                <span className={styles.tag}>
                  CAPACITY <b>{accommodation.capacity}</b>
                </span>
              )}
              <span className={styles.tag}>{location.suburb.toUpperCase()}</span>
            </div>
          </div>

          {/* At-a-glance card */}
          <div className={styles.glance}>
            <div className={styles.glanceRow}>
              <span className={styles.glanceLab}>RATING</span>
              <span className={styles.glanceVal}>
                <span className={styles.glanceStar}>★</span>
                {ratings.overall.toFixed(1)}{' '}
                <span className={styles.glanceUnit}>/ {ratings.totalReviews} reviews</span>
              </span>
            </div>
            <div className={styles.glanceRow}>
              <span className={styles.glanceLab}>PRICE / {pricing.period.toUpperCase()}</span>
              <span className={styles.glanceVal}>
                <span className={styles.glanceFrom}>from</span>${pricing.min}
              </span>
            </div>
            <div className={styles.glanceRow}>
              <span className={styles.glanceLab}>DISTANCE · CAMPUS</span>
              <span className={styles.glanceVal}>
                {campus.val} <span className={styles.glanceUnit}>{campus.unit}</span>
              </span>
            </div>
            <div className={styles.glanceRow}>
              <span className={styles.glanceLab}>DISTANCE · TRANSPORT</span>
              <span className={styles.glanceVal}>
                {transport.val} <span className={styles.glanceUnit}>{transport.unit}</span>
              </span>
            </div>
            <div className={`${styles.glanceRow} ${styles.glanceRowLast}`}>
              <span className={styles.glanceLab}>ROOM TYPES</span>
              <span className={styles.glanceVal} style={{ fontSize: 14, fontWeight: 500 }}>
                {accommodation.roomTypes.join(' · ') || 'Various'}
              </span>
            </div>
            <div className={styles.glanceCtas}>
              {contactInfo.website ? (
                <a
                  href={contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnPrimary}
                >
                  VISIT WEBSITE →
                </a>
              ) : (
                <span className={styles.btnPrimary} style={{ opacity: 0.5 }}>
                  NO WEBSITE
                </span>
              )}
              <Link
                href={`/write-review?accommodation=${accommodation.slug}`}
                className={styles.btnSecondary}
              >
                WRITE A REVIEW
              </Link>
              <SaveButton slug={accommodation.slug} mode="secondary" />
            </div>
          </div>
        </div>

        {/* Cover photo */}
        <div className={styles.cover}>
          {photos[0] && (
            <Image
              src={photos[0]}
              alt={`${accommodation.name} exterior`}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          )}
          <div className={styles.cropTL} />
          <div className={styles.cropTR} />
          <div className={styles.cropBL} />
          <div className={styles.cropBR} />
          <div className={styles.coverCorner}>FIG. 01 / EXTERIOR</div>
          <div className={styles.coverLabel}>
            {accommodation.name.toUpperCase()} · {location.suburb.toUpperCase()},{' '}
            {location.state.toUpperCase()}
          </div>
        </div>
      </section>

      {/* ── LEDE ── */}
      <div className={styles.sectionHead}>
        <div className={styles.sectionKicker}>
          § 01 — WHAT WE FOUND
          <span className={styles.sectionKickerSub}>
            Synthesised from {ratings.totalReviews} verified student reviews.
          </span>
        </div>
        <h2 className={styles.sectionH2}>
          {featuredReview ? (
            <>
              <em>&ldquo;{featuredReview.title}&rdquo;</em>
            </>
          ) : (
            <>The place students talk about.</>
          )}
        </h2>
      </div>
      <div className={styles.lede}>
        {featuredReview ? (
          <div className={styles.pullquote}>
            &ldquo;{featuredReview.text.slice(0, 160)}
            {featuredReview.text.length > 160 ? '…' : ''}&rdquo;
            <span className={styles.pullquoteBy}>
              — {featuredReview.userName.toUpperCase()}
              {featuredReview.userUniversity
                ? ` · ${featuredReview.userUniversity.toUpperCase()}`
                : ''}
              {featuredReview.roomType ? ` · ${featuredReview.roomType.toUpperCase()}` : ''} ·{' '}
              {featuredReview.rating.toFixed(1)} ★
            </span>
          </div>
        ) : (
          <div className={styles.pullquote}>
            <em>&ldquo;No reviews yet. Be the first to share your experience.&rdquo;</em>
          </div>
        )}
        <div className={styles.ledeBody}>
          <p>{accommodation.description}</p>
          {ratings.breakdown.location >= 4.5 && (
            <p>
              Location is the highest-rated dimension — students consistently note the{' '}
              <em>proximity to campus</em> as a standout feature.
            </p>
          )}
          {ratings.breakdown.safety >= 4.5 && (
            <p>
              On safety — ★{ratings.breakdown.safety.toFixed(1)} — this property rates in the{' '}
              <em>top tier</em> of NSW accommodations on the platform.
            </p>
          )}
        </div>
      </div>

      {/* ── SCORECARD ── */}
      <div className={styles.sectionHead}>
        <div className={styles.sectionKicker}>
          § 02 — THE NUMBERS
          <span className={styles.sectionKickerSub}>Six dimensions, not one star.</span>
        </div>
        <h2 className={styles.sectionH2}>
          Where {accommodation.name.split(' ')[0]} <em>wins</em> — and where it doesn&apos;t.
        </h2>
      </div>
      <div className={styles.scorecard}>
        <div>
          <p className={styles.overallNum}>
            <span className={styles.overallStar}>★</span>
            {ratings.overall.toFixed(1)}
            <span className={styles.overallMax}>/5</span>
          </p>
          <div className={styles.overallLab}>
            OVERALL · WEIGHTED AVG ·{' '}
            <span className={styles.overallLabBlue}>{ratings.totalReviews} REVIEWS</span>
            <br />
            RATED{' '}
            <span className={styles.overallLabBlue}>
              {ratings.overall >= 3.8 ? '+' : '−'}
              {Math.abs(ratings.overall - 3.8).toFixed(1)}
            </span>{' '}
            {ratings.overall >= 3.8 ? 'ABOVE' : 'BELOW'} NSW AVERAGE (3.8)
          </div>
        </div>
        <div className={styles.breakdown}>
          {dims.map(({ key, label }) => {
            const val = ratings.breakdown[key as keyof typeof ratings.breakdown];
            const delta = fmtDelta(val, key);
            return (
              <div key={key} className={styles.dim}>
                <div className={styles.dimName}>{label}</div>
                <div
                  className={styles.bar}
                  style={
                    { '--w': bw(val), '--avg': NSW_AVG[key]?.pct ?? '76%' } as React.CSSProperties
                  }
                >
                  <div className={styles.barAvg} />
                </div>
                <div className={styles.dimVal}>{val.toFixed(1)}</div>
                <div
                  className={`${styles.delta} ${delta.positive ? styles.deltaPos : styles.deltaNeg}`}
                >
                  <b>{delta.positive ? `+${delta.abs}` : `−${delta.abs}`}</b> vs NSW avg
                </div>
              </div>
            );
          })}
          <div className={styles.legend}>
            <div className={styles.legendKey}>
              <span className={styles.legendSw} /> THIS BUILDING
            </div>
            <div className={styles.legendKey}>
              <span className={styles.legendSwL} /> NSW PLATFORM AVERAGE
            </div>
          </div>
        </div>
      </div>

      {/* ── PHOTO ESSAY ── */}
      <section className={styles.essay}>
        <div className={styles.essayHead}>
          <h3 className={styles.essayH3}>
            The look <em>— a photo essay.</em>
          </h3>
          <div className={styles.essayNav}>
            SHOWING <b>{Math.min(photos.length, 3)}</b> OF {Math.max(photos.length, 3)} ARCHIVE
            IMAGES · ← VIEW ALL
          </div>
        </div>
        <div className={styles.essayGrid}>
          {/* Photo A — light */}
          <div className={`${styles.photoBase} ${styles.photoLight} ${styles.photoA}`}>
            {photos[0] && <Image src={photos[0]} alt="Interior" fill className={styles.photoImg} />}
            <div className={styles.photoFig}>FIG. 02 / {photos[0] ? 'INTERIOR' : 'KITCHEN'}</div>
            <div className={styles.photoCap}>
              {photos[0] ? 'INTERIOR · MAIN' : 'FLOOR 4 · COMMUNAL KITCHEN · NORTH-FACING'}
            </div>
          </div>
          {/* Photo B — light */}
          <div className={`${styles.photoBase} ${styles.photoLight} ${styles.photoB}`}>
            {photos[1] && <Image src={photos[1]} alt="Room" fill className={styles.photoImg} />}
            <div className={styles.photoFig}>FIG. 03 / ROOM</div>
            <div className={styles.photoCap}>
              {photos[1] ? 'ROOM · STANDARD' : 'SINGLE · TYPICAL · 12 m²'}
            </div>
          </div>
          {/* Photo C — always dark blue */}
          <div className={`${styles.photoBase} ${styles.photoDark} ${styles.photoC}`}>
            {photos[2] && (
              <Image src={photos[2]} alt="Common area" fill className={styles.photoImg} />
            )}
            <div className={styles.photoFig}>FIG. 04 / COURTYARD</div>
            <div className={styles.photoCap}>
              {photos[2] ? 'COMMON AREA' : 'SOCIAL COURTYARD · WEEKEND'}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className={styles.pricing}>
        <div className={styles.pricingHead}>
          <div className={styles.kicker}>§ 03 — ROOMS & PRICING</div>
          <h3 className={styles.pricingH3}>
            {pricingTiers.length === 1
              ? 'One tier.'
              : `${pricingTiers.length === 2 ? 'Two' : 'Three'} tiers.`}{' '}
            <em>Pick yours.</em>
          </h3>
        </div>
        <div className={styles.priceTable}>
          {pricingTiers.map((tier, idx) => (
            <div
              key={tier.type}
              className={`${styles.priceCard} ${tier.featured ? styles.priceCardFeatured : ''}`}
            >
              {tier.featured && <div className={styles.priceRibbon}>★ MOST REVIEWED</div>}
              <div className={styles.priceKick}>
                N° 0{idx + 1} · {tier.type.toUpperCase()}
              </div>
              <div className={styles.priceName}>{tier.type}</div>
              <div className={styles.priceAmt}>
                <span className={styles.priceFrom}>from</span>${tier.price}
                <span className={styles.priceUnit}>{fmtPeriod(pricing.period)}</span>
              </div>
              {availableAmenities.length > 0 && (
                <ul className={styles.priceFeatures}>
                  {availableAmenities.slice(0, 4).map((a) => (
                    <li key={a.id}>{a.name}</li>
                  ))}
                </ul>
              )}
              {contactInfo.website ? (
                <a
                  href={contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.priceCta}
                >
                  VIEW AVAILABILITY →
                </a>
              ) : (
                <div className={styles.priceCta}>ENQUIRE FOR AVAILABILITY →</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── AMENITIES ── */}
      <section className={styles.amens}>
        <div className={styles.amensHead}>
          <h3 className={styles.amensH3}>
            What&apos;s <em>in the building.</em>
          </h3>
          <div className={styles.amensMeta}>
            <b>
              {availableAmenities.length} of {amenities.length}
            </b>{' '}
            amenities
            {accommodation.lastVerified && (
              <>
                {' '}
                · <em>updated {fmtDate(accommodation.lastVerified)}</em>
              </>
            )}
          </div>
        </div>
        <div className={styles.amenGrid}>
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className={`${styles.amen} ${!amenity.available ? styles.amenUnavailable : ''}`}
            >
              <div className={styles.amenLabel}>{amenity.name}</div>
              <div className={styles.amenStatus}>
                {amenity.available ? '↳ available' : 'not at this property'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <DetailReviews
        reviews={reviews}
        totalReviews={ratings.totalReviews}
        writeReviewHref={`/write-review?accommodation=${accommodation.slug}`}
      />

      {/* ── LOCATION ── */}
      <section className={styles.location}>
        <div className={styles.locationGrid}>
          <div>
            <div className={styles.locationKicker}>§ 04 — LOCATION</div>
            <h3 className={styles.locationH3}>
              {location.suburb},<br />
              <em>
                {campus.val} {campus.unit}
              </em>{' '}
              from {accommodation.university}.
            </h3>
            <div className={styles.locationAddress}>
              <b>
                {location.address}, {location.suburb} {location.state} {location.postcode}
              </b>
              {location.coordinates && (
                <>
                  <br />
                  <em>
                    {location.coordinates.lat.toFixed(4)}°S, {location.coordinates.lng.toFixed(4)}°E
                    · WGS-84
                  </em>
                </>
              )}
            </div>
            <div className={styles.distList}>
              <div className={styles.dist}>
                <div className={styles.distLabel}>{accommodation.university} CAMPUS</div>
                <div className={styles.distVal}>
                  {campus.val}
                  <em>{campus.unit} · walk</em>
                </div>
              </div>
              <div className={styles.dist}>
                <div className={styles.distLabel}>NEAREST TRANSPORT</div>
                <div className={styles.distVal}>
                  {transport.val}
                  <em>{transport.unit} · walk</em>
                </div>
              </div>
              <div className={styles.dist}>
                <div className={styles.distLabel}>SUBURB</div>
                <div className={styles.distVal} style={{ fontSize: 18 }}>
                  {location.suburb}
                </div>
              </div>
              <div className={styles.dist}>
                <div className={styles.distLabel}>STATE</div>
                <div className={styles.distVal} style={{ fontSize: 18 }}>
                  {location.state} {location.postcode}
                </div>
              </div>
            </div>
          </div>

          {/* Mini atlas */}
          <div className={styles.miniAtlas}>
            <div className={styles.miniHead}>
              <span>{location.suburb.toUpperCase()} · 1 : 25K</span>
              <span className={styles.miniHeadTag}>FIG. 05 / SITE PLAN</span>
            </div>
            <div className={styles.refCoast} />
            <div className={styles.ref} style={{ left: '35%', top: '28%' }}>
              Sydney CBD
            </div>
            <div className={styles.ref} style={{ left: '60%', top: '76%' }}>
              {location.suburb}
            </div>
            <div className={styles.uniPin} style={{ left: '52%', top: '52%' }}>
              <div className={styles.uniPinDot} />
              <div className={styles.uniPinLabel}>{accommodation.university}</div>
            </div>
            <div className={styles.thisPin} style={{ left: '58%', top: '62%' }}>
              <div className={styles.thisPinRing} />
              <div className={styles.thisPinLabel}>
                {accommodation.name.split(' ').slice(0, 2).join(' ').toUpperCase()}{' '}
                <em style={{ opacity: 0.8, marginLeft: 4, fontStyle: 'italic' }}>— here</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APPLY ── */}
      <section className={styles.apply}>
        <div className={styles.applyGrid}>
          <div>
            <div className={styles.applySection}>§ 05 — APPLY</div>
            <h2 className={styles.applyH2}>
              Would you
              <br />
              <em>live here?</em>
            </h2>
          </div>
          <div>
            <p className={styles.applyBody}>
              Applications are made directly through {accommodation.name}.{' '}
              <em>We don&apos;t take a cut.</em> The buttons below open the operator&apos;s site —
              you&apos;ll see the same prices you read here.
            </p>
            <div className={styles.applyContact}>
              {contactInfo.phone && (
                <div>
                  <span>PHONE</span>
                  {contactInfo.phone}
                </div>
              )}
              {contactInfo.email && (
                <div>
                  <span>EMAIL</span>
                  {contactInfo.email}
                </div>
              )}
              {contactInfo.website && (
                <div>
                  <span>WEB</span>
                  {contactInfo.website.replace(/^https?:\/\//, '')}
                </div>
              )}
            </div>
            <div className={styles.applyCtas}>
              {contactInfo.website ? (
                <a
                  href={contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnSolid}
                >
                  VISIT OPERATOR SITE →
                </a>
              ) : (
                <span className={styles.btnSolid} style={{ opacity: 0.5 }}>
                  NO WEBSITE
                </span>
              )}
              <SaveButton slug={accommodation.slug} mode="ghost" />
              <ShareButton title={accommodation.name} mode="ghost" />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARABLES ── */}
      {comparables.length > 0 && (
        <section className={styles.comparables}>
          <div className={styles.compHead}>
            <h3 className={styles.compH3}>
              If you like {accommodation.name.split(' ')[0]}, <em>also worth seeing —</em>
            </h3>
            <div className={styles.compMeta}>
              SHOWING <span className={styles.compMetaB}>{comparables.length}</span> SIMILAR ·{' '}
              {accommodation.university.toUpperCase()}
            </div>
          </div>
          <div className={styles.compGrid}>
            {comparables.map((comp, idx) => (
              <Link key={comp.id} href={`/accommodation/${comp.slug}`} className={styles.comp}>
                <div className={styles.compNum}>N° 0{(idx + 8).toString().padStart(2, '0')}</div>
                <div className={styles.compPhoto} />
                <h4 className={styles.compName}>{comp.name}</h4>
                <div className={styles.compMeta2}>
                  {comp.university.toUpperCase()} · {comp.suburb.toUpperCase()} ·{' '}
                  {comp.type.toUpperCase().replace('_', '-')}
                </div>
                <div className={styles.compFooter}>
                  <div className={styles.compVal}>
                    <em>★</em>
                    {comp.ratingOverall.toFixed(1)}
                  </div>
                  <div className={styles.compVal}>
                    <em>from</em>${comp.priceMin}/wk
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── COLOPHON ── */}
      <footer className={styles.colophon}>
        <span>© 2026 RATEMYACCOM · SYDNEY NSW</span>
        <span>
          SET IN INTER · <em>printed on the internet</em>
        </span>
      </footer>
    </div>
  );
}
