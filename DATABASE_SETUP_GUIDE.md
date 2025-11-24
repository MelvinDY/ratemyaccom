# Database Setup Guide - RateMyAccom

Complete guide to setting up PostgreSQL database and running your first migrations.

## 🎯 Overview

This guide will walk you through:
1. Installing PostgreSQL (multiple options)
2. Configuring your database connection
3. Running Prisma migrations
4. Seeding initial data
5. Verifying everything works

**Estimated Time**: 15-30 minutes

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Docker Desktop (recommended) OR PostgreSQL 15+ installed locally

---

## 🐳 Option 1: PostgreSQL with Docker (Recommended)

### Why Docker?
- ✅ Easiest setup
- ✅ No conflicts with system PostgreSQL
- ✅ Easy to reset/rebuild
- ✅ Portable across environments

### Step 1: Install Docker Desktop

**macOS**:
```bash
brew install --cask docker
# OR download from https://www.docker.com/products/docker-desktop
```

**Windows**:
- Download Docker Desktop from https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop

**Linux**:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
```

### Step 2: Start PostgreSQL Container

```bash
# Create and start PostgreSQL container
docker run --name ratemyaccom-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ratemyaccom \
  -p 5432:5432 \
  -d postgres:15-alpine

# Verify it's running
docker ps | grep ratemyaccom-db
```

### Step 3: Configure Database URL

Your `.env.local` file should have:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ratemyaccom?schema=public"
```

This is already set up in your project!

### Useful Docker Commands

```bash
# Stop the database
docker stop ratemyaccom-db

# Start the database
docker start ratemyaccom-db

# View logs
docker logs ratemyaccom-db

# Connect to database CLI
docker exec -it ratemyaccom-db psql -U postgres -d ratemyaccom

# Remove container (if you want to start fresh)
docker rm -f ratemyaccom-db
```

---

## 💻 Option 2: Local PostgreSQL Installation

### macOS (Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb ratemyaccom

# Set password (optional)
psql postgres
# In psql:
# ALTER USER postgres WITH PASSWORD 'password';
# \q
```

**Database URL**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ratemyaccom?schema=public"
```

### Windows

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run installer, set password for postgres user
3. Use pgAdmin to create database `ratemyaccom`

**Database URL**:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ratemyaccom?schema=public"
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user and database
sudo -u postgres psql
# In psql:
# CREATE DATABASE ratemyaccom;
# CREATE USER postgres WITH PASSWORD 'password';
# GRANT ALL PRIVILEGES ON DATABASE ratemyaccom TO postgres;
# \q
```

**Database URL**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ratemyaccom?schema=public"
```

---

## ☁️ Option 3: Cloud PostgreSQL (Production)

### Vercel Postgres

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create Postgres database
vercel postgres create

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local
```

Your `DATABASE_URL` will be automatically added to `.env.local`.

### Railway

1. Visit https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from Variables tab

**Database URL Example**:
```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
```

### Supabase

1. Visit https://supabase.com
2. Create new project
3. Go to Project Settings > Database
4. Copy connection string (URI mode)

**Database URL Example**:
```env
DATABASE_URL="postgresql://postgres:password@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

---

## 🔧 Running Migrations

Once your database is running and configured, run migrations:

### Step 1: Generate Prisma Client

```bash
npx prisma generate
```

You should see:
```
✔ Generated Prisma Client (v6.19.0)
```

### Step 2: Create Database Tables

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables defined in `prisma/schema.prisma`
- Apply indexes
- Set up relationships
- Generate a migration file

Expected output:
```
✔ Migration created successfully
✔ Applied migration: 20241117_init
```

### Step 3: Verify Migration

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can:
- View all tables
- See the schema
- Browse data (currently empty)

---

## 🌱 Seeding the Database

### Run the Seed Script

```bash
npx tsx prisma/seed/seed.ts
```

Expected output:
```
🌱 Starting database seed...
🏢 Creating amenities...
✅ Created 20 amenities
👥 Creating sample users...
✅ Created 3 users
🏠 Creating sample accommodations...
✅ Created 3 sample accommodations
📝 Creating sample reviews...
✅ Created 2 sample reviews

✨ Database seeding completed successfully!

📊 Summary:
  - 20 amenities
  - 3 users
  - 3 accommodations
  - 2 reviews
```

### Verify Seeded Data

```bash
npx prisma studio
```

Navigate to:
- **accommodations** table → Should see 3 records (UNSW Village, UniLodge Broadway, MQ Village)
- **amenities** table → Should see 20 records
- **users** table → Should see 3 records
- **reviews** table → Should see 2 records

---

## ✅ Testing Database Connection

### Option 1: Quick Test

```bash
npx tsx -e "import {prisma} from './lib/database/prisma'; prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ Database Connected!')).catch(e => console.error('❌ Connection failed:', e))"
```

### Option 2: Comprehensive Test

Create `test-db.ts`:

```typescript
import { prisma } from './lib/database/prisma';

async function testDatabase() {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Test queries
    const accommodationCount = await prisma.accommodation.count();
    console.log(`📊 Accommodations: ${accommodationCount}`);

    const amenityCount = await prisma.amenity.count();
    console.log(`🏢 Amenities: ${amenityCount}`);

    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);

    const reviewCount = await prisma.review.count();
    console.log(`📝 Reviews: ${reviewCount}`);

    // Test complex query
    const featured = await prisma.accommodation.findMany({
      where: { featured: true },
      include: {
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });
    console.log(`⭐ Featured accommodations: ${featured.length}`);

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
```

Run it:
```bash
npx tsx test-db.ts
```

---

## 🔄 Common Migration Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name add_new_field

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Create migration without applying (for review)
npx prisma migrate dev --create-only

# Format schema file
npx prisma format
```

---

## 🚨 Troubleshooting

### Connection Refused Error

**Error**: `Can't reach database server at localhost:5432`

**Solutions**:
1. Check if PostgreSQL is running:
   ```bash
   # Docker
   docker ps | grep postgres

   # macOS
   brew services list | grep postgresql

   # Linux
   sudo systemctl status postgresql
   ```

2. Check if port 5432 is in use:
   ```bash
   lsof -i :5432
   # OR
   netstat -an | grep 5432
   ```

3. Verify DATABASE_URL in `.env.local`:
   ```bash
   cat .env.local | grep DATABASE_URL
   ```

### Authentication Failed

**Error**: `Authentication failed for user "postgres"`

**Solutions**:
1. Check password in DATABASE_URL matches your PostgreSQL setup
2. Docker: Password is what you set with `-e POSTGRES_PASSWORD=password`
3. Local: May need to reset password:
   ```bash
   # macOS/Linux
   psql postgres
   ALTER USER postgres WITH PASSWORD 'password';
   ```

### Database Does Not Exist

**Error**: `database "ratemyaccom" does not exist`

**Solutions**:
```bash
# Docker (recreate container)
docker rm -f ratemyaccom-db
docker run --name ratemyaccom-db -e POSTGRES_DB=ratemyaccom -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine

# Local PostgreSQL
createdb ratemyaccom
# OR
psql postgres
CREATE DATABASE ratemyaccom;
```

### Migration Failed

**Error**: `Migration failed to apply`

**Solutions**:
1. Reset and reapply:
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```

2. Check for manual database changes that conflict
3. Delete `prisma/migrations` folder and recreate:
   ```bash
   rm -rf prisma/migrations
   npx prisma migrate dev --name init
   ```

### Port Already in Use

**Error**: `Port 5432 already in use`

**Solutions**:
1. Stop existing PostgreSQL:
   ```bash
   # Find process
   lsof -i :5432

   # Stop service
   brew services stop postgresql  # macOS
   sudo systemctl stop postgresql  # Linux
   ```

2. Use different port for Docker:
   ```bash
   docker run --name ratemyaccom-db -p 5433:5432 ...
   # Update DATABASE_URL to use port 5433
   ```

---

## 🎯 Next Steps

After setting up your database:

1. ✅ **Test API Routes**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/accommodations
   ```

2. ✅ **Start Web Scraping**
   - Read `WEB_SCRAPER_INSTRUCTIONS.md`
   - Implement scrapers for target websites
   - Import real accommodation data

3. ✅ **Build Frontend Features**
   - Connect browse page to API
   - Add search/filter functionality
   - Display accommodation details

4. ✅ **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Set up production database

---

## 📚 Resources

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Docker Postgres: https://hub.docker.com/_/postgres
- Prisma Studio: Run `npx prisma studio`

---

## 🎉 Success Checklist

- [ ] PostgreSQL is running (Docker or local)
- [ ] `.env.local` has correct `DATABASE_URL`
- [ ] Migrations applied successfully
- [ ] Database seeded with sample data
- [ ] Prisma Studio shows data
- [ ] Test connection successful
- [ ] API routes return data

If all checked, you're ready to build! 🚀
