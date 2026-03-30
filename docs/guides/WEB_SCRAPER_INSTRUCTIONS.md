# Web Scraper Instructions for RateMyAccom

## 📋 Overview

This document provides comprehensive instructions for building web scrapers to collect accommodation data for the RateMyAccom platform. The goal is to gather accurate, up-to-date information about student accommodations across Australian universities.

## 🎯 Scraping Objectives

### Primary Goal
Collect comprehensive accommodation data including:
- Accommodation name and location
- Pricing information
- Amenities and facilities
- Room types available
- Contact information
- Images (URLs)
- University affiliation

### Data Quality Requirements
- **Accuracy**: All data must be current and verified
- **Completeness**: Aim for 80%+ field completion
- **Uniqueness**: Avoid duplicates (check by name + address)
- **Ethics**: Respect robots.txt and rate limits

## 🏗️ Database Schema Reference

### Accommodation Model
```typescript
{
  // Identity
  name: string                    // Required
  slug: string                    // Auto-generated from name
  university: string              // Required

  // Location
  address: string                 // Required
  suburb: string                  // Required
  state: string                   // Required (NSW, VIC, QLD, etc.)
  postcode: string                // Required
  latitude?: number               // Optional but recommended
  longitude?: number              // Optional but recommended

  // Details
  description: string             // Required (min 50 chars)
  type: AccommodationType         // Required: ON_CAMPUS | OFF_CAMPUS | PRIVATE | COLLEGE
  capacity: number                // Required (total beds)

  // Pricing
  priceMin: number                // Required (in AUD)
  priceMax: number                // Required (in AUD)
  currency: string                // Default: "AUD"
  pricePeriod: PricePeriod        // Required: WEEK | MONTH | SEMESTER | YEAR

  // Room Types
  roomTypes: string[]             // e.g., ["Single", "Studio", "Twin Share"]

  // Contact
  contactInfo: {
    phone?: string
    email?: string
    website?: string              // Recommended
  }

  // Amenities
  amenities: string[]             // Array of amenity names (see list below)

  // Images
  images: string[]                // Array of image URLs

  // Distance
  distanceToCampus?: number       // In kilometers
  distanceToTransport?: number    // In kilometers

  // Source Tracking
  sourceUrl: string               // Required: Original listing URL
  sourceType: string              // "scraper"
}
```

### Standard Amenities List
Use these exact names for consistency:
```
- WiFi
- Gym
- Study Rooms
- Laundry
- Common Kitchen
- Parking
- Security
- Social Events
- Cinema Room
- Rooftop Terrace
- Meal Plans
- Music Rooms
- Games Room
- Bike Storage
- Swimming Pool
- BBQ Area
- 24/7 Reception
- Cleaning Service
- Air Conditioning
- Heating
```

## 🎯 Target Data Sources

### Priority Tier 1: University Websites (On-Campus)

#### UNSW Sydney
- **URL**: https://www.unsw.edu.au/life-at-unsw/campus-living
- **Target**: UNSW Village, Colombo House, Goldstein Hall, etc.
- **Data Available**: Name, pricing, amenities, room types, contact info
- **Notes**: Well-structured pages, good image quality

#### University of Sydney
- **URL**: https://www.sydney.edu.au/campus-life/accommodation.html
- **Target**: Queen Mary Building, Abercrombie, Regiment, etc.
- **Data Available**: Full accommodation details
- **Notes**: May require multiple page visits per accommodation

#### Macquarie University
- **URL**: https://www.mq.edu.au/study/admissions/student-life/accommodation
- **Target**: Macquarie University Village, Dunmore Lang College
- **Data Available**: Comprehensive details
- **Notes**: Clear pricing tables

#### UTS Sydney
- **URL**: https://www.uts.edu.au/current-students/support/housing
- **Target**: UTS Housing partnerships
- **Data Available**: Links to partner accommodations

#### University of Queensland
- **URL**: https://my.uq.edu.au/student-support/accommodation
- **Target**: Multiple colleges and halls
- **Data Available**: Full details per accommodation

#### Monash University
- **URL**: https://www.monash.edu/accommodation
- **Target**: Campus accommodations across multiple campuses
- **Data Available**: Comprehensive

### Priority Tier 2: Major Housing Providers (Off-Campus)

#### UniLodge
- **URL**: https://www.unilodge.com.au
- **Locations**: Multiple cities (Sydney, Melbourne, Brisbane, etc.)
- **Target Pages**: Individual property pages
- **Selectors Strategy**:
  - Property name: `h1.property-name` or similar
  - Price: `.price-from`, `.weekly-price`
  - Amenities: `.amenity-list li`, `.facilities-list`
  - Location: `.address`, `.location-info`
- **Notes**:
  - JavaScript-rendered content (use Playwright)
  - Multiple room types per property
  - Price usually shown as "from $XXX/week"

#### Urbanest
- **URL**: https://www.urbanest.com.au
- **Locations**: Sydney, Melbourne, Adelaide, Brisbane
- **Target**: Property detail pages
- **Selectors Strategy**:
  - Property cards: `.property-card`
  - Amenities: `.amenity-icon` with title/alt text
  - Room types: `.room-type-card`
- **Notes**: Modern React app, wait for content to load

#### Scape
- **URL**: https://www.scape.com
- **Locations**: Major cities
- **Target**: Building pages
- **Notes**: High-quality images, detailed amenity lists

#### Student One
- **URL**: https://studentone.com
- **Locations**: Sydney, Melbourne, Brisbane, Adelaide
- **Target**: Property pages
- **Notes**: Clear pricing, room type breakdowns

### Priority Tier 3: Listing Platforms

#### StudentVIP
- **URL**: https://studentvip.com.au/accommodation
- **Target**: Accommodation listings near universities
- **Data Available**: Variable quality, user-submitted
- **Notes**:
  - May contain both professional and private listings
  - Filter for "purpose-built student accommodation"
  - Verify data quality before import

#### Flatmates.com.au
- **URL**: https://flatmates.com.au
- **Target**: Student-focused listings near universities
- **Notes**: Mostly private rentals, lower priority

## 🛠️ Technical Implementation

### Technology Stack
- **Scraping**: Playwright (recommended) or Puppeteer
- **Validation**: Zod schemas
- **Database**: Prisma ORM
- **Language**: TypeScript

### Basic Scraper Structure

```typescript
import { chromium } from 'playwright';
import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';

// Validation schema
const AccommodationSchema = z.object({
  name: z.string().min(3),
  university: z.string().min(3),
  address: z.string().min(5),
  suburb: z.string().min(2),
  state: z.string().length(3), // NSW, VIC, etc.
  postcode: z.string().length(4),
  description: z.string().min(50),
  type: z.enum(['ON_CAMPUS', 'OFF_CAMPUS', 'PRIVATE', 'COLLEGE']),
  priceMin: z.number().positive(),
  priceMax: z.number().positive(),
  pricePeriod: z.enum(['WEEK', 'MONTH', 'SEMESTER', 'YEAR']),
  capacity: z.number().int().positive(),
  roomTypes: z.array(z.string()),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }),
  images: z.array(z.string().url()),
  amenities: z.array(z.string()),
  sourceUrl: z.string().url(),
});

async function scrapeAccommodations(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Example: Extract accommodation cards
    const accommodations = await page.$$eval('.accommodation-card', cards => {
      return cards.map(card => ({
        name: card.querySelector('h2')?.textContent?.trim(),
        // ... extract other fields
      }));
    });

    // Validate and import each accommodation
    for (const data of accommodations) {
      try {
        const validated = AccommodationSchema.parse(data);

        // Check for duplicates
        const existing = await prisma.accommodation.findFirst({
          where: {
            name: validated.name,
            address: validated.address,
          },
        });

        if (!existing) {
          await prisma.accommodation.create({
            data: {
              ...validated,
              slug: generateSlug(validated.name),
              sourceType: 'scraper',
            },
          });
          console.log(`✅ Imported: ${validated.name}`);
        } else {
          console.log(`⏭️  Skipped duplicate: ${validated.name}`);
        }
      } catch (error) {
        console.error(`❌ Validation failed:`, error);
      }
    }
  } finally {
    await browser.close();
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

### Rate Limiting & Ethics

```typescript
// Add delays between requests
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Respect robots.txt
import robotsParser from 'robots-parser';

async function canScrape(url: string, userAgent: string): Promise<boolean> {
  const robotsUrl = new URL('/robots.txt', url).toString();
  const response = await fetch(robotsUrl);
  const robotsTxt = await response.text();
  const robots = robotsParser(robotsUrl, robotsTxt);
  return robots.isAllowed(url, userAgent);
}

// Usage
const userAgent = 'RateMyAccomBot/1.0 (+https://ratemyaccom.com/bot)';
if (await canScrape(targetUrl, userAgent)) {
  await delay(2000); // 2 second delay between requests
  // ... scrape
}
```

### Error Handling & Logging

```typescript
async function scrapeWithLogging(source: string, scrapeFunction: () => Promise<void>) {
  // Create scraping job
  const job = await prisma.scrapingJob.create({
    data: {
      source,
      status: 'RUNNING',
      config: { url: source },
      startedAt: new Date(),
    },
  });

  try {
    await scrapeFunction();

    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        errors: { message: error.message },
        completedAt: new Date(),
      },
    });
    throw error;
  }
}
```

## 📊 Data Quality Checklist

Before importing scraped data, verify:

- [ ] **Required Fields**: name, university, address, suburb, state, postcode, description, type, pricing, room types
- [ ] **Valid Data Types**: Numbers for prices, arrays for room types
- [ ] **State Codes**: Use 3-letter codes (NSW, VIC, QLD, SA, WA, TAS, ACT, NT)
- [ ] **Price Period**: Standardize to WEEK when possible
- [ ] **Amenities**: Use standard names from the list above
- [ ] **URLs**: All image and contact URLs are valid
- [ ] **Duplicates**: Check name + address combination
- [ ] **Description**: At least 50 characters, meaningful content
- [ ] **Source URL**: Include original listing URL

## 🔄 Import Workflow

```
1. START SCRAPING JOB
   ├─ Create ScrapingJob record (status: RUNNING)
   └─ Set source and config

2. FOR EACH PAGE/LISTING
   ├─ Extract data using selectors
   ├─ Validate with Zod schema
   ├─ Check for duplicates
   │  └─ If exists: Log as DUPLICATE, skip
   └─ If new:
      ├─ Transform data (generate slug, normalize)
      ├─ Import to database
      ├─ Create DataImportLog (status: SUCCESS)
      └─ Link amenities (many-to-many)

3. HANDLE ERRORS
   ├─ Log to DataImportLog (status: FAILED)
   ├─ Store raw data for debugging
   └─ Continue with next item

4. COMPLETE JOB
   ├─ Update ScrapingJob (status: COMPLETED)
   └─ Log summary stats
```

## 🎨 Handling Images

### Image Scraping Strategy
1. Extract all image URLs from property pages
2. Prefer high-resolution images (min 800px width)
3. Store URLs only (don't download images)
4. Filter out:
   - Icons and logos
   - Thumbnails
   - Non-accommodation images (maps, logos)

### Image URL Validation
```typescript
function isValidAccommodationImage(url: string): boolean {
  // Check file extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExt = validExtensions.some(ext => url.toLowerCase().endsWith(ext));

  // Exclude common non-accommodation images
  const excludePatterns = ['logo', 'icon', 'thumbnail', 'avatar'];
  const hasExcludedPattern = excludePatterns.some(pattern =>
    url.toLowerCase().includes(pattern)
  );

  return hasValidExt && !hasExcludedPattern;
}
```

## 🧪 Testing Your Scraper

### Test Checklist
1. **Small Batch Test**: Start with 3-5 properties
2. **Validate Output**: Check all required fields are populated
3. **Check Duplicates**: Run twice, ensure no duplicates created
4. **Error Handling**: Test with invalid URLs, missing data
5. **Rate Limiting**: Verify delays are working
6. **Database Cleanup**: Test on dev database first

### Example Test Script
```typescript
// test-scraper.ts
async function testScraper() {
  console.log('🧪 Starting scraper test...');

  // Test with one property
  const testUrl = 'https://www.unilodge.com.au/sydney/unsw-village';

  try {
    await scrapeAccommodation(testUrl);
    console.log('✅ Test passed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  // Verify in database
  const imported = await prisma.accommodation.findFirst({
    where: { sourceUrl: testUrl },
    include: { amenities: true },
  });

  console.log('📊 Imported data:', imported);
}
```

## 🚀 Running the Scraper

### Setup
```bash
# 1. Ensure database is running
docker ps | grep ratemyaccom-db

# 2. Run migrations if needed
npx prisma migrate dev

# 3. Check database connection
npx tsx -e "import {prisma} from './lib/database/prisma'; prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ DB Connected'))"
```

### Execute Scraping
```bash
# Run specific scraper
npx tsx lib/scraping/scrapers/unilodge-scraper.ts

# Run all scrapers
npx tsx lib/scraping/run-all-scrapers.ts

# View logs
npx prisma studio  # Open Prisma Studio
# Navigate to ScrapingJob and DataImportLog tables
```

## 📈 Success Metrics

Track these metrics for each scraping job:

- **Items Found**: Total properties discovered
- **Items Imported**: Successfully added to database
- **Items Skipped**: Duplicates
- **Items Failed**: Validation or import errors
- **Success Rate**: (Imported / Found) × 100%
- **Completion Time**: Job duration

Target: >80% success rate for production scrapers

## 🐛 Common Issues & Solutions

### Issue: JavaScript Content Not Loading
**Solution**: Use Playwright with `waitUntil: 'networkidle'` and explicit waits
```typescript
await page.waitForSelector('.accommodation-card', { timeout: 10000 });
```

### Issue: Duplicate Imports
**Solution**: Always check for existing records before creating
```typescript
const existing = await prisma.accommodation.findFirst({
  where: {
    OR: [
      { slug: generatedSlug },
      { AND: [{ name: data.name }, { address: data.address }] }
    ]
  }
});
```

### Issue: Incomplete Data
**Solution**: Make fields optional, import partial data, flag for manual review
```typescript
const partialData = {
  ...validatedData,
  verified: false, // Mark as unverified if incomplete
  active: data.description.length > 50, // Only activate if description is good
};
```

### Issue: Rate Limiting / IP Blocking
**Solution**: Add delays, rotate user agents, respect robots.txt
```typescript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
];
const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
await page.setUserAgent(randomUA);
```

## 📝 Scraper Development Checklist

When creating a new scraper:

- [ ] Create new file in `lib/scraping/scrapers/[source]-scraper.ts`
- [ ] Extend `BaseScraper` class (if available)
- [ ] Define Zod validation schema for the source
- [ ] Implement data extraction logic
- [ ] Add duplicate checking
- [ ] Implement error handling and logging
- [ ] Test with 3-5 properties
- [ ] Document any source-specific quirks
- [ ] Add to master scraper list
- [ ] Update this document with new source details

## 🎓 Next Steps for Web Scraper Agent

1. **Choose a Source**: Start with Priority Tier 1 (university websites)
2. **Inspect the Website**: Use browser DevTools to identify selectors
3. **Create Scraper File**: Use the template structure above
4. **Test Small Batch**: Scrape 3-5 properties first
5. **Validate Data**: Ensure all required fields are populated
6. **Run Full Scrape**: Process all available properties
7. **Verify Import**: Check database using Prisma Studio
8. **Document Results**: Log success rate and any issues
9. **Move to Next Source**: Repeat for other sources

## 📞 Support

For questions about:
- Database schema: See `prisma/schema.prisma`
- Type definitions: See `types/index.ts`
- Existing data: Run `npx prisma studio`
- Scraping jobs: Query `ScrapingJob` and `DataImportLog` models

---

**Good luck scraping! 🕷️ Collect quality data responsibly and ethically.**
