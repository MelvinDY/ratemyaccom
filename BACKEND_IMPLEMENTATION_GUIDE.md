# Backend Implementation Guide - RateMyAccom

This guide provides step-by-step instructions to implement the complete backend architecture for your accommodation rating platform.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Database Setup](#database-setup)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Migration & Seeding](#migration--seeding)
6. [API Implementation](#api-implementation)
7. [Web Scraping](#web-scraping)
8. [Data Import](#data-import)
9. [Caching Strategy](#caching-strategy)
10. [Production Deployment](#production-deployment)

## Technology Stack

### Database & ORM
- **PostgreSQL 15+**: Robust relational database with JSONB support
- **Prisma**: Type-safe ORM with automatic migration generation
- **Reason**: Perfect match for complex relational data (accommodations, reviews, users) with flexibility for JSON fields

### Web Scraping
- **Playwright**: Modern browser automation (already in your dependencies)
- **Reason**: More reliable than Puppeteer, better TypeScript support, handles dynamic content

### Additional Dependencies
```json
{
  "prisma": "^5.21.1",
  "@prisma/client": "^5.21.1",
  "tsx": "^4.19.2",
  "playwright": "^1.56.1"
}
```

## Database Setup

### 1. Install Dependencies

```bash
npm install prisma @prisma/client tsx --save-dev
npm install @prisma/client
```

### 2. Initialize Prisma

The schema is already created at `/home/melvin/ratemyaccom/prisma/schema.prisma`

### 3. Environment Variables

Create or update `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ratemyaccom?schema=public"
DATABASE_SSL="false"  # Set to "true" in production
DATABASE_POOL_MAX="10"
DATABASE_POOL_MIN="2"

# Application
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Scraping (optional)
LOG_LEVEL="info"
```

### 4. Database Options

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (Ubuntu/WSL)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create database
sudo -u postgres psql
CREATE DATABASE ratemyaccom;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE ratemyaccom TO myuser;
\q
```

Then update DATABASE_URL:
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/ratemyaccom"
```

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name ratemyaccom-db \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=ratemyaccom \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Option C: Cloud Database (Recommended for Production)

**Vercel Postgres** (Easiest for Vercel deployment):
```bash
# Install Vercel CLI
npm i -g vercel

# Create Postgres database
vercel postgres create ratemyaccom

# Get connection string
vercel env pull .env.local
```

**Other options**: Supabase, Neon, Railway, PlanetScale

## Installation Steps

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Migrations

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Or use the included script
npm run db:migrate
```

### 3. Seed Database

```bash
# Run the setup script
npx tsx scripts/setup-database.ts

# Or use the npm script
npm run db:seed
```

This will:
- Create common amenities
- Import placeholder accommodation data
- Create a test user
- Set up initial database state

## Configuration

### Update package.json Scripts

Add these scripts (already in your package.json):

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx scripts/setup-database.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "scraper:run": "tsx scripts/run-scraper.ts",
    "generate": "prisma generate"
  }
}
```

### Project Structure

```
ratemyaccom/
├── prisma/
│   └── schema.prisma           # Database schema
├── lib/
│   ├── database/
│   │   ├── prisma.ts          # Prisma client
│   │   └── repositories/      # Data access layer
│   │       ├── accommodation.repository.ts
│   │       └── review.repository.ts
│   ├── scraping/
│   │   ├── base-scraper.ts    # Abstract scraper class
│   │   ├── logger.ts          # Logging utility
│   │   └── scrapers/
│   │       └── university-scraper.ts
│   └── import/
│       └── accommodation-importer.ts
├── app/api/
│   ├── accommodations/
│   │   ├── route.new.ts       # Updated API route
│   │   └── [id]/
│   │       └── route.new.ts
│   └── reviews/
│       └── route.new.ts
└── scripts/
    ├── setup-database.ts      # Database setup
    └── run-scraper.ts         # Scraper runner
```

## API Implementation

### Step 1: Replace API Routes

The new database-backed routes are created with `.new.ts` extension. To activate them:

```bash
# Backup old routes
mv app/api/accommodations/route.ts app/api/accommodations/route.old.ts
mv app/api/accommodations/[id]/route.ts app/api/accommodations/[id]/route.old.ts
mv app/api/reviews/route.ts app/api/reviews/route.old.ts

# Activate new routes
mv app/api/accommodations/route.new.ts app/api/accommodations/route.ts
mv app/api/accommodations/[id]/route.new.ts app/api/accommodations/[id]/route.ts
mv app/api/reviews/route.new.ts app/api/reviews/route.ts
```

### Step 2: Test API Endpoints

```bash
# Start development server
npm run dev

# Test endpoints
curl http://localhost:3000/api/accommodations
curl http://localhost:3000/api/accommodations/unsw-village
curl "http://localhost:3000/api/reviews?accommodationId=<id>"
```

### Available Endpoints

#### Accommodations

```typescript
// GET /api/accommodations
// Query params: university, location, priceMin, priceMax, rating, type, amenities, page, limit
GET /api/accommodations?university=UNSW&priceMax=500&page=1&limit=12

// GET /api/accommodations/:id
GET /api/accommodations/unsw-village

// POST /api/accommodations (admin only)
POST /api/accommodations
{
  "name": "New Accommodation",
  "university": "UNSW",
  // ... other fields
}

// PUT /api/accommodations/:id (admin only)
PUT /api/accommodations/:id

// DELETE /api/accommodations/:id (admin only)
DELETE /api/accommodations/:id
```

#### Reviews

```typescript
// GET /api/reviews
GET /api/reviews?accommodationId=123&page=1&limit=10

// POST /api/reviews
POST /api/reviews
{
  "accommodationId": "123",
  "userId": "user123",
  "rating": 4.5,
  "ratingBreakdown": {
    "cleanliness": 5,
    "location": 5,
    "value": 4,
    "amenities": 4,
    "management": 4,
    "safety": 5
  },
  "title": "Great place to stay",
  "text": "I really enjoyed my time here...",
  "pros": ["Great location", "Clean rooms"],
  "cons": ["A bit expensive"],
  "roomType": "Single",
  "stayDuration": "2 semesters"
}
```

## Web Scraping

### Architecture Overview

The scraping system is built on:
1. **BaseScraper**: Abstract class with common functionality
2. **Concrete Scrapers**: Site-specific implementations
3. **Logger**: Structured logging
4. **Database Integration**: Automatic deduplication and import

### Creating a New Scraper

```typescript
// lib/scraping/scrapers/studentvip-scraper.ts
import { chromium, Page } from 'playwright';
import { BaseScraper, ScrapedAccommodation, ScraperConfig } from '../base-scraper';

export class StudentVIPScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'studentvip',
      baseUrl: 'https://studentvip.com.au/accommodation',
      rateLimit: 3000, // 3 seconds
      maxRetries: 3,
      timeout: 30000,
    };
    super(config);
  }

  protected async scrape() {
    // Implementation here
  }

  protected async extractAccommodationData(page: Page) {
    // Site-specific extraction logic
  }
}
```

### Running Scrapers

```bash
# Run university scraper
npx tsx scripts/run-scraper.ts university

# Add more scrapers
npx tsx scripts/run-scraper.ts studentvip
```

### Best Practices

1. **Rate Limiting**: Always respect website terms of service
2. **User Agent**: Use realistic user agents
3. **Error Handling**: Implement retry logic
4. **Logging**: Track all operations for debugging
5. **Deduplication**: Check before inserting

### Data Sources for Australian Accommodation

1. **University Websites**
   - UNSW: https://www.unsw.edu.au/life-at-unsw/campus-living
   - USYD: https://www.sydney.edu.au/campus-life/accommodation.html
   - UQ: https://www.uq.edu.au/student-life/accommodation
   - Monash: https://www.monash.edu/accommodation

2. **Student Housing Providers**
   - UniLodge: https://www.unilodge.com.au
   - Urbanest: https://www.urbanest.com.au
   - Scape: https://www.scape.com
   - Student One: https://studentone.com

3. **Listing Aggregators**
   - StudentVIP: https://studentvip.com.au/accommodation
   - Flatmates: https://flatmates.com.au
   - Realestate.com.au (student filter)

4. **Google Places API**
   - Use for geocoding and additional details
   - Requires API key

## Data Import

### Manual Import from JSON

```typescript
// Create data file: data/accommodations.json
[
  {
    "name": "Example Accommodation",
    "university": "UNSW",
    "address": "123 Main St",
    "suburb": "Kensington",
    "state": "NSW",
    "postcode": "2033",
    "description": "Great place",
    "type": "on-campus",
    "priceMin": 300,
    "priceMax": 500,
    "pricePeriod": "week",
    "roomTypes": ["Single", "Twin"],
    "contactInfo": {
      "email": "info@example.com"
    },
    "amenities": ["WiFi", "Gym"]
  }
]

// Run import
import { accommodationImporter } from './lib/import/accommodation-importer';
await accommodationImporter.importFromJSON('./data/accommodations.json');
```

### Validation & Error Handling

The importer includes:
- Zod schema validation
- Duplicate detection
- Error logging to database
- Transaction support

### Import Logs

Check import logs:
```bash
npx prisma studio
# Navigate to DataImportLog table
```

## Caching Strategy

### 1. API Route Caching

```typescript
// app/api/accommodations/route.ts
export const revalidate = 3600; // Revalidate every hour

// Or use Next.js cache
import { unstable_cache } from 'next/cache';

const getCachedAccommodations = unstable_cache(
  async (filters) => {
    return await accommodationRepository.search(filters);
  },
  ['accommodations'],
  { revalidate: 3600 }
);
```

### 2. Redis Caching (Production)

```bash
npm install ioredis
```

```typescript
// lib/cache/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### 3. Caching Layers

```
Client → CDN → Next.js Cache → Redis → Database
```

## Production Deployment

### Vercel Deployment (Recommended)

1. **Create Vercel Postgres Database**
```bash
vercel postgres create ratemyaccom-prod
```

2. **Environment Variables**
```bash
# Set via Vercel dashboard or CLI
vercel env add DATABASE_URL production
vercel env add DATABASE_SSL production  # Set to "true"
```

3. **Build Configuration**

```json
// vercel.json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

4. **Deploy**
```bash
vercel --prod
```

### Other Platforms

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
railway add --database postgres
```

#### Render
- Create PostgreSQL database
- Add DATABASE_URL environment variable
- Set build command: `npm install && prisma generate && prisma migrate deploy && npm run build`

### Pre-Deployment Checklist

- [ ] Run production build locally: `npm run build`
- [ ] Test all API endpoints
- [ ] Verify database migrations
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure CORS if needed
- [ ] Set up rate limiting
- [ ] Enable SSL for database connection
- [ ] Review security headers
- [ ] Set up automated backups

## Database Maintenance

### Backup

```bash
# Local backup
pg_dump -U myuser ratemyaccom > backup.sql

# Restore
psql -U myuser ratemyaccom < backup.sql
```

### Migrations

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Deploy to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Monitoring

```bash
# Open Prisma Studio
npx prisma studio
# Visit http://localhost:5555
```

## Performance Optimization

### 1. Database Indexes

Already included in schema:
- University, suburb, state, type
- Rating, price range
- Full-text search on name and description

### 2. Query Optimization

```typescript
// Use select to limit fields
const accommodations = await prisma.accommodation.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    // Only select needed fields
  },
});

// Use cursor-based pagination for large datasets
const accommodations = await prisma.accommodation.findMany({
  take: 10,
  skip: 1,
  cursor: {
    id: lastId,
  },
});
```

### 3. Connection Pooling

Already configured in `lib/database/db.ts`:
- Min connections: 2
- Max connections: 10
- Idle timeout: 30s

## Troubleshooting

### Common Issues

1. **Prisma Client not generated**
```bash
npx prisma generate
```

2. **Migration fails**
```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev
```

3. **Connection errors**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check firewall settings

4. **Type errors**
```bash
# Regenerate types
npx prisma generate
npm run type-check
```

## Next Steps

1. ✅ Set up database (PostgreSQL + Prisma)
2. ✅ Run migrations
3. ✅ Seed with placeholder data
4. ✅ Activate new API routes
5. ⬜ Implement authentication (NextAuth.js)
6. ⬜ Add admin dashboard
7. ⬜ Set up web scrapers
8. ⬜ Implement caching
9. ⬜ Deploy to production
10. ⬜ Set up monitoring

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Playwright Documentation](https://playwright.dev)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues or questions:
1. Check logs: `npx prisma studio`
2. Review import logs in DataImportLog table
3. Check scraping jobs in ScrapingJob table
4. Enable debug logging: `LOG_LEVEL=debug`

---

**Created**: 2025-11-17
**Last Updated**: 2025-11-17
**Version**: 1.0.0
