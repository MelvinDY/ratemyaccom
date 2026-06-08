/**
 * Seed NSW student accommodations + sample reviews.
 *
 * Idempotent: safe to re-run against the production Neon DB. Upserts amenities by
 * name and accommodations by slug; never wipes whole tables. Sample reviews are
 * attributed to a fixed pool of seed users and are scoped on delete by those user
 * ids, so real users' reviews are never touched.
 *
 * Run (PowerShell):
 *   $env:DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"
 *   npm run db:seed:nsw
 */

import { PrismaClient, AccommodationType } from '@prisma/client';
import { nswAccommodations, type SeedAccommodation } from './data/nsw-accommodations';

const prisma = new PrismaClient();

// ── Amenities (full set, matches names referenced in the dataset) ──
const AMENITIES = [
  { name: 'WiFi', category: 'facilities', icon: '📶' },
  { name: 'Gym', category: 'facilities', icon: '💪' },
  { name: 'Study Rooms', category: 'facilities', icon: '📚' },
  { name: 'Laundry', category: 'facilities', icon: '🧺' },
  { name: 'Common Kitchen', category: 'facilities', icon: '🍳' },
  { name: 'Parking', category: 'facilities', icon: '🚗' },
  { name: 'Security', category: 'security', icon: '🔒' },
  { name: 'Social Events', category: 'services', icon: '🎉' },
  { name: 'Cinema Room', category: 'facilities', icon: '🎬' },
  { name: 'Rooftop Terrace', category: 'facilities', icon: '🌆' },
  { name: 'Meal Plans', category: 'services', icon: '🍽️' },
  { name: 'Music Rooms', category: 'facilities', icon: '🎵' },
  { name: 'Games Room', category: 'facilities', icon: '🎮' },
  { name: 'Bike Storage', category: 'facilities', icon: '🚲' },
  { name: 'Swimming Pool', category: 'facilities', icon: '🏊' },
  { name: 'BBQ Area', category: 'facilities', icon: '🍖' },
  { name: '24/7 Reception', category: 'services', icon: '🏨' },
  { name: 'Cleaning Service', category: 'services', icon: '🧹' },
  { name: 'Air Conditioning', category: 'facilities', icon: '❄️' },
  { name: 'Heating', category: 'facilities', icon: '🔥' },
];

// ── Seed reviewer pool (emails act as the idempotency marker) ──
const REVIEWERS = [
  { email: 'sarah.thompson@student.unsw.edu.au', name: 'Sarah Thompson', university: 'UNSW' },
  {
    email: 'michael.kim@uni.sydney.edu.au',
    name: 'Michael Kim',
    university: 'University of Sydney',
  },
  { email: 'priya.menon@student.unsw.edu.au', name: 'Priya Menon', university: 'UNSW' },
  { email: 'daniel.reyes@student.uts.edu.au', name: 'Daniel Reyes', university: 'UTS' },
  { email: 'jiayi.wang@uni.sydney.edu.au', name: 'Jiayi Wang', university: 'University of Sydney' },
  {
    email: 'tom.nguyen@students.mq.edu.au',
    name: 'Tom Nguyen',
    university: 'Macquarie University',
  },
  {
    email: 'aisha.khan@student.westernsydney.edu.au',
    name: 'Aisha Khan',
    university: 'Western Sydney University',
  },
  { email: 'lucas.silva@student.uts.edu.au', name: 'Lucas Silva', university: 'UTS' },
];

// ── Review content pools ──
const TITLES = [
  'Great location, would recommend',
  'Solid choice for first year',
  'Convenient but comes at a premium',
  'Best decision of my degree',
  'Comfortable and well-managed',
  'Good value for what you get',
  'Friendly community, easy to settle in',
  'Modern facilities, minor niggles',
];
const BODIES = [
  'The location is the standout — a short walk to campus and transport, which makes a huge difference during exam season. Rooms are a comfortable size and the common areas are kept clean. Management is responsive when something needs fixing.',
  'Lived here for two semesters and made some of my closest friends. The social events are easy to join if you want them and easy to skip if you do not. Study rooms are genuinely useful when the library is full.',
  'Everything you need is here and the convenience is hard to beat. It is on the pricier side, but if your budget allows, the time you save commuting is worth it. Staff at reception are helpful.',
  'Facilities are modern and well looked after. The gym and study spaces are a highlight. WiFi can dip during peak times but it is fine for streaming and most coursework.',
  'A safe, well-run building with a good mix of students. Maintenance requests are handled quickly and the communal kitchens are cleaned regularly. Would happily live here again.',
  'Good value compared with renting privately, and far less hassle — bills and internet are included. The room is compact but smartly laid out, and the location keeps me close to everything.',
  'Settling in was easy thanks to the welcoming community and the events in the first few weeks. The shared spaces are sociable without being chaotic, and quiet hours are mostly respected.',
  'The building looks great and the amenities are a step above what I expected. A couple of small maintenance delays early on, but nothing major and they were sorted in the end.',
];
const PROS_POOL = [
  'Close to campus',
  'Responsive management',
  'Safe environment',
  'Great study spaces',
  'Easy to make friends',
  'Bills and WiFi included',
  'Clean common areas',
  'Good gym',
  'Walking distance to transport',
  'Modern facilities',
  'Quiet hours respected',
  'Helpful reception',
];
const CONS_POOL = [
  'On the expensive side',
  'Rooms a little compact',
  'WiFi slows during exams',
  'Limited parking',
  'Noisy on weekends',
  'Waitlist for studios',
  'Lifts get busy at peak times',
  'Laundry can be crowded',
];
const DURATIONS = ['1 semester', '2 semesters', '1 year', '6 months', '2 years', '18 months'];
const OFFSETS = [0.4, -0.2, 0.1, -0.4, 0.3, -0.1];

// half-step round, clamped to a believable [2.5, 5]
const half = (x: number) => Math.max(2.5, Math.min(5, Math.round(x * 2) / 2));
const round1 = (x: number) => Math.round(x * 10) / 10;
const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

interface GenReview {
  rating: number;
  ratingCleanliness: number;
  ratingLocation: number;
  ratingValue: number;
  ratingAmenities: number;
  ratingManagement: number;
  ratingSafety: number;
  title: string;
  text: string;
  pros: string[];
  cons: string[];
  roomType: string;
  stayDuration: string;
  createdAt: Date;
  reviewerEmail: string;
}

function generateReviews(accom: SeedAccommodation): GenReview[] {
  const out: GenReview[] = [];
  const seed = hash(accom.slug);
  for (let k = 0; k < accom.reviewCount; k++) {
    const base = accom.targetRating + (OFFSETS[k % OFFSETS.length] as number);
    const dims = {
      ratingCleanliness: half(base + 0.0),
      ratingLocation: half(base + 0.4),
      ratingValue: half(base - 0.4),
      ratingAmenities: half(base + 0.1),
      ratingManagement: half(base - 0.1),
      ratingSafety: half(base + 0.3),
    };
    const rating = round1(
      (dims.ratingCleanliness +
        dims.ratingLocation +
        dims.ratingValue +
        dims.ratingAmenities +
        dims.ratingManagement +
        dims.ratingSafety) /
        6
    );
    const pick = <T>(arr: T[], n: number) => arr[(seed + k + n) % arr.length] as T;
    const prosStart = (seed + k) % PROS_POOL.length;
    const consStart = (seed + k) % CONS_POOL.length;
    out.push({
      rating,
      ...dims,
      title: pick(TITLES, 0),
      text: pick(BODIES, 1),
      pros: [
        PROS_POOL[prosStart]!,
        PROS_POOL[(prosStart + 3) % PROS_POOL.length]!,
        PROS_POOL[(prosStart + 6) % PROS_POOL.length]!,
      ],
      cons: [CONS_POOL[consStart]!, CONS_POOL[(consStart + 2) % CONS_POOL.length]!],
      roomType: accom.roomTypes[k % accom.roomTypes.length] as string,
      stayDuration: pick(DURATIONS, 2),
      // spread review dates over the past ~18 months
      createdAt: new Date(Date.now() - (k * 47 + (seed % 30)) * 24 * 60 * 60 * 1000),
      reviewerEmail: REVIEWERS[(seed + k) % REVIEWERS.length]!.email,
    });
  }
  return out;
}

async function main() {
  console.log('🌱 Seeding NSW accommodations...\n');

  // 1. Amenities
  console.log('🏢 Upserting amenities...');
  const amenityByName = new Map<string, string>();
  for (const a of AMENITIES) {
    const rec = await prisma.amenity.upsert({
      where: { name: a.name },
      update: { category: a.category, icon: a.icon },
      create: a,
    });
    amenityByName.set(a.name, rec.id);
  }
  console.log(`   ✓ ${AMENITIES.length} amenities ready\n`);

  // 2. Reviewer users
  console.log('👥 Upserting seed reviewers...');
  const reviewerByEmail = new Map<string, string>();
  for (const r of REVIEWERS) {
    const rec = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        name: r.name,
        university: r.university,
        verified: true,
        role: 'USER',
      },
    });
    reviewerByEmail.set(r.email, rec.id);
  }
  const seedUserIds = [...reviewerByEmail.values()];
  console.log(`   ✓ ${REVIEWERS.length} reviewers ready\n`);

  // 3. Accommodations + amenity links + reviews
  let created = 0;
  let updated = 0;
  let reviewsTotal = 0;

  for (const accom of nswAccommodations) {
    const data = {
      name: accom.name,
      university: accom.university,
      address: accom.address,
      suburb: accom.suburb,
      state: 'NSW',
      postcode: accom.postcode,
      latitude: accom.latitude,
      longitude: accom.longitude,
      description: accom.description,
      type: accom.type as AccommodationType,
      images: accom.images,
      priceMin: accom.priceMin,
      priceMax: accom.priceMax,
      currency: 'AUD',
      pricePeriod: 'WEEK' as const,
      capacity: accom.capacity,
      roomTypes: accom.roomTypes,
      contactInfo: accom.contactInfo,
      distanceToCampus: accom.distanceToCampus,
      distanceToTransport: accom.distanceToTransport,
      sourceUrl: accom.sourceUrl,
      verified: true,
      featured: accom.featured,
      active: true,
      lastVerified: new Date(),
    };

    const existing = await prisma.accommodation.findUnique({ where: { slug: accom.slug } });
    const record = await prisma.accommodation.upsert({
      where: { slug: accom.slug },
      update: data,
      create: { ...data, slug: accom.slug },
    });
    if (existing) {
      updated++;
    } else {
      created++;
    }

    // Relink amenities (available + unavailable)
    await prisma.accommodationAmenity.deleteMany({ where: { accommodationId: record.id } });
    const links: { accommodationId: string; amenityId: string; available: boolean }[] = [];
    for (const name of accom.amenities) {
      const id = amenityByName.get(name);
      if (id) {
        links.push({ accommodationId: record.id, amenityId: id, available: true });
      }
    }
    for (const name of accom.amenitiesUnavailable ?? []) {
      const id = amenityByName.get(name);
      if (id) {
        links.push({ accommodationId: record.id, amenityId: id, available: false });
      }
    }
    if (links.length) {
      await prisma.accommodationAmenity.createMany({ data: links, skipDuplicates: true });
    }

    // Replace seeded reviews only (scoped to seed reviewer ids — never touches real users)
    await prisma.review.deleteMany({
      where: { accommodationId: record.id, userId: { in: seedUserIds } },
    });
    const reviews = generateReviews(accom);
    for (const rv of reviews) {
      await prisma.review.create({
        data: {
          accommodationId: record.id,
          userId: reviewerByEmail.get(rv.reviewerEmail)!,
          rating: rv.rating,
          ratingCleanliness: rv.ratingCleanliness,
          ratingLocation: rv.ratingLocation,
          ratingValue: rv.ratingValue,
          ratingAmenities: rv.ratingAmenities,
          ratingManagement: rv.ratingManagement,
          ratingSafety: rv.ratingSafety,
          title: rv.title,
          text: rv.text,
          pros: rv.pros,
          cons: rv.cons,
          verified: true,
          roomType: rv.roomType,
          stayDuration: rv.stayDuration,
          status: 'PUBLISHED',
          createdAt: rv.createdAt,
        },
      });
    }
    reviewsTotal += reviews.length;

    // Recompute denormalised rating aggregates (same pattern as the reviews API route)
    const all = await prisma.review.findMany({
      where: { accommodationId: record.id, status: 'PUBLISHED' },
    });
    const n = all.length;
    const avg = (sel: (r: (typeof all)[number]) => number) =>
      n ? round1(all.reduce((s, r) => s + sel(r), 0) / n) : 0;
    const overall = avg((r) => r.rating);
    await prisma.accommodation.update({
      where: { id: record.id },
      data: {
        totalReviews: n,
        ratingOverall: overall,
        ratingCleanliness: avg((r) => r.ratingCleanliness),
        ratingLocation: avg((r) => r.ratingLocation),
        ratingValue: avg((r) => r.ratingValue),
        ratingAmenities: avg((r) => r.ratingAmenities),
        ratingManagement: avg((r) => r.ratingManagement),
        ratingSafety: avg((r) => r.ratingSafety),
      },
    });

    console.log(`   ✓ ${accom.name}  (★${overall}, ${n} reviews)`);
  }

  console.log(
    `\n✅ Done. ${created} created, ${updated} updated, ${reviewsTotal} reviews seeded across ${nswAccommodations.length} properties.`
  );
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
