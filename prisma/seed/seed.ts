/**
 * Database Seed Script
 * Seeds the database with initial data including amenities and sample accommodations
 * for 5 Sydney universities: UNSW, USYD, UTS, Macquarie, Western Sydney
 *
 * Run with: npx tsx prisma/seed/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to add amenities to an accommodation
async function addAmenitiesToAccommodation(
  accommodationId: string,
  amenityNames: string[],
  amenities: { id: string; name: string }[],
  unavailable: string[] = []
) {
  for (const amenityName of amenityNames) {
    const amenity = amenities.find((a) => a.name === amenityName);
    if (amenity) {
      await prisma.accommodationAmenity.create({
        data: {
          accommodationId,
          amenityId: amenity.id,
          available: !unavailable.includes(amenityName),
        },
      });
    }
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Cleaning existing data...');
    await prisma.review.deleteMany();
    await prisma.savedAccommodation.deleteMany();
    await prisma.accommodationAmenity.deleteMany();
    await prisma.accommodation.deleteMany();
    await prisma.amenity.deleteMany();
    await prisma.user.deleteMany();
    await prisma.dataImportLog.deleteMany();
    await prisma.scrapingJob.deleteMany();
  }

  // Create Amenities
  console.log('🏢 Creating amenities...');
  const amenitiesData = [
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

  const amenities = await Promise.all(
    amenitiesData.map((amenity) =>
      prisma.amenity.create({
        data: amenity,
      })
    )
  );

  console.log(`✅ Created ${amenities.length} amenities`);

  // Create Sample Users
  console.log('👥 Creating sample users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.t@student.unsw.edu.au',
        name: 'Sarah Thompson',
        university: 'UNSW',
        studentId: 'z5123456',
        verified: true,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'michael.k@uni.sydney.edu.au',
        name: 'Michael Kim',
        university: 'University of Sydney',
        studentId: '520123456',
        verified: true,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.w@student.uts.edu.au',
        name: 'Emma Wilson',
        university: 'UTS',
        studentId: '14123456',
        verified: true,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.l@students.mq.edu.au',
        name: 'James Liu',
        university: 'Macquarie University',
        studentId: '45123456',
        verified: true,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'olivia.n@student.westernsydney.edu.au',
        name: 'Olivia Nguyen',
        university: 'Western Sydney University',
        studentId: '19123456',
        verified: true,
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@ratemyaccom.com',
        name: 'Admin User',
        verified: true,
        role: 'ADMIN',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Sample Accommodations
  console.log('🏠 Creating sample accommodations...');

  // ==========================================
  // UNSW ACCOMMODATIONS
  // ==========================================

  // UNSW Village
  // Verified pricing from official UNSW source (2026 rates):
  // Multi-bedroom: $408.50-$456/week, Studios: $565-$646/week
  const unswVillage = await prisma.accommodation.create({
    data: {
      name: 'UNSW Village',
      slug: 'unsw-village',
      university: 'University of New South Wales (UNSW)',
      address: '1 Barker Street',
      suburb: 'Kensington',
      state: 'NSW',
      postcode: '2033',
      latitude: -33.9173,
      longitude: 151.2313,
      description:
        'Modern student accommodation located on the UNSW campus, offering a vibrant community with excellent facilities and convenient access to university resources. Features fully furnished rooms with private bathrooms, shared kitchens, and a range of social and study spaces.',
      type: 'ON_CAMPUS',
      images: [
        '/images/accommodations/unsw-village-1.jpg',
        '/images/accommodations/unsw-village-2.jpg',
        '/images/accommodations/unsw-village-3.jpg',
        '/images/accommodations/unsw-village-4.jpg',
        '/images/accommodations/unsw-village-5.jpg',
      ],
      priceMin: 409,
      priceMax: 646,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 750,
      roomTypes: ['Single', 'Twin Share', 'Studio'],
      contactInfo: {
        phone: '(02) 9385 4734',
        email: 'village@unsw.edu.au',
        website: 'https://www.unswvillage.com.au',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.2,
      distanceToTransport: 0.5,
      verified: true,
      featured: true,
      sourceUrl: 'https://www.unsw.edu.au/accommodation/apartments/unsw-village',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    unswVillage.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Parking',
      'Security',
      'Social Events',
      'Air Conditioning',
    ],
    amenities
  );

  // UNSW Kensington Colleges
  const unswKensingtonColleges = await prisma.accommodation.create({
    data: {
      name: 'UNSW Kensington Colleges',
      slug: 'unsw-kensington-colleges',
      university: 'University of New South Wales (UNSW)',
      address: 'Gate 14, High Street',
      suburb: 'Kensington',
      state: 'NSW',
      postcode: '2033',
      latitude: -33.9188,
      longitude: 151.228,
      description:
        'Traditional collegiate-style living with a strong sense of community. Includes Basser College, Goldstein College, and Philip Baxter College. Offers catered meals and pastoral care programs.',
      type: 'COLLEGE',
      images: [
        '/images/accommodations/unsw-kensington-colleges-1.jpg',
        '/images/accommodations/unsw-kensington-colleges-2.jpg',
        '/images/accommodations/unsw-kensington-colleges-3.jpg',
        '/images/accommodations/unsw-kensington-colleges-4.jpg',
        '/images/accommodations/unsw-kensington-colleges-5.jpg',
      ],
      priceMin: 450,
      priceMax: 650,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 550,
      roomTypes: ['Single', 'Twin Share'],
      contactInfo: {
        phone: '(02) 9385 5655',
        email: 'colleges@unsw.edu.au',
        website: 'https://www.kensingtoncolleges.unsw.edu.au',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.1,
      distanceToTransport: 0.6,
      verified: true,
      featured: false,
      sourceUrl: 'https://www.unsw.edu.au/accommodation/colleges',
      lastVerified: null, // Pricing not publicly available - needs manual verification
    },
  });
  await addAmenitiesToAccommodation(
    unswKensingtonColleges.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Security',
      'Social Events',
      'Meal Plans',
      'Music Rooms',
      'Games Room',
    ],
    amenities
  );

  // UniLodge Kensington (Note: Iglu Kensington does NOT exist - corrected to UniLodge Kensington)
  // Verified pricing from official UniLodge source (2026 rates):
  // Twin Studio: from $566/week, Studio: from $785/week
  const unilodgeKensington = await prisma.accommodation.create({
    data: {
      name: 'UniLodge Kensington',
      slug: 'unilodge-kensington',
      university: 'University of New South Wales (UNSW)',
      address: '187 Anzac Parade',
      suburb: 'Kensington',
      state: 'NSW',
      postcode: '2033',
      latitude: -33.9159,
      longitude: 151.2282,
      description:
        'Modern purpose-built student accommodation near UNSW with premium facilities. Features fully furnished apartments with modern kitchens, ensuite bathrooms, and a vibrant student community. Includes gym, yoga studio, cinema, music room, and games area.',
      type: 'OFF_CAMPUS',
      images: [
        '/images/accommodations/iglu-kensington-1.jpg',
        '/images/accommodations/iglu-kensington-2.jpg',
        '/images/accommodations/iglu-kensington-3.jpg',
        '/images/accommodations/iglu-kensington-4.jpg',
        '/images/accommodations/iglu-kensington-5.jpg',
      ],
      priceMin: 566,
      priceMax: 806,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 400,
      roomTypes: [
        'Twin Studio',
        'Twin Studio Premium',
        'Studio',
        'Studio Premium',
        'Shared Apartment',
      ],
      contactInfo: {
        phone: '+61 2 9199 9888',
        email: 'kensington@unilodge.com.au',
        website: 'https://www.unilodge.com.au/student-accommodation-sydney/kensington',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.4,
      distanceToTransport: 0.3,
      verified: true,
      featured: false,
      sourceUrl: 'https://www.unilodge.com.au/student-accommodation-sydney/kensington',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    unilodgeKensington.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Security',
      'Social Events',
      'Cinema Room',
      'Music Rooms',
      'Games Room',
      'Air Conditioning',
    ],
    amenities
  );

  // ==========================================
  // UNIVERSITY OF SYDNEY ACCOMMODATIONS
  // ==========================================

  // UniLodge on Broadway
  // Verified pricing from web sources: Studio $395-450/week, 2BR $650-695/week
  const unilodgeBroadway = await prisma.accommodation.create({
    data: {
      name: 'UniLodge on Broadway',
      slug: 'unilodge-broadway',
      university: 'University of Sydney',
      address: '13-15 Broadway',
      suburb: 'Ultimo',
      state: 'NSW',
      postcode: '2007',
      latitude: -33.8847,
      longitude: 151.1991,
      description:
        'Purpose-built student accommodation in the heart of Sydney, close to University of Sydney. Features modern amenities, a vibrant student community, and easy access to public transport.',
      type: 'OFF_CAMPUS',
      images: [
        '/images/accommodations/unilodge-broadway-1.jpg',
        '/images/accommodations/unilodge-broadway-2.jpg',
        '/images/accommodations/unilodge-broadway-3.jpg',
        '/images/accommodations/unilodge-broadway-4.jpg',
        '/images/accommodations/unilodge-broadway-5.jpg',
      ],
      priceMin: 395,
      priceMax: 695,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 550,
      roomTypes: ['Studio', 'Single', 'Ensuite'],
      contactInfo: {
        phone: '1300 134 693',
        email: 'broadway@unilodge.com.au',
        website: 'https://www.unilodge.com.au/broadway',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 1.2,
      distanceToTransport: 0.3,
      verified: true,
      featured: true,
      sourceUrl: 'https://www.unilodge.com.au/student-accommodation-sydney/broadway',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    unilodgeBroadway.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Security',
      'Social Events',
      'Cinema Room',
      'Rooftop Terrace',
      'Air Conditioning',
    ],
    amenities,
    ['Parking']
  );

  // St John's College
  const stJohnsCollege = await prisma.accommodation.create({
    data: {
      name: "St John's College",
      slug: 'st-johns-college-usyd',
      university: 'University of Sydney',
      address: 'Missenden Road',
      suburb: 'Camperdown',
      state: 'NSW',
      postcode: '2050',
      latitude: -33.8898,
      longitude: 151.188,
      description:
        "A historic residential college affiliated with the University of Sydney, offering a traditional collegiate experience with academic support, pastoral care, and a strong sense of community. Founded in 1857, it's one of Australia's oldest colleges.",
      type: 'COLLEGE',
      images: [
        '/images/accommodations/st-johns-college-1.jpg',
        '/images/accommodations/st-johns-college-2.jpg',
        '/images/accommodations/st-johns-college-3.jpg',
        '/images/accommodations/st-johns-college-4.jpg',
        '/images/accommodations/st-johns-college-5.jpg',
      ],
      priceMin: 550,
      priceMax: 750,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 250,
      roomTypes: ['Single', 'Twin Share'],
      contactInfo: {
        phone: '(02) 9394 5600',
        email: 'reception@stjohnscollege.edu.au',
        website: 'https://www.stjohnscollege.edu.au',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.3,
      distanceToTransport: 0.5,
      verified: true,
      featured: true,
      sourceUrl: 'https://www.stjohnscollege.edu.au',
      lastVerified: null, // PDF fee schedule not publicly accessible - needs manual verification
    },
  });
  await addAmenitiesToAccommodation(
    stJohnsCollege.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Security',
      'Social Events',
      'Meal Plans',
      'Music Rooms',
      'Games Room',
      'BBQ Area',
    ],
    amenities
  );

  // Queen Mary Building
  // Verified pricing from USyd 2025 rates: Single $380/week, Single Premium $410/week, Accessible $441/week
  const queenMaryBuilding = await prisma.accommodation.create({
    data: {
      name: 'Queen Mary Building',
      slug: 'queen-mary-building',
      university: 'University of Sydney',
      address: 'Grose Farm Lane',
      suburb: 'Camperdown',
      state: 'NSW',
      postcode: '2050',
      latitude: -33.8879,
      longitude: 151.1858,
      description:
        'Heritage-listed building converted to student accommodation, offering affordable self-catered living close to the University of Sydney main campus. Features a mix of single rooms and shared apartments.',
      type: 'ON_CAMPUS',
      images: [
        '/images/accommodations/queen-mary-building-1.jpg',
        '/images/accommodations/queen-mary-building-2.jpg',
        '/images/accommodations/queen-mary-building-3.jpg',
        '/images/accommodations/queen-mary-building-4.jpg',
        '/images/accommodations/queen-mary-building-5.jpg',
      ],
      priceMin: 380,
      priceMax: 441,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 180,
      roomTypes: ['Single', 'Shared Apartment'],
      contactInfo: {
        phone: '(02) 9351 2389',
        email: 'housing@sydney.edu.au',
        website: 'https://www.sydney.edu.au/campus-life/accommodation.html',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.1,
      distanceToTransport: 0.7,
      verified: true,
      featured: false,
      sourceUrl:
        'https://www.sydney.edu.au/study/accommodation/camperdown-darlington/university-residences/queen-mary-building.html',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    queenMaryBuilding.id,
    ['WiFi', 'Study Rooms', 'Laundry', 'Common Kitchen', 'Security', 'Bike Storage', 'Heating'],
    amenities
  );

  // ==========================================
  // UTS ACCOMMODATIONS
  // ==========================================

  // Yura Mudang (UTS Housing)
  // Verified pricing from UTS 2024 rates: 6BR $342/week, 2BR $374/week, Studio Small $428/week, Studio Large $458/week
  const yuraMudang = await prisma.accommodation.create({
    data: {
      name: 'Yura Mudang (UTS Housing)',
      slug: 'yura-mudang-uts',
      university: 'University of Technology Sydney (UTS)',
      address: '635 Harris Street',
      suburb: 'Ultimo',
      state: 'NSW',
      postcode: '2007',
      latitude: -33.8833,
      longitude: 151.1986,
      description:
        "UTS's flagship on-campus student accommodation offering modern, purpose-built apartments with stunning city views. Features fully furnished studios and multi-share apartments with private bedrooms and shared living spaces. 'Yura Mudang' is Gadigal (local Aboriginal language) for 'Students live'.",
      type: 'ON_CAMPUS',
      images: [
        '/images/accommodations/yura-mudang-1-exterior.jpg',
        '/images/accommodations/yura-mudang-2-room.jpg',
        '/images/accommodations/yura-mudang-3-rooftop.jpg',
        '/images/accommodations/yura-mudang-4-common-area.jpg',
        '/images/accommodations/yura-mudang-5-study-space.jpg',
      ],
      priceMin: 342,
      priceMax: 458,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 720,
      roomTypes: ['Studio', '4-Share Apartment', '6-Share Apartment'],
      contactInfo: {
        phone: '(02) 9514 1588',
        email: 'housing@uts.edu.au',
        website: 'https://www.uts.edu.au/current-students/support/accommodation',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.1,
      distanceToTransport: 0.2,
      verified: true,
      featured: true,
      sourceUrl:
        'https://www.uts.edu.au/for-students/current-students/support/uts-housing-service/our-residence-yura-mudang/fees',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    yuraMudang.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Security',
      'Social Events',
      'Rooftop Terrace',
      'BBQ Area',
      'Air Conditioning',
      'Bike Storage',
    ],
    amenities
  );

  // Urbanest Darling House (may now operate as Scape Darling House)
  // Verified pricing: Twin ensuite from $560/week, Single ensuite from $646/week (includes all meals)
  const urbanestDarling = await prisma.accommodation.create({
    data: {
      name: 'Urbanest Darling House',
      slug: 'urbanest-darling-house',
      university: 'University of Technology Sydney (UTS)',
      address: '39 Darling Drive',
      suburb: 'Haymarket',
      state: 'NSW',
      postcode: '2000',
      latitude: -33.8794,
      longitude: 151.2041,
      description:
        'Premium student accommodation in the heart of Sydney CBD, minutes from UTS and Central Station. Features modern studios and apartments with stunning views, premium facilities, and an active community program. All meals included at The Eatery.',
      type: 'OFF_CAMPUS',
      images: [
        '/images/accommodations/scape-darling-square-1-building.jpg',
        '/images/accommodations/scape-darling-square-2-studio.jpg',
        '/images/accommodations/scape-darling-square-3-gym.jpg',
        '/images/accommodations/scape-darling-square-4-rooftop.jpg',
        '/images/accommodations/scape-darling-square-5-social-space.jpg',
      ],
      priceMin: 560,
      priceMax: 679,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 600,
      roomTypes: ['Studio', 'Twin Studio', '2-Bedroom Apartment'],
      contactInfo: {
        phone: '1800 827 867',
        email: 'darlinghouse@urbanest.com.au',
        website: 'https://www.urbanest.com.au/darling-house',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.5,
      distanceToTransport: 0.1,
      verified: true,
      featured: false,
      sourceUrl: 'https://www.urbanest.com.au/darling-house',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    urbanestDarling.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Security',
      'Social Events',
      'Cinema Room',
      'Games Room',
      'Air Conditioning',
      '24/7 Reception',
    ],
    amenities
  );

  // Iglu Central
  // Verified pricing: Share Apt (5-6BR) from $709-779/week, Studio from $859-939/week
  const igluCentral = await prisma.accommodation.create({
    data: {
      name: 'Iglu Central',
      slug: 'iglu-central-uts',
      university: 'University of Technology Sydney (UTS)',
      address: '1 Regent Street',
      suburb: 'Chippendale',
      state: 'NSW',
      postcode: '2008',
      latitude: -33.8816,
      longitude: 151.2023,
      description:
        'Vibrant student living in Sydney CBD, perfectly positioned between UTS and the University of Sydney. Modern apartments with community spaces designed for student life. Includes free unlimited WiFi, coffee bar and weekday breakfast.',
      type: 'OFF_CAMPUS',
      images: [
        '/images/accommodations/iglu-central-1-exterior.jpg',
        '/images/accommodations/iglu-central-2-bedroom.jpg',
        '/images/accommodations/iglu-central-3-kitchen.jpg',
        '/images/accommodations/iglu-central-4-lounge.jpg',
        '/images/accommodations/iglu-central-5-study.jpg',
      ],
      priceMin: 709,
      priceMax: 939,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 350,
      roomTypes: ['5-Bedroom Apartment', '6-Bedroom Apartment', 'Studio'],
      contactInfo: {
        phone: '1300 IGLU AU',
        email: 'central@iglu.com.au',
        website: 'https://iglu.com.au/properties/sydney/central/',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.4,
      distanceToTransport: 0.2,
      verified: true,
      featured: false,
      sourceUrl: 'https://iglu.com.au/properties/sydney/central/',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    igluCentral.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Security',
      'Social Events',
      'Rooftop Terrace',
      'Air Conditioning',
    ],
    amenities
  );

  // ==========================================
  // MACQUARIE UNIVERSITY ACCOMMODATIONS
  // ==========================================

  // Macquarie University Village (Student Village North Ryde)
  // Verified pricing: Single ensuite from $361-436/week
  const mqVillage = await prisma.accommodation.create({
    data: {
      name: 'Macquarie University Village',
      slug: 'macquarie-university-village',
      university: 'Macquarie University',
      address: 'Balaclava Road',
      suburb: 'North Ryde',
      state: 'NSW',
      postcode: '2109',
      latitude: -33.7747,
      longitude: 151.1143,
      description:
        'On-campus accommodation offering a true university experience with modern facilities, diverse community, and easy access to all campus amenities. Located within walking distance to the Metro station.',
      type: 'ON_CAMPUS',
      images: [
        '/images/accommodations/macquarie-university-village-1.jpg',
        '/images/accommodations/macquarie-university-village-2.jpg',
        '/images/accommodations/macquarie-university-village-3.jpg',
        '/images/accommodations/macquarie-university-village-4.jpg',
        '/images/accommodations/macquarie-university-village-5.jpg',
      ],
      priceMin: 361,
      priceMax: 436,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 900,
      roomTypes: ['Single', 'Twin Share', 'Accessible'],
      contactInfo: {
        phone: '(02) 9850 7979',
        email: 'village@mq.edu.au',
        website: 'https://www.mq.edu.au/village',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.1,
      distanceToTransport: 0.4,
      verified: true,
      featured: true,
      sourceUrl: 'https://students.mq.edu.au/uni-life/accommodation',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    mqVillage.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Parking',
      'Security',
      'Social Events',
      'Meal Plans',
      'Music Rooms',
      'BBQ Area',
    ],
    amenities
  );

  // Dunmore Lang College
  const dunmoreLang = await prisma.accommodation.create({
    data: {
      name: 'Dunmore Lang College',
      slug: 'dunmore-lang-college',
      university: 'Macquarie University',
      address: '130 Herring Road',
      suburb: 'North Ryde',
      state: 'NSW',
      postcode: '2109',
      latitude: -33.7765,
      longitude: 151.1125,
      description:
        'A residential college offering a supportive academic community with tutorial programs, catered meals, and regular social events. Strong focus on academic achievement and personal development.',
      type: 'COLLEGE',
      images: [
        '/images/accommodations/dunmore-lang-college-1.jpg',
        '/images/accommodations/dunmore-lang-college-2.jpg',
        '/images/accommodations/dunmore-lang-college-3.jpg',
        '/images/accommodations/dunmore-lang-college-4.jpg',
        '/images/accommodations/dunmore-lang-college-5.jpg',
      ],
      priceMin: 400,
      priceMax: 550,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 280,
      roomTypes: ['Single', 'Accessible'],
      contactInfo: {
        phone: '(02) 9878 9600',
        email: 'info@dlc.edu.au',
        website: 'https://www.dlc.edu.au',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.2,
      distanceToTransport: 0.5,
      verified: true,
      featured: false,
      sourceUrl: 'https://www.dunmorelangcollege.nsw.edu.au/fees',
      lastVerified: null, // Specific fee amounts not publicly listed - needs manual verification
    },
  });
  await addAmenitiesToAccommodation(
    dunmoreLang.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Security',
      'Social Events',
      'Meal Plans',
      'Games Room',
      'BBQ Area',
      'Parking',
    ],
    amenities
  );

  // Robert Menzies College
  // Verified pricing from 2026 rates: 5 dinners/week from $491-643/week, 21 meals/week from $614-743/week (38-week contract)
  const robertMenzies = await prisma.accommodation.create({
    data: {
      name: 'Robert Menzies College',
      slug: 'robert-menzies-college',
      university: 'Macquarie University',
      address: '136 Herring Road',
      suburb: 'Macquarie Park',
      state: 'NSW',
      postcode: '2109',
      latitude: -33.7758,
      longitude: 151.1138,
      description:
        'A vibrant Anglican residential college committed to academic excellence and community engagement. Offers a collegiate experience with tutorials, mentoring, and a rich calendar of cultural and social activities. All-inclusive with meals, WiFi, utilities, and weekly linen changes.',
      type: 'COLLEGE',
      images: [
        '/images/accommodations/robert-menzies-college-1.jpg',
        '/images/accommodations/robert-menzies-college-2.webp',
        '/images/accommodations/robert-menzies-college-3.webp',
        '/images/accommodations/robert-menzies-college-4.webp',
        '/images/accommodations/robert-menzies-college-5.webp',
      ],
      priceMin: 491,
      priceMax: 743,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 320,
      roomTypes: ['Single', 'Twin Share', 'Accessible'],
      contactInfo: {
        phone: '(02) 9878 4800',
        email: 'admin@rmc.edu.au',
        website: 'https://www.rmc.edu.au',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.3,
      distanceToTransport: 0.6,
      verified: true,
      featured: false,
      sourceUrl: 'https://rmc.org.au/accommodation/',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    robertMenzies.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Security',
      'Social Events',
      'Meal Plans',
      'Music Rooms',
      'Games Room',
      'Swimming Pool',
    ],
    amenities
  );

  // ==========================================
  // WESTERN SYDNEY UNIVERSITY ACCOMMODATIONS
  // ==========================================

  // WSU Village Penrith
  // Verified pricing: Scholarship rate $170/week, standard from ~$168-350/week depending on room type
  const wsuVillagePenrith = await prisma.accommodation.create({
    data: {
      name: 'WSU Village Penrith',
      slug: 'wsu-village-penrith',
      university: 'Western Sydney University',
      address: 'Second Avenue',
      suburb: 'Kingswood',
      state: 'NSW',
      postcode: '2747',
      latitude: -33.756,
      longitude: 150.74,
      description:
        'Modern on-campus accommodation at WSU Penrith campus, offering affordable living with excellent facilities. Features self-catered apartments and a supportive student community. Just a 5-minute walk to campus.',
      type: 'ON_CAMPUS',
      images: [
        '/images/accommodations/wsu-village-penrith-1.jpg',
        '/images/accommodations/wsu-village-penrith-2.jpg',
        '/images/accommodations/wsu-village-penrith-3.jpg',
        '/images/accommodations/wsu-village-penrith-4.jpg',
        '/images/accommodations/wsu-village-penrith-5.jpg',
      ],
      priceMin: 170,
      priceMax: 350,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 400,
      roomTypes: ['Single', 'Twin Share', '4-Share Apartment'],
      contactInfo: {
        phone: '(02) 4736 0266',
        email: 'housing@westernsydney.edu.au',
        website: 'https://www.westernsydney.edu.au/accommodation',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.1,
      distanceToTransport: 0.8,
      verified: true,
      featured: true,
      sourceUrl: 'https://www.westernsydney.edu.au/accommodation/live-on-campus/penrith',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    wsuVillagePenrith.id,
    [
      'WiFi',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Parking',
      'Security',
      'Social Events',
      'BBQ Area',
      'Air Conditioning',
    ],
    amenities
  );

  // WSU Village Parramatta
  // Verified pricing: Shared units from $295/week, studios up to $436/week
  const wsuVillageParramatta = await prisma.accommodation.create({
    data: {
      name: 'WSU Village Parramatta',
      slug: 'wsu-village-parramatta',
      university: 'Western Sydney University',
      address: 'Corner of Pemberton Street and Victoria Road',
      suburb: 'Parramatta',
      state: 'NSW',
      postcode: '2150',
      latitude: -33.8136,
      longitude: 151.0034,
      description:
        'Student accommodation at the Parramatta City campus, close to the vibrant Parramatta CBD. Offers modern facilities and easy access to shopping, dining, and public transport. Includes swimming pool, games room, and BBQ deck.',
      type: 'ON_CAMPUS',
      images: [
        '/images/accommodations/wsu-village-parramatta-1.jpg',
        '/images/accommodations/wsu-village-parramatta-2.jpg',
        '/images/accommodations/wsu-village-parramatta-3.jpg',
        '/images/accommodations/wsu-village-parramatta-4.jpg',
        '/images/accommodations/wsu-village-parramatta-5.jpg',
      ],
      priceMin: 295,
      priceMax: 436,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 350,
      roomTypes: ['Studio', 'Single', '2-Bedroom Apartment'],
      contactInfo: {
        phone: '(02) 9685 9888',
        email: 'housing@westernsydney.edu.au',
        website: 'https://www.westernsydney.edu.au/accommodation',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.2,
      distanceToTransport: 0.4,
      verified: true,
      featured: false,
      sourceUrl:
        'https://campuslivingvillages.com/australia/sydney/western-sydney-university-village-parramatta/',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    wsuVillageParramatta.id,
    [
      'WiFi',
      'Gym',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Security',
      'Social Events',
      'Air Conditioning',
      'Bike Storage',
    ],
    amenities
  );

  // WSU Village Bankstown (formerly UniLodge @ WSU Bankstown)
  // Verified pricing: from $183-203/week for basic rooms
  const unilodgeBankstown = await prisma.accommodation.create({
    data: {
      name: 'WSU Village Bankstown',
      slug: 'wsu-village-bankstown',
      university: 'Western Sydney University',
      address: '2 Bullecourt Avenue',
      suburb: 'Milperra',
      state: 'NSW',
      postcode: '2214',
      latitude: -33.9343,
      longitude: 151.0432,
      description:
        'Purpose-built student accommodation near WSU Bankstown campus. Features modern apartments with all utilities included and regular community events. Amenities include BBQ area, volleyball court, TV lounge, computer room, and pool/table tennis.',
      type: 'OFF_CAMPUS',
      images: [
        '/images/accommodations/wsu-village-bankstown-1.jpg',
        '/images/accommodations/wsu-village-bankstown-2.jpg',
        '/images/accommodations/wsu-village-bankstown-3.jpg',
        '/images/accommodations/wsu-village-bankstown-4.jpg',
        '/images/accommodations/wsu-village-bankstown-5.jpg',
      ],
      priceMin: 183,
      priceMax: 320,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 280,
      roomTypes: ['Single', 'Twin Share', 'Accessible'],
      contactInfo: {
        phone: '1300 134 693',
        email: 'bankstown@unilodge.com.au',
        website: 'https://www.unilodge.com.au/bankstown',
      },
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingLocation: 0,
      ratingValue: 0,
      ratingAmenities: 0,
      ratingManagement: 0,
      ratingSafety: 0,
      totalReviews: 0,
      distanceToCampus: 0.5,
      distanceToTransport: 0.6,
      verified: true,
      featured: false,
      sourceUrl: 'https://campuslivingvillages.com/australia/sydney/wsu-village-bankstown/',
      lastVerified: new Date('2025-11-26'),
    },
  });
  await addAmenitiesToAccommodation(
    unilodgeBankstown.id,
    [
      'WiFi',
      'Study Rooms',
      'Laundry',
      'Common Kitchen',
      'Parking',
      'Security',
      'Social Events',
      'BBQ Area',
    ],
    amenities
  );

  console.log('✅ Created 15 sample accommodations across 5 universities');

  // Create Sample Reviews (0-2 per accommodation)
  console.log('📝 Creating sample reviews...');

  // Type for review data
  interface ReviewData {
    userId: string;
    ratingBreakdown: {
      cleanliness: number;
      location: number;
      value: number;
      amenities: number;
      management: number;
      safety: number;
    };
    title: string;
    text: string;
    pros: string[];
    cons: string[];
    verified: boolean;
    roomType: string;
    stayDuration: string;
    isAnonymous?: boolean;
  }

  // Helper function to calculate average rating from breakdown
  const calculateOverallRating = (breakdown: {
    cleanliness: number;
    location: number;
    value: number;
    amenities: number;
    management: number;
    safety: number;
  }) => {
    return (
      (breakdown.cleanliness +
        breakdown.location +
        breakdown.value +
        breakdown.amenities +
        breakdown.management +
        breakdown.safety) /
      6
    );
  };

  // Helper function to update accommodation ratings based on reviews
  const updateAccommodationRatings = async (accommodationId: string) => {
    const reviews = await prisma.review.findMany({
      where: { accommodationId, status: 'PUBLISHED' },
    });

    if (reviews.length === 0) {
      await prisma.accommodation.update({
        where: { id: accommodationId },
        data: {
          ratingOverall: 0,
          ratingCleanliness: 0,
          ratingLocation: 0,
          ratingValue: 0,
          ratingAmenities: 0,
          ratingManagement: 0,
          ratingSafety: 0,
          totalReviews: 0,
        },
      });
      return;
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const avgCleanliness =
      reviews.reduce((sum, r) => sum + r.ratingCleanliness, 0) / reviews.length;
    const avgLocation = reviews.reduce((sum, r) => sum + r.ratingLocation, 0) / reviews.length;
    const avgValue = reviews.reduce((sum, r) => sum + r.ratingValue, 0) / reviews.length;
    const avgAmenities = reviews.reduce((sum, r) => sum + r.ratingAmenities, 0) / reviews.length;
    const avgManagement = reviews.reduce((sum, r) => sum + r.ratingManagement, 0) / reviews.length;
    const avgSafety = reviews.reduce((sum, r) => sum + r.ratingSafety, 0) / reviews.length;

    await prisma.accommodation.update({
      where: { id: accommodationId },
      data: {
        ratingOverall: Math.round(avgRating * 10) / 10,
        ratingCleanliness: Math.round(avgCleanliness * 10) / 10,
        ratingLocation: Math.round(avgLocation * 10) / 10,
        ratingValue: Math.round(avgValue * 10) / 10,
        ratingAmenities: Math.round(avgAmenities * 10) / 10,
        ratingManagement: Math.round(avgManagement * 10) / 10,
        ratingSafety: Math.round(avgSafety * 10) / 10,
        totalReviews: reviews.length,
      },
    });
  };

  // Define reviews data for each accommodation (0-2 reviews each)
  // User index mapping by university:
  // users[0] = Sarah Thompson (UNSW)
  // users[1] = Michael Kim (University of Sydney)
  // users[2] = Emma Wilson (UTS)
  // users[3] = James Liu (Macquarie University)
  // users[4] = Olivia Nguyen (Western Sydney University)

  const reviewsData: { accommodationId: string; reviews: ReviewData[] }[] = [
    // UNSW Village - 2 reviews (UNSW students only)
    {
      accommodationId: unswVillage.id,
      reviews: [
        {
          userId: users[0].id, // Sarah - UNSW student
          ratingBreakdown: {
            cleanliness: 4,
            location: 5,
            value: 4,
            amenities: 5,
            management: 4,
            safety: 5,
          },
          title: 'Great location and facilities!',
          text: 'Living at UNSW Village has been fantastic. The location is unbeatable - just a 5-minute walk to my lectures. The facilities are modern and well-maintained. The gym is great and the study rooms are always available.',
          pros: ['Perfect location', 'Modern facilities', 'Great community'],
          cons: ['WiFi can be slow', 'Can be noisy on weekends'],
          verified: true,
          roomType: 'Single',
          stayDuration: '2 semesters',
        },
      ],
    },
    // Kensington Colleges - 1 review (UNSW student)
    {
      accommodationId: unswKensingtonColleges.id,
      reviews: [
        {
          userId: users[0].id, // Sarah - UNSW student
          ratingBreakdown: {
            cleanliness: 4,
            location: 5,
            value: 4,
            amenities: 4,
            management: 5,
            safety: 5,
          },
          title: 'Traditional college experience',
          text: 'If you want the full college experience with formal dinners and a strong community, this is the place. The tutoring support is excellent and the location is perfect for UNSW students.',
          pros: ['Strong community', 'Academic support', 'Meal plan included'],
          cons: ['Strict rules', 'Shared bathrooms'],
          verified: true,
          roomType: 'Single',
          stayDuration: '1 year',
        },
      ],
    },
    // UniLodge Kensington - 0 reviews (no reviews)
    {
      accommodationId: unilodgeKensington.id,
      reviews: [],
    },
    // UniLodge Broadway - 2 reviews (USYD students only)
    {
      accommodationId: unilodgeBroadway.id,
      reviews: [
        {
          userId: users[1].id, // Michael - USYD student
          ratingBreakdown: {
            cleanliness: 4,
            location: 5,
            value: 3,
            amenities: 5,
            management: 4,
            safety: 4,
          },
          title: 'Love the rooftop terrace!',
          text: 'UniLodge Broadway is in a prime location with amazing facilities. The rooftop terrace is perfect for studying or hanging out. Close to Central Station and Chinatown.',
          pros: ['Excellent location', 'Rooftop terrace', 'Modern amenities'],
          cons: ['Pricey', 'Small shared kitchens'],
          verified: true,
          roomType: 'Ensuite',
          stayDuration: '1 semester',
        },
      ],
    },
    // St John's College - 1 review (USYD student)
    {
      accommodationId: stJohnsCollege.id,
      reviews: [
        {
          userId: users[1].id, // Michael - USYD student
          ratingBreakdown: {
            cleanliness: 5,
            location: 5,
            value: 4,
            amenities: 4,
            management: 5,
            safety: 5,
          },
          title: 'Historic and prestigious',
          text: 'St Johns offers a unique experience with its beautiful historic buildings and strong traditions. The pastoral care is excellent and the community is very supportive. Highly recommend for first-year students.',
          pros: ['Beautiful grounds', 'Strong community', 'Academic support'],
          cons: ['Traditional rules', 'Can feel old-fashioned'],
          verified: true,
          roomType: 'Single',
          stayDuration: '2 years',
        },
      ],
    },
    // Queen Mary Building - 0 reviews
    {
      accommodationId: queenMaryBuilding.id,
      reviews: [],
    },
    // Yura Mudang - 2 reviews (UTS students only)
    {
      accommodationId: yuraMudang.id,
      reviews: [
        {
          userId: users[2].id, // Emma - UTS student
          ratingBreakdown: {
            cleanliness: 5,
            location: 5,
            value: 4,
            amenities: 5,
            management: 4,
            safety: 5,
          },
          title: 'Best UTS accommodation!',
          text: 'Yura Mudang exceeded my expectations. The apartments are modern and well-designed with amazing city views. Being right next to the campus is incredibly convenient.',
          pros: ['On campus', 'Modern apartments', 'Great views'],
          cons: ['Can be expensive', 'Shared apartments vary'],
          verified: true,
          roomType: 'Studio',
          stayDuration: '1 year',
        },
      ],
    },
    // Urbanest Darling - 1 review (UTS student)
    {
      accommodationId: urbanestDarling.id,
      reviews: [
        {
          userId: users[2].id, // Emma - UTS student
          ratingBreakdown: {
            cleanliness: 4,
            location: 5,
            value: 3,
            amenities: 4,
            management: 4,
            safety: 4,
          },
          title: 'Perfect for UTS students',
          text: 'Great location right near UTS campus. The building is modern and clean. Social events are fun. A bit pricey but worth it for the convenience.',
          pros: ['Close to UTS', 'Modern building', 'Good social life'],
          cons: ['Expensive', 'Small rooms'],
          verified: true,
          roomType: 'Ensuite',
          stayDuration: '1 year',
        },
      ],
    },
    // Iglu Central - 0 reviews
    {
      accommodationId: igluCentral.id,
      reviews: [],
    },
    // Macquarie Village - 2 reviews (Macquarie students only)
    {
      accommodationId: mqVillage.id,
      reviews: [
        {
          userId: users[3].id, // James - Macquarie student
          ratingBreakdown: {
            cleanliness: 4,
            location: 5,
            value: 4,
            amenities: 4,
            management: 5,
            safety: 4,
          },
          title: 'Great value for money',
          text: 'Macquarie University Village offers excellent value. The location right on campus is perfect, and the new Metro station makes getting to the city easy. Management is very responsive.',
          pros: ['On campus', 'Metro access', 'Responsive management'],
          cons: ['Older buildings', 'Limited parking'],
          verified: true,
          roomType: 'Single',
          stayDuration: '2 years',
        },
      ],
    },
    // Dunmore Lang College - 1 review (Macquarie student)
    {
      accommodationId: dunmoreLang.id,
      reviews: [
        {
          userId: users[3].id, // James - Macquarie student
          ratingBreakdown: {
            cleanliness: 4,
            location: 5,
            value: 4,
            amenities: 4,
            management: 5,
            safety: 5,
          },
          title: 'Welcoming college community',
          text: 'Dunmore Lang has a wonderful community feel. The pastoral care is excellent and they really help first-year students adjust. Meals are included which makes life easier.',
          pros: ['Inclusive community', 'Meals included', 'Academic support'],
          cons: ['Shared facilities', 'Some rules to follow'],
          verified: true,
          roomType: 'Single',
          stayDuration: '1 year',
        },
      ],
    },
    // Robert Menzies College - 0 reviews
    {
      accommodationId: robertMenzies.id,
      reviews: [],
    },
    // WSU Village Penrith - 2 reviews (WSU students only)
    {
      accommodationId: wsuVillagePenrith.id,
      reviews: [
        {
          userId: users[4].id, // Olivia - WSU student
          ratingBreakdown: {
            cleanliness: 4,
            location: 4,
            value: 5,
            amenities: 4,
            management: 4,
            safety: 4,
          },
          title: 'Affordable and comfortable',
          text: 'WSU Village is perfect for students on a budget. The accommodation is clean and comfortable with everything you need. Being on campus means no commute time.',
          pros: ['Very affordable', 'On campus', 'Friendly community'],
          cons: ['Far from train station', 'Limited nightlife nearby'],
          verified: true,
          roomType: 'Twin Share',
          stayDuration: '3 semesters',
        },
      ],
    },
    // WSU Village Parramatta - 1 review (WSU student)
    {
      accommodationId: wsuVillageParramatta.id,
      reviews: [
        {
          userId: users[4].id, // Olivia - WSU student
          ratingBreakdown: {
            cleanliness: 4,
            location: 5,
            value: 4,
            amenities: 4,
            management: 4,
            safety: 4,
          },
          title: 'Great Parramatta location',
          text: 'Love being so close to Parramatta CBD. Easy access to shops, restaurants, and transport. The accommodation is modern and well-maintained. Good value for the location.',
          pros: ['Close to Parramatta CBD', 'Modern facilities', 'Good transport links'],
          cons: ['Can be noisy', 'Limited parking'],
          verified: true,
          roomType: 'Studio',
          stayDuration: '2 semesters',
        },
      ],
    },
    // WSU Village Bankstown - 0 reviews
    {
      accommodationId: unilodgeBankstown.id,
      reviews: [],
    },
  ];

  // Create reviews and update accommodation ratings
  let totalReviewsCreated = 0;

  for (const accomData of reviewsData) {
    for (const reviewData of accomData.reviews) {
      const overallRating = calculateOverallRating(reviewData.ratingBreakdown);
      await prisma.review.create({
        data: {
          accommodationId: accomData.accommodationId,
          userId: reviewData.userId,
          rating: Math.round(overallRating * 10) / 10,
          ratingCleanliness: reviewData.ratingBreakdown.cleanliness,
          ratingLocation: reviewData.ratingBreakdown.location,
          ratingValue: reviewData.ratingBreakdown.value,
          ratingAmenities: reviewData.ratingBreakdown.amenities,
          ratingManagement: reviewData.ratingBreakdown.management,
          ratingSafety: reviewData.ratingBreakdown.safety,
          title: reviewData.title,
          text: reviewData.text,
          pros: reviewData.pros,
          cons: reviewData.cons,
          verified: reviewData.verified,
          isAnonymous: reviewData.isAnonymous || false,
          roomType: reviewData.roomType,
          stayDuration: reviewData.stayDuration,
          status: 'PUBLISHED',
        },
      });
      totalReviewsCreated++;
    }

    // Update accommodation ratings
    await updateAccommodationRatings(accomData.accommodationId);
  }

  console.log(`✅ Created ${totalReviewsCreated} sample reviews`);

  // Count accommodations with 0 reviews
  const accommodationsWithNoReviews = reviewsData.filter((a) => a.reviews.length === 0).length;
  console.log(
    `   - ${accommodationsWithNoReviews} accommodations with 0 reviews (rating shows as 0 stars)`
  );

  console.log('');
  console.log('✨ Database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - ${amenities.length} amenities`);
  console.log(`  - ${users.length} users`);
  console.log('  - 15 accommodations (3 per university)');
  console.log(`  - ${totalReviewsCreated} reviews (0-2 per accommodation)`);
  console.log('');
  console.log('🏫 Universities covered:');
  console.log('  - University of New South Wales (UNSW): 3 accommodations');
  console.log('  - University of Sydney: 3 accommodations');
  console.log('  - University of Technology Sydney (UTS): 3 accommodations');
  console.log('  - Macquarie University: 3 accommodations');
  console.log('  - Western Sydney University: 3 accommodations');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
