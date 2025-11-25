/**
 * Database Setup Script
 * Run this to set up the database with initial data
 *
 * Usage: npx tsx scripts/setup-database.ts
 */

import { prisma } from '../lib/database/prisma';
import { accommodationImporter } from '../lib/import/accommodation-importer';
import { placeholderAccommodations } from '../lib/data/placeholder';

async function setupDatabase() {
  console.log('Starting database setup...\n');

  try {
    // 1. Check database connection
    console.log('1. Checking database connection...');
    await prisma.$queryRaw`SELECT 1 as health`;
    console.log('   ✓ Database connected successfully\n');

    // 2. Create common amenities
    console.log('2. Creating common amenities...');
    const commonAmenities = [
      { name: 'WiFi', icon: 'wifi', category: 'facilities' },
      { name: 'Gym', icon: 'dumbbell', category: 'facilities' },
      { name: 'Study Rooms', icon: 'book', category: 'facilities' },
      { name: 'Laundry', icon: 'washing-machine', category: 'facilities' },
      { name: 'Common Kitchen', icon: 'utensils', category: 'facilities' },
      { name: 'Parking', icon: 'car', category: 'facilities' },
      { name: 'Security', icon: 'shield', category: 'security' },
      { name: 'Social Events', icon: 'users', category: 'services' },
      { name: 'Meal Plans', icon: 'utensils', category: 'services' },
      { name: 'Bike Storage', icon: 'bike', category: 'facilities' },
      { name: 'Games Room', icon: 'gamepad', category: 'facilities' },
      { name: 'Cinema Room', icon: 'film', category: 'facilities' },
      { name: 'Rooftop Terrace', icon: 'home', category: 'facilities' },
      { name: 'Music Rooms', icon: 'music', category: 'facilities' },
    ];

    for (const amenity of commonAmenities) {
      await prisma.amenity.upsert({
        where: { name: amenity.name },
        update: {},
        create: amenity,
      });
    }
    console.log(`   ✓ Created ${commonAmenities.length} amenities\n`);

    // 3. Import placeholder accommodations
    console.log('3. Importing accommodations from placeholder data...');

    // Transform placeholder data to import format
    const accommodationsToImport = placeholderAccommodations.map(accom => ({
      name: accom.name,
      university: accom.university,
      address: accom.location.address,
      suburb: accom.location.suburb,
      state: accom.location.state,
      postcode: accom.location.postcode,
      latitude: accom.location.coordinates?.lat,
      longitude: accom.location.coordinates?.lng,
      description: accom.description,
      type: accom.type,
      images: accom.images,
      priceMin: accom.pricing.min,
      priceMax: accom.pricing.max,
      pricePeriod: accom.pricing.period,
      capacity: accom.capacity,
      roomTypes: accom.roomTypes,
      contactInfo: accom.contactInfo,
      amenities: accom.amenities.filter(a => a.available).map(a => a.name),
    }));

    const importResults = await accommodationImporter.importMany(accommodationsToImport);

    console.log('   Import Results:');
    console.log(`   ✓ Total: ${importResults.total}`);
    console.log(`   ✓ Created: ${importResults.created}`);
    console.log(`   ✓ Skipped: ${importResults.skipped}`);
    console.log(`   ✓ Failed: ${importResults.failed}\n`);

    // 4. Create test user
    console.log('4. Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        university: 'University of Sydney',
        verified: true,
        role: 'USER',
      },
    });
    console.log(`   ✓ Created test user: ${testUser.email}\n`);

    // 5. Summary
    console.log('Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Check: http://localhost:3000/api/accommodations\n');

  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase();
