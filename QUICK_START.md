# Quick Start Guide - Backend Setup

Get your backend up and running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed (or use Docker/Cloud)
- Git repository cloned

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
# Install all dependencies
npm install

# Install additional backend dependencies
npm install prisma @prisma/client tsx --save-dev
npm install @prisma/client
```

### 2. Setup PostgreSQL (5 minutes)

#### Option A: Local PostgreSQL

```bash
# Ubuntu/WSL
sudo apt update && sudo apt install postgresql
sudo service postgresql start

# Create database
sudo -u postgres psql -c "CREATE DATABASE ratemyaccom;"
sudo -u postgres psql -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ratemyaccom TO myuser;"
```

#### Option B: Docker (Recommended)

```bash
docker run --name ratemyaccom-db \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=ratemyaccom \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Option C: Vercel Postgres (Production)

```bash
# Install Vercel CLI
npm i -g vercel

# Create database
vercel postgres create ratemyaccom

# Pull environment variables
vercel env pull .env.local
```

### 3. Configure Environment (1 minute)

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/ratemyaccom"
DATABASE_SSL="false"

# Application
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Run Migrations (2 minutes)

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

Expected output:
```
✔ Generated Prisma Client
✔ Migration created
✔ Applied migration
```

### 5. Seed Database (3 minutes)

```bash
# Run setup script to import placeholder data
npx tsx scripts/setup-database.ts
```

Expected output:
```
Starting database setup...

1. Checking database connection...
   ✓ Database connected successfully

2. Creating common amenities...
   ✓ Created 14 amenities

3. Importing accommodations from placeholder data...
   Import Results:
   ✓ Total: 4
   ✓ Created: 4
   ✓ Skipped: 0
   ✓ Failed: 0

4. Creating test user...
   ✓ Created test user: test@example.com

Database setup completed successfully!
```

### 6. Activate New API Routes (1 minute)

```bash
# Backup old routes
mv app/api/accommodations/route.ts app/api/accommodations/route.old.ts
mv app/api/accommodations/[id]/route.ts app/api/accommodations/[id]/route.old.ts
mv app/api/reviews/route.ts app/api/reviews/route.old.ts

# Activate new database-backed routes
mv app/api/accommodations/route.new.ts app/api/accommodations/route.ts
mv app/api/accommodations/[id]/route.new.ts app/api/accommodations/[id]/route.ts
mv app/api/reviews/route.new.ts app/api/reviews/route.ts
```

### 7. Start Development Server (1 minute)

```bash
npm run dev
```

### 8. Test Your Backend

Open your browser or use curl:

```bash
# Get all accommodations
curl http://localhost:3000/api/accommodations

# Get single accommodation
curl http://localhost:3000/api/accommodations/unsw-village

# Search with filters
curl "http://localhost:3000/api/accommodations?university=UNSW&priceMax=500"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "UNSW Village",
      "university": "University of New South Wales (UNSW)",
      "ratings": {
        "overall": 4.3,
        "totalReviews": 127
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 4,
    "totalPages": 1
  }
}
```

## Verify Installation

### Check Database

```bash
# Open Prisma Studio
npx prisma studio
```

Visit http://localhost:5555 to browse your data.

### Run Tests

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

## Common Issues

### Issue: "Can't connect to database"

**Solution**:
```bash
# Check PostgreSQL is running
sudo service postgresql status  # Linux
brew services list              # Mac

# Test connection
psql -U myuser -d ratemyaccom -h localhost
```

### Issue: "Prisma Client not generated"

**Solution**:
```bash
npx prisma generate
```

### Issue: "Migration failed"

**Solution**:
```bash
# Reset database and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Issue: Type errors in API routes

**Solution**:
```bash
# Regenerate Prisma types
npx prisma generate

# Restart TypeScript server in VSCode
Cmd+Shift+P > "TypeScript: Restart TS Server"
```

## Next Steps

Now that your backend is running:

1. ✅ Test API endpoints in browser
2. ✅ Explore data in Prisma Studio
3. ⬜ Customize database schema if needed
4. ⬜ Set up authentication (NextAuth.js)
5. ⬜ Configure web scrapers
6. ⬜ Deploy to production

## Useful Commands

```bash
# Database
npx prisma studio              # Visual database browser
npx prisma migrate dev         # Create and apply migration
npx prisma migrate reset       # Reset database (WARNING: deletes data)
npx prisma db push            # Push schema changes (dev only)

# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run type-check            # Check TypeScript

# Scraping
npx tsx scripts/run-scraper.ts university

# Database Seeding
npx tsx scripts/setup-database.ts
```

## Architecture Overview

```
Your App
    ├── Frontend (Next.js pages)
    ├── API Routes
    │   ├── /api/accommodations
    │   ├── /api/accommodations/[id]
    │   └── /api/reviews
    ├── Repositories (Data access layer)
    │   ├── accommodation.repository.ts
    │   └── review.repository.ts
    ├── Prisma (ORM)
    └── PostgreSQL (Database)
```

## File Locations

All new backend files are in:

```
/home/melvin/ratemyaccom/
├── prisma/
│   └── schema.prisma
├── lib/
│   ├── database/
│   │   ├── prisma.ts
│   │   └── repositories/
│   ├── scraping/
│   │   ├── base-scraper.ts
│   │   ├── logger.ts
│   │   └── scrapers/
│   └── import/
│       └── accommodation-importer.ts
├── app/api/
│   ├── accommodations/route.ts (updated)
│   ├── accommodations/[id]/route.ts (updated)
│   └── reviews/route.ts (updated)
└── scripts/
    ├── setup-database.ts
    └── run-scraper.ts
```

## Support

- Documentation: See `BACKEND_IMPLEMENTATION_GUIDE.md`
- Architecture: See `BACKEND_ARCHITECTURE.md`
- Prisma Docs: https://www.prisma.io/docs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

Total setup time: ~15 minutes

If you run into issues, check the troubleshooting section or refer to the full implementation guide.
