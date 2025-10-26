/**
 * Database Seeding Script
 * Populates database with sample data
 * Run with: npm run db:seed
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🌱 Starting database seeding...\n');

    // Insert sample accommodations
    console.log('📍 Seeding accommodations...');
    const accommodationInserts = [
      {
        name: 'UNSW Village',
        slug: 'unsw-village',
        university: 'University of New South Wales (UNSW)',
        address: '1 Barker Street',
        suburb: 'Kensington',
        state: 'NSW',
        postcode: '2033',
        description: 'Modern student accommodation on UNSW campus with excellent facilities.',
        type: 'on-campus',
        capacity: 750,
        price_min: 350,
        price_max: 550,
        verified: true,
        featured: true,
      },
      {
        name: 'UniLodge on Broadway',
        slug: 'unilodge-broadway',
        university: 'University of Sydney',
        address: '13-15 Broadway',
        suburb: 'Ultimo',
        state: 'NSW',
        postcode: '2007',
        description: 'Purpose-built student accommodation close to Sydney University and UTS.',
        type: 'off-campus',
        capacity: 550,
        price_min: 400,
        price_max: 650,
        verified: true,
        featured: true,
      },
    ];

    for (const accom of accommodationInserts) {
      await pool.query(
        `INSERT INTO accommodations
        (name, slug, university, address, suburb, state, postcode, description, type, capacity, price_min, price_max, verified, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (slug) DO NOTHING`,
        [
          accom.name,
          accom.slug,
          accom.university,
          accom.address,
          accom.suburb,
          accom.state,
          accom.postcode,
          accom.description,
          accom.type,
          accom.capacity,
          accom.price_min,
          accom.price_max,
          accom.verified,
          accom.featured,
        ]
      );
    }
    console.log('✅ Accommodations seeded\n');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
