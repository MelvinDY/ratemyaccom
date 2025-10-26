/**
 * Database Migration Script
 * Run with: npm run db:migrate
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const migrations = [
  {
    name: '001_create_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        university VARCHAR(255),
        student_id VARCHAR(100),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_university ON users(university);
    `,
  },
  {
    name: '002_create_accommodations_table',
    up: `
      CREATE TABLE IF NOT EXISTS accommodations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        university VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        suburb VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        postcode VARCHAR(10) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        capacity INTEGER,
        price_min DECIMAL(10, 2),
        price_max DECIMAL(10, 2),
        verified BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_accommodations_slug ON accommodations(slug);
      CREATE INDEX idx_accommodations_university ON accommodations(university);
      CREATE INDEX idx_accommodations_suburb ON accommodations(suburb);
    `,
  },
  {
    name: '003_create_reviews_table',
    up: `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
        rating_cleanliness DECIMAL(2, 1) CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5),
        rating_location DECIMAL(2, 1) CHECK (rating_location >= 1 AND rating_location <= 5),
        rating_value DECIMAL(2, 1) CHECK (rating_value >= 1 AND rating_value <= 5),
        rating_amenities DECIMAL(2, 1) CHECK (rating_amenities >= 1 AND rating_amenities <= 5),
        rating_management DECIMAL(2, 1) CHECK (rating_management >= 1 AND rating_management <= 5),
        rating_safety DECIMAL(2, 1) CHECK (rating_safety >= 1 AND rating_safety <= 5),
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        pros TEXT[],
        cons TEXT[],
        verified BOOLEAN DEFAULT false,
        room_type VARCHAR(100),
        stay_duration VARCHAR(100),
        helpful INTEGER DEFAULT 0,
        reported INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_reviews_accommodation ON reviews(accommodation_id);
      CREATE INDEX idx_reviews_user ON reviews(user_id);
      CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
    `,
  },
  {
    name: '004_create_amenities_table',
    up: `
      CREATE TABLE IF NOT EXISTS amenities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_amenities_accommodation ON amenities(accommodation_id);
    `,
  },
  {
    name: '005_create_migrations_table',
    up: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Starting database migrations...\n');

    // Create migrations table first
    await pool.query(migrations[4].up);

    // Get executed migrations
    const { rows: executedMigrations } = await pool.query('SELECT name FROM migrations');
    const executed = new Set(executedMigrations.map((row) => row.name));

    // Run pending migrations
    for (const migration of migrations.slice(0, 4)) {
      if (!executed.has(migration.name)) {
        console.log(`⚙️  Running migration: ${migration.name}`);
        await pool.query(migration.up);
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
        console.log(`✅ Completed: ${migration.name}\n`);
      } else {
        console.log(`⏭️  Skipping (already executed): ${migration.name}\n`);
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
