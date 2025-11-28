/**
 * Database Connection Test Script
 * Verifies database connectivity and displays sample data
 */

import { prisma } from '../lib/database/prisma';

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test 1: Connection Health Check
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');

    // Test 2: Count Records
    console.log('📊 Database Statistics:');
    const stats = await Promise.all([
      prisma.accommodation.count(),
      prisma.amenity.count(),
      prisma.user.count(),
      prisma.review.count(),
    ]);

    console.log(`  • Accommodations: ${stats[0]}`);
    console.log(`  • Amenities: ${stats[1]}`);
    console.log(`  • Users: ${stats[2]}`);
    console.log(`  • Reviews: ${stats[3]}\n`);

    // Test 3: Fetch Sample Accommodations
    console.log('🏠 Sample Accommodations:');
    const accommodations = await prisma.accommodation.findMany({
      take: 3,
      select: {
        name: true,
        university: true,
        suburb: true,
        priceMin: true,
        priceMax: true,
        ratingOverall: true,
        verified: true,
        featured: true,
      },
    });

    accommodations.forEach((acc, idx) => {
      console.log(`\n  ${idx + 1}. ${acc.name}`);
      console.log(`     University: ${acc.university}`);
      console.log(`     Location: ${acc.suburb}`);
      console.log(`     Price: $${acc.priceMin}-$${acc.priceMax}/week`);
      console.log(`     Rating: ${acc.ratingOverall}/5.0`);
      console.log(
        `     Verified: ${acc.verified ? '✓' : '✗'} | Featured: ${acc.featured ? '✓' : '✗'}`
      );
    });

    // Test 4: Fetch Sample Amenities
    console.log('\n\n🏢 Available Amenities:');
    const amenities = await prisma.amenity.findMany({
      take: 10,
      select: {
        name: true,
        category: true,
        icon: true,
      },
    });

    const amenityList = amenities.map((a) => `${a.icon} ${a.name}`).join(', ');
    console.log(`  ${amenityList}\n`);

    // Test 5: Complex Query with Relations
    console.log('🔍 Testing Complex Queries (with relations)...');
    const featuredWithAmenities = await prisma.accommodation.findFirst({
      where: { featured: true },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
          take: 5,
        },
        reviews: {
          take: 1,
        },
      },
    });

    if (featuredWithAmenities) {
      console.log(`  ✓ Complex query successful`);
      console.log(`  ✓ Featured: ${featuredWithAmenities.name}`);
      console.log(`  ✓ Amenities linked: ${featuredWithAmenities.amenities.length}`);
      console.log(`  ✓ Reviews linked: ${featuredWithAmenities.reviews.length}\n`);
    }

    console.log('✨ All database tests passed!\n');
    console.log('🎉 Your database is ready to use!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Test API: http://localhost:3000/api/accommodations');
    console.log('  3. View database: npx prisma studio');
    console.log('  4. Start web scraping: see WEB_SCRAPER_INSTRUCTIONS.md\n');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
