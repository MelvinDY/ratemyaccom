# RateMyAccom Web Scraper - Quick Start Guide

## What You Have Now

A fully functional web scraping system that collects student accommodation data from:
- **UNSW Sydney** (on-campus accommodations)
- **University of Sydney** (colleges and residences)
- **UniLodge** (off-campus housing provider)

**Current Database**: 17 accommodations across 5 universities

## Quick Commands

### Run All Scrapers
```bash
npx tsx scripts/run-scraper.ts all
```

### Run Individual Scrapers
```bash
npx tsx scripts/run-scraper.ts unsw      # UNSW only
npx tsx scripts/run-scraper.ts usyd      # USYD only
npx tsx scripts/run-scraper.ts unilodge  # UniLodge only
```

### Generate Report
```bash
npx tsx scripts/generate-report.ts
```

### View Data (Prisma Studio)
```bash
npx prisma studio
# Opens in browser at http://localhost:5555
```

## File Structure

```
lib/scraping/
├── utils/
│   ├── validation.ts       ← Zod schemas, amenity mapping
│   └── helpers.ts          ← Text parsing, price extraction, etc.
├── scrapers/
│   ├── unsw-scraper.ts     ← UNSW accommodation scraper
│   ├── usyd-scraper.ts     ← USYD accommodation scraper
│   └── unilodge-scraper.ts ← UniLodge scraper
├── base-scraper.ts         ← Base class (already existed)
└── logger.ts               ← Logging utility (already existed)

scripts/
├── run-scraper.ts          ← Main CLI runner (updated)
└── generate-report.ts      ← Report generator (new)
```

## How to Add a New Scraper

### Step 1: Create Scraper File
```typescript
// lib/scraping/scrapers/youruni-scraper.ts
import { chromium, Page } from 'playwright';
import { BaseScraper, ScrapedAccommodation, ScraperConfig } from '../base-scraper';
import { prisma } from '@/lib/database/prisma';
import { logger } from '../logger';
import { validateAccommodationData } from '../utils/validation';
import * as helpers from '../utils/helpers';

export class YourUniScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'youruni-accommodation',
      baseUrl: 'https://youruni.edu.au',
      rateLimit: 2000,
      maxRetries: 3,
      timeout: 30000,
    };
    super(config);
  }

  protected async scrape() {
    // Your scraping logic here
    // See unsw-scraper.ts for example
  }

  protected async extractAccommodationData(page: Page) {
    // Extract data from page
    // See helpers.ts for utility functions
  }
}
```

### Step 2: Add to run-scraper.ts
```typescript
import { YourUniScraper } from '../lib/scraping/scrapers/youruni-scraper';

// In the switch statement:
case 'youruni':
  scraper = new YourUniScraper();
  scraperDisplayName = 'Your University';
  break;
```

### Step 3: Test It
```bash
npx tsx scripts/run-scraper.ts youruni
```

## Available Helper Functions

### Text Extraction
```typescript
import { extractText, extractTextMultiple, extractAllText } from '../utils/helpers';

// Single selector
const name = await extractText(page, 'h1');

// Multiple selectors (first found)
const name = await extractTextMultiple(page, ['h1', '.title', '.name']);

// All matching elements
const amenities = await extractAllText(page, '.amenity-list li');
```

### Price Extraction
```typescript
import { extractPrice, extractPriceRange } from '../utils/helpers';

// Single price
const price = extractPrice('from $350/week'); // 350

// Price range
const range = extractPriceRange('$300 - $500 per week');
// { min: 300, max: 500 }
```

### Address Parsing
```typescript
import { parseAustralianAddress } from '../utils/helpers';

const address = parseAustralianAddress('123 Street, Suburb NSW 2000');
// { street: '123 Street', suburb: 'Suburb', state: 'NSW', postcode: '2000' }
```

### Contact Extraction
```typescript
import { extractEmail, extractPhone } from '../utils/helpers';

const email = extractEmail('Contact us at info@uni.edu.au');
// 'info@uni.edu.au'

const phone = extractPhone('Call 02 1234 5678 or 1300 123 456');
// '02 1234 5678'
```

### Validation
```typescript
import { validateAccommodationData, validateAmenities } from '../utils/validation';

// Validate full accommodation
const result = validateAccommodationData(data);
if (result.success) {
  // Import to database
  await importAccommodation(result.data);
} else {
  // Log errors
  console.error(result.errors);
}

// Normalize amenities
const amenities = validateAmenities(['wifi', 'Gym', 'study room']);
// ['WiFi', 'Gym', 'Study Rooms']
```

## Database Schema Reference

### Accommodation Model
```typescript
{
  // Required
  name: string
  slug: string              // Auto-generated
  university: string
  address: string
  suburb: string
  state: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'ACT' | 'NT'
  postcode: string          // 4 digits
  description: string       // Min 50 chars
  type: 'ON_CAMPUS' | 'OFF_CAMPUS' | 'PRIVATE' | 'COLLEGE'
  priceMin: number
  priceMax: number
  pricePeriod: 'WEEK' | 'MONTH' | 'SEMESTER' | 'YEAR'
  capacity: number
  roomTypes: string[]
  sourceUrl: string

  // Optional
  latitude?: number
  longitude?: number
  distanceToCampus?: number
  distanceToTransport?: number
  images: string[]          // Array of URLs
  contactInfo: {
    phone?: string
    email?: string
    website?: string
  }
}
```

### Standard Amenities
```
WiFi, Gym, Study Rooms, Laundry, Common Kitchen,
Parking, Security, Social Events, Cinema Room,
Rooftop Terrace, Meal Plans, Music Rooms, Games Room,
Bike Storage, Swimming Pool, BBQ Area, 24/7 Reception,
Cleaning Service, Air Conditioning, Heating
```

## Scraping Best Practices

### 1. Rate Limiting
```typescript
await delay(2000); // 2 second delay between requests
```

### 2. Error Handling
```typescript
try {
  const data = await extractData(page);
} catch (error) {
  logger.error('Extraction failed:', error);
  return null;
}
```

### 3. Duplicate Detection
```typescript
const existing = await prisma.accommodation.findFirst({
  where: {
    OR: [
      { slug: generatedSlug },
      {
        AND: [
          { name: { equals: data.name, mode: 'insensitive' } },
          { address: { equals: data.address, mode: 'insensitive' } }
        ]
      }
    ]
  }
});
```

### 4. Logging
```typescript
await this.logImport('CREATE', 'SUCCESS', rawData, processedData, undefined, id);
```

## Troubleshooting

### "Database connection failed"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Or check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### "Playwright browser not installed"
```bash
npx playwright install chromium
```

### "Validation errors"
Check the error messages - they tell you exactly what's wrong:
- Missing required fields
- Invalid format (e.g., postcode must be 4 digits)
- Description too short (min 50 chars)

### "Duplicate" errors
This is normal! The scraper automatically skips duplicates to avoid importing the same accommodation twice.

## Monitoring Scraping Jobs

### View Recent Jobs
```bash
npx tsx -e "import {prisma} from './lib/database/prisma'; \
prisma.scrapingJob.findMany({ \
  orderBy: { createdAt: 'desc' }, \
  take: 5 \
}).then(jobs => console.log(jobs))"
```

### View Import Logs
```bash
npx tsx -e "import {prisma} from './lib/database/prisma'; \
prisma.dataImportLog.findMany({ \
  where: { status: 'FAILED' }, \
  orderBy: { createdAt: 'desc' }, \
  take: 10 \
}).then(logs => console.log(logs))"
```

### Count Accommodations
```bash
npx tsx -e "import {prisma} from './lib/database/prisma'; \
prisma.accommodation.count().then(c => console.log(\`Total: \${c}\`))"
```

## Next Steps

### Expand Coverage
1. Add more university scrapers (UTS, Macquarie, UQ, Monash)
2. Add housing provider scrapers (Urbanest, Scape, Student One)
3. Add listing platform scrapers (StudentVIP, Flatmates.com.au)

### Enhance Data
1. Add image downloading and storage
2. Implement geocoding for latitude/longitude
3. Calculate distances to campus/transport
4. Scrape reviews and ratings

### Automation
1. Set up cron jobs for regular scraping
2. Add change detection (price/availability updates)
3. Send email notifications on failures
4. Create monitoring dashboard

## Support Resources

- **Scraping Guide**: `/home/melvin/ratemyaccom/WEB_SCRAPER_INSTRUCTIONS.md`
- **Implementation Summary**: `/home/melvin/ratemyaccom/SCRAPER_IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: `/home/melvin/ratemyaccom/prisma/schema.prisma`
- **Prisma Docs**: https://www.prisma.io/docs
- **Playwright Docs**: https://playwright.dev/docs/intro

## Example: Full Scraping Workflow

```bash
# 1. Check database connection
npx tsx -e "import {prisma} from './lib/database/prisma'; \
prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ Connected'))"

# 2. Run scrapers
npx tsx scripts/run-scraper.ts all

# 3. Generate report
npx tsx scripts/generate-report.ts

# 4. View in Prisma Studio
npx prisma studio

# 5. Check the data
npx tsx -e "import {prisma} from './lib/database/prisma'; \
prisma.accommodation.count().then(c => console.log(\`Accommodations: \${c}\`))"
```

## Success!

You now have a working web scraping system that:
- ✅ Scrapes accommodation data from multiple sources
- ✅ Validates all data before importing
- ✅ Prevents duplicates
- ✅ Logs all operations
- ✅ Provides detailed reports
- ✅ Follows ethical scraping practices

Happy scraping!
