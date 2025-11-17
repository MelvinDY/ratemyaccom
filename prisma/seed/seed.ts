/**
 * Database Seed Script
 * Seeds the database with initial data including amenities and sample accommodations
 *
 * Run with: npx tsx prisma/seed/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  // UNSW Village
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
        'Modern student accommodation located on the UNSW campus, offering a vibrant community with excellent facilities and convenient access to university resources.',
      type: 'ON_CAMPUS',
      images: [
        '/images/unsw-village-1.jpg',
        '/images/unsw-village-2.jpg',
        '/images/unsw-village-3.jpg',
      ],
      priceMin: 350,
      priceMax: 550,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 750,
      roomTypes: ['Single', 'Twin Share', 'Studio'],
      contactInfo: {
        phone: '(02) 9385 4734',
        email: 'village@unsw.edu.au',
        website: 'https://www.unswvillage.com.au',
      },
      ratingOverall: 4.3,
      ratingCleanliness: 4.5,
      ratingLocation: 4.8,
      ratingValue: 4.0,
      ratingAmenities: 4.4,
      ratingManagement: 4.2,
      ratingSafety: 4.7,
      totalReviews: 0,
      distanceToCampus: 0.2,
      distanceToTransport: 0.5,
      verified: true,
      featured: true,
    },
  });

  // Add amenities to UNSW Village
  const unswVillageAmenities = ['WiFi', 'Gym', 'Study Rooms', 'Laundry', 'Common Kitchen', 'Parking', 'Security', 'Social Events'];
  for (const amenityName of unswVillageAmenities) {
    const amenity = amenities.find((a) => a.name === amenityName);
    if (amenity) {
      await prisma.accommodationAmenity.create({
        data: {
          accommodationId: unswVillage.id,
          amenityId: amenity.id,
          available: true,
        },
      });
    }
  }

  // UniLodge on Broadway
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
        'Purpose-built student accommodation in the heart of Sydney, close to University of Sydney and UTS. Features modern amenities and a vibrant student community.',
      type: 'OFF_CAMPUS',
      images: ['/images/unilodge-broadway-1.jpg', '/images/unilodge-broadway-2.jpg'],
      priceMin: 400,
      priceMax: 650,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 550,
      roomTypes: ['Studio', 'Single', 'Ensuite'],
      contactInfo: {
        phone: '1300 134 693',
        email: 'broadway@unilodge.com.au',
        website: 'https://www.unilodge.com.au/broadway',
      },
      ratingOverall: 4.1,
      ratingCleanliness: 4.3,
      ratingLocation: 4.6,
      ratingValue: 3.8,
      ratingAmenities: 4.5,
      ratingManagement: 3.9,
      ratingSafety: 4.4,
      totalReviews: 0,
      distanceToCampus: 1.2,
      distanceToTransport: 0.3,
      verified: true,
      featured: true,
    },
  });

  // Add amenities to UniLodge
  const unilodgeAmenities = ['WiFi', 'Gym', 'Study Rooms', 'Laundry', 'Common Kitchen', 'Security', 'Social Events', 'Cinema Room', 'Rooftop Terrace'];
  for (const amenityName of unilodgeAmenities) {
    const amenity = amenities.find((a) => a.name === amenityName);
    if (amenity) {
      await prisma.accommodationAmenity.create({
        data: {
          accommodationId: unilodgeBroadway.id,
          amenityId: amenity.id,
          available: amenityName !== 'Parking', // Parking not available
        },
      });
    }
  }

  // Macquarie University Village
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
        'On-campus accommodation offering a true university experience with modern facilities, diverse community, and easy access to all campus amenities.',
      type: 'ON_CAMPUS',
      images: ['/images/mq-village-1.jpg', '/images/mq-village-2.jpg', '/images/mq-village-3.jpg'],
      priceMin: 320,
      priceMax: 480,
      currency: 'AUD',
      pricePeriod: 'WEEK',
      capacity: 900,
      roomTypes: ['Single', 'Twin Share', 'Accessible'],
      contactInfo: {
        phone: '(02) 9850 7979',
        email: 'village@mq.edu.au',
        website: 'https://www.mq.edu.au/village',
      },
      ratingOverall: 4.4,
      ratingCleanliness: 4.2,
      ratingLocation: 4.9,
      ratingValue: 4.3,
      ratingAmenities: 4.3,
      ratingManagement: 4.5,
      ratingSafety: 4.6,
      totalReviews: 0,
      distanceToCampus: 0.1,
      distanceToTransport: 0.8,
      verified: true,
      featured: true,
    },
  });

  // Add amenities to MQ Village
  const mqAmenities = ['WiFi', 'Gym', 'Study Rooms', 'Laundry', 'Common Kitchen', 'Parking', 'Security', 'Social Events', 'Meal Plans', 'Music Rooms'];
  for (const amenityName of mqAmenities) {
    const amenity = amenities.find((a) => a.name === amenityName);
    if (amenity) {
      await prisma.accommodationAmenity.create({
        data: {
          accommodationId: mqVillage.id,
          amenityId: amenity.id,
          available: true,
        },
      });
    }
  }

  console.log('✅ Created 3 sample accommodations');

  // Create Sample Reviews
  console.log('📝 Creating sample reviews...');
  const review1 = await prisma.review.create({
    data: {
      accommodationId: unswVillage.id,
      userId: users[0].id,
      rating: 4.5,
      ratingCleanliness: 4,
      ratingLocation: 5,
      ratingValue: 4,
      ratingAmenities: 5,
      ratingManagement: 4,
      ratingSafety: 5,
      title: 'Great location and facilities!',
      text: 'Living at UNSW Village has been fantastic. The location is unbeatable - just a 5-minute walk to my lectures. The facilities are modern and well-maintained. The gym is great and the study rooms are always available. Only minor complaint is the WiFi can be slow during peak times.',
      pros: ['Perfect location', 'Modern facilities', 'Great community', 'Good security'],
      cons: ['WiFi speed', 'Can be noisy on weekends'],
      verified: true,
      roomType: 'Single',
      stayDuration: '2 semesters',
      status: 'PUBLISHED',
    },
  });

  const review2 = await prisma.review.create({
    data: {
      accommodationId: unilodgeBroadway.id,
      userId: users[1].id,
      rating: 4.0,
      ratingCleanliness: 4,
      ratingLocation: 5,
      ratingValue: 3,
      ratingAmenities: 5,
      ratingManagement: 4,
      ratingSafety: 4,
      title: 'Love the rooftop terrace!',
      text: 'UniLodge Broadway is in a prime location with amazing facilities. The rooftop terrace is perfect for studying or hanging out. Close to Central Station and Chinatown. The only downside is the price and limited kitchen space in shared areas.',
      pros: ['Excellent location', 'Rooftop terrace', 'Modern amenities', 'Social atmosphere'],
      cons: ['Pricey', 'Small shared kitchens', 'Can hear train noise'],
      verified: true,
      roomType: 'Ensuite',
      stayDuration: '1 semester',
      status: 'PUBLISHED',
    },
  });

  // Update accommodation review counts and ratings
  await prisma.accommodation.update({
    where: { id: unswVillage.id },
    data: { totalReviews: 1 },
  });

  await prisma.accommodation.update({
    where: { id: unilodgeBroadway.id },
    data: { totalReviews: 1 },
  });

  console.log('✅ Created 2 sample reviews');

  console.log('');
  console.log('✨ Database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - ${amenities.length} amenities`);
  console.log(`  - ${users.length} users`);
  console.log('  - 3 accommodations');
  console.log('  - 2 reviews');
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
