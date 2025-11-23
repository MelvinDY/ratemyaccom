# Backend Architecture - RateMyAccom

Complete backend architecture specification for the accommodation rating platform.

## Executive Summary

This document outlines a production-ready backend architecture using:
- **PostgreSQL** for reliable relational data storage
- **Prisma** for type-safe database access
- **Playwright** for web scraping
- **Repository Pattern** for clean architecture
- **Validation & Error Handling** at all layers

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /accommod... │  │   /reviews   │  │    /auth     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                  │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Validation & Sanitization (Zod)               │   │
│  └──────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────┼──────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Repository Layer                              │
│  ┌───────────────────┐  ┌───────────────────┐                  │
│  │ Accommodation     │  │   Review          │                  │
│  │ Repository        │  │   Repository      │                  │
│  └─────────┬─────────┘  └─────────┬─────────┘                  │
│            │                       │                             │
│            └───────────┬───────────┘                            │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Prisma ORM                                  │   │
│  └──────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────┼──────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Users   │  │  Accomm  │  │ Reviews  │  │ Amenities│        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────────┐
        │         Scraping Pipeline                    │
        │  ┌─────────────┐  ┌─────────────┐           │
        │  │  Playwright │  │  Data       │           │
        │  │  Scrapers   │──│  Importer   │           │
        │  └─────────────┘  └─────────────┘           │
        └─────────────────────────────────────────────┘
```

## Technology Decisions & Justifications

### 1. Database: PostgreSQL

**Decision**: PostgreSQL 15+ (vs MongoDB, MySQL, Supabase)

**Justifications**:

✅ **Relational Data Model**: Perfect for:
- Complex relationships (users → reviews → accommodations)
- Foreign key constraints for data integrity
- ACID transactions for review creation + rating updates

✅ **Advanced Features**:
- JSONB for flexible fields (amenities, contact info)
- Full-text search for accommodation names/descriptions
- Geospatial queries (PostGIS) for location-based search
- Array types for images, roomTypes
- Materialized views for complex analytics

✅ **Performance**:
- Excellent indexing capabilities
- Query optimization with EXPLAIN ANALYZE
- Connection pooling support
- Handles millions of records efficiently

✅ **Ecosystem**:
- Mature tooling and community
- Easy migration path
- Multiple hosting options
- Great integration with Prisma

**Alternatives Considered**:

| Database | Pros | Cons | Verdict |
|----------|------|------|---------|
| MongoDB | Flexible schema, good for rapid prototyping | No foreign keys, eventual consistency issues, less suitable for relational data | ❌ Not ideal for review/rating relationships |
| MySQL | Popular, good performance | Less advanced features, weaker JSON support | ⚠️ Good but PostgreSQL is better |
| Supabase | Built on Postgres, includes auth | Vendor lock-in, extra cost | ⚠️ Good for quick start, we use vanilla Postgres for flexibility |

### 2. ORM: Prisma

**Decision**: Prisma (vs TypeORM, Drizzle, Sequelize)

**Justifications**:

✅ **Type Safety**:
- Auto-generated TypeScript types
- Compile-time query validation
- Zero runtime overhead
- Perfect IntelliSense support

✅ **Developer Experience**:
- Intuitive schema definition
- Automatic migration generation
- Built-in database seeding
- Prisma Studio for data visualization

✅ **Performance**:
- Optimized query engine in Rust
- Efficient connection pooling
- Query batching and caching
- Works well with serverless (Next.js)

✅ **Next.js Integration**:
- Official support for Next.js
- Edge runtime compatible
- Automatic client instantiation
- Great for API routes

**Example**:
```typescript
// Type-safe, autocomplete works perfectly
const accommodation = await prisma.accommodation.findUnique({
  where: { slug: 'unsw-village' },
  include: {
    amenities: {
      include: { amenity: true }
    },
    reviews: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    }
  }
});
// accommodation is fully typed!
```

**Alternatives Considered**:

| ORM | Pros | Cons | Verdict |
|-----|------|------|---------|
| TypeORM | Mature, Active Record pattern | Complex, decorator-based, slower | ❌ Less type-safe |
| Drizzle | Very fast, lightweight | Newer, smaller community | ⚠️ Good choice but less mature |
| Sequelize | Popular, lots of examples | Not TypeScript-first, verbose | ❌ Poor TypeScript support |

### 3. Web Scraping: Playwright

**Decision**: Playwright (vs Puppeteer, Cheerio, Axios + JSDOM)

**Justifications**:

✅ **Modern & Maintained**:
- Actively developed by Microsoft
- Better than Puppeteer (Chrome only)
- Cross-browser support (Chromium, Firefox, WebKit)
- Auto-wait for elements

✅ **Powerful Features**:
- Handles JavaScript-heavy sites
- Network interception
- Screenshot/PDF generation
- Mobile emulation
- Parallel execution

✅ **TypeScript Native**:
- First-class TypeScript support
- Type definitions included
- Async/await patterns

✅ **Reliability**:
- Auto-retry mechanisms
- Stable selectors
- Better error handling
- Less flaky than Puppeteer

**Example**:
```typescript
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://university.edu.au/accommodation');

// Auto-waits for element, no manual delays needed
const name = await page.textContent('h1');
const images = await page.$$eval('img.gallery',
  imgs => imgs.map(img => img.src)
);
```

**Alternatives Considered**:

| Tool | Pros | Cons | Verdict |
|------|------|------|---------|
| Puppeteer | Popular, good docs | Chrome-only, less reliable | ❌ Playwright is better |
| Cheerio | Fast, lightweight | No JavaScript execution | ❌ Can't handle dynamic sites |
| Axios + JSDOM | Simple for static sites | No browser context | ❌ Limited for modern sites |

### 4. Validation: Zod

**Decision**: Zod (vs Joi, Yup, class-validator)

**Justifications**:

✅ **TypeScript-First**:
- Infers TypeScript types automatically
- No duplicate type definitions
- Compile-time safety

✅ **Runtime Validation**:
- Validates API inputs
- Parse and transform data
- Detailed error messages

✅ **Next.js Integration**:
- Works great with API routes
- Easy error formatting
- Chainable methods

**Example**:
```typescript
const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5).max(200),
  text: z.string().min(20).max(5000),
  pros: z.array(z.string()).default([]),
});

// Type is automatically inferred
type Review = z.infer<typeof ReviewSchema>;

// Validate with detailed errors
const result = ReviewSchema.safeParse(data);
if (!result.success) {
  // result.error.errors has all validation errors
}
```

## Database Schema Design

### Core Principles

1. **Normalization**: Reduce redundancy (amenities in separate table)
2. **Denormalization**: Cache ratings for performance
3. **Indexing**: Strategic indexes on frequently queried fields
4. **Constraints**: Foreign keys, unique constraints for data integrity
5. **Audit Trail**: createdAt/updatedAt on all tables

### Key Design Decisions

#### 1. Rating Storage

**Denormalized Ratings in Accommodations Table**:
```prisma
model Accommodation {
  ratingOverall     Float   @default(0)
  ratingCleanliness Float   @default(0)
  ratingLocation    Float   @default(0)
  totalReviews      Int     @default(0)
}
```

**Why**:
- Faster queries (no JOIN needed for listing pages)
- Updated via trigger or after review creation
- Trade-off: Small data redundancy for big performance gain

#### 2. Amenities Junction Table

**Many-to-Many Relationship**:
```prisma
model AccommodationAmenity {
  accommodationId String
  amenityId       String
  available       Boolean @default(true)

  @@id([accommodationId, amenityId])
}
```

**Why**:
- Efficient filtering by amenities
- Reusable amenity definitions
- Track availability per accommodation

#### 3. Review Moderation

**Status Enum**:
```prisma
enum ReviewStatus {
  PENDING
  PUBLISHED
  REJECTED
  FLAGGED
}
```

**Why**:
- Prevent spam before it goes live
- Track flagged content
- Audit trail with moderatedBy/moderatedAt

#### 4. Scraping Metadata

**Built-in Import Tracking**:
```prisma
model Accommodation {
  sourceUrl     String?
  scrapedAt     DateTime?
  lastVerified  DateTime?
}

model DataImportLog {
  source        String
  action        ImportAction
  status        ImportStatus
  rawData       Json?
  errorMessage  String?
}
```

**Why**:
- Track data provenance
- Debug scraping issues
- Re-scrape stale data
- Audit compliance

### Indexing Strategy

```sql
-- High-frequency queries
CREATE INDEX idx_university ON accommodations(university);
CREATE INDEX idx_suburb ON accommodations(suburb);
CREATE INDEX idx_rating ON accommodations(rating_overall);
CREATE INDEX idx_price ON accommodations(price_min, price_max);

-- Full-text search
CREATE INDEX idx_fulltext ON accommodations
  USING GIN (to_tsvector('english', name || ' ' || description));

-- Composite indexes for common filters
CREATE INDEX idx_uni_rating ON accommodations(university, rating_overall);
CREATE INDEX idx_location_price ON accommodations(suburb, price_min);
```

## Repository Pattern

### Why Repository Pattern?

1. **Separation of Concerns**: API routes don't need to know about Prisma
2. **Testability**: Easy to mock repositories
3. **Reusability**: Share logic across routes
4. **Maintainability**: Database changes isolated to repository
5. **Type Safety**: Strong typing at all layers

### Example Implementation

```typescript
// lib/database/repositories/accommodation.repository.ts
export class AccommodationRepository {
  async search(filters: SearchFilters) {
    // Build dynamic where clause
    const where = this.buildWhereClause(filters);

    // Execute with includes
    return await prisma.accommodation.findMany({
      where,
      include: { amenities: { include: { amenity: true } } },
      orderBy: [
        { featured: 'desc' },
        { ratingOverall: 'desc' }
      ],
    });
  }

  async updateRatings(id: string) {
    // Calculate averages from reviews
    const reviews = await prisma.review.findMany({
      where: { accommodationId: id, status: 'PUBLISHED' }
    });

    // Update accommodation
    await prisma.accommodation.update({
      where: { id },
      data: {
        ratingOverall: avg(reviews.map(r => r.rating)),
        totalReviews: reviews.length,
      }
    });
  }
}
```

**Benefits**:
- API routes stay clean and focused
- Business logic centralized
- Easy to add caching layer later

## Data Import Pipeline

### Import Flow

```
Raw Data → Validation → Deduplication → Normalization → Database
                ↓            ↓              ↓             ↓
            Error Log   Skip Duplicate   Transform    Success Log
```

### Key Features

1. **Validation with Zod**:
```typescript
const AccommodationImportSchema = z.object({
  name: z.string().min(1),
  university: z.string().min(1),
  state: z.string().length(3),
  postcode: z.string().regex(/^\d{4}$/),
  // ... more validations
});
```

2. **Duplicate Detection**:
```typescript
const existing = await repository.findDuplicates(
  data.name,
  data.address
);
if (existing) {
  return { action: 'skipped', reason: 'duplicate' };
}
```

3. **Error Logging**:
```typescript
await prisma.dataImportLog.create({
  data: {
    source: 'scraper',
    action: 'ERROR',
    status: 'VALIDATION_ERROR',
    rawData: data,
    errorMessage: error.message,
  }
});
```

4. **Transaction Support**:
```typescript
await prisma.$transaction(async (tx) => {
  const accommodation = await tx.accommodation.create({ data });
  await tx.amenity.createMany({ data: amenities });
  await tx.accommodationAmenity.createMany({ data: links });
});
```

## Web Scraping Architecture

### Scraper Class Hierarchy

```
BaseScraper (abstract)
    │
    ├─ UniversityScraper
    ├─ UniLodgeScraper
    ├─ UrbanestScraper
    └─ StudentVIPScraper
```

### BaseScraper Responsibilities

1. Job Management (create/update ScrapingJob)
2. Rate Limiting
3. Retry Logic
4. Error Handling
5. Import Logging
6. Browser Lifecycle

### Concrete Scraper Responsibilities

1. Navigation Logic
2. Element Selection
3. Data Extraction
4. Data Normalization

### Best Practices

#### 1. Ethical Scraping

```typescript
protected config: ScraperConfig = {
  rateLimit: 3000,        // 3 seconds between requests
  maxRetries: 3,          // Don't hammer failed endpoints
  timeout: 30000,         // 30 second timeout
  userAgent: 'RateMyAccom/1.0 (+contact@example.com)',
  respectRobotsTxt: true, // Check robots.txt
};
```

#### 2. Error Recovery

```typescript
protected async retry<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await this.delay(2000); // Exponential backoff
      return this.retry(operation, retries - 1);
    }
    throw error;
  }
}
```

#### 3. Resource Management

```typescript
async cleanup() {
  if (this.browser) {
    await this.browser.close();
  }
  if (this.page) {
    await this.page.close();
  }
}

// Always cleanup on exit
process.on('SIGINT', async () => {
  await scraper.cleanup();
  process.exit(0);
});
```

## API Enhancement

### Request Validation

```typescript
// Before
const page = parseInt(request.query.page) || 1;

// After (with Zod)
const ParamsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().max(100).default(12),
  university: z.string().optional(),
});

const params = ParamsSchema.parse(searchParams);
```

### Error Responses

```typescript
// Standardized error format
{
  success: false,
  error: 'Validation failed',
  details: [
    { field: 'rating', message: 'Rating must be between 1 and 5' }
  ],
  timestamp: '2025-11-17T10:30:00Z',
  requestId: 'req_abc123'
}
```

### Response Transformation

```typescript
// Database model → API response
function transformAccommodation(accom: AccommodationWithRelations) {
  return {
    id: accom.id,
    name: accom.name,
    type: mapTypeToFrontend(accom.type), // ON_CAMPUS → 'on-campus'
    location: {
      address: accom.address,
      coordinates: accom.latitude ? {
        lat: accom.latitude,
        lng: accom.longitude
      } : undefined
    },
    // ... other transformations
  };
}
```

## Caching Strategy

### Multi-Layer Caching

```
┌─────────────────────────────────────────────────┐
│ Layer 1: CDN (Vercel Edge)                      │
│ - Static content: 1 hour                        │
│ - API responses: 5 minutes                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Layer 2: Next.js Route Cache                    │
│ - Featured accommodations: 1 hour               │
│ - Search results: 15 minutes                    │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Layer 3: Redis (optional)                       │
│ - User sessions                                  │
│ - Rate limiting counters                        │
│ - Complex query results: 5 minutes              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Layer 4: Database Query Cache                   │
│ - Prisma query caching                          │
│ - PostgreSQL query cache                        │
└─────────────────────────────────────────────────┘
```

### Implementation

```typescript
// Next.js route cache
export const revalidate = 3600; // 1 hour

// Manual caching with unstable_cache
import { unstable_cache } from 'next/cache';

const getFeaturedAccommodations = unstable_cache(
  async () => {
    return await accommodationRepository.getFeatured(6);
  },
  ['featured-accommodations'],
  { revalidate: 3600, tags: ['accommodations'] }
);

// Invalidate cache on updates
import { revalidateTag } from 'next/cache';

async function createAccommodation(data: any) {
  const result = await repository.create(data);
  revalidateTag('accommodations'); // Invalidate all accommodation caches
  return result;
}
```

## Security Considerations

### 1. SQL Injection Prevention

Prisma automatically parameterizes queries:
```typescript
// Safe - Prisma handles parameterization
await prisma.accommodation.findMany({
  where: { university: userInput } // ✅ Safe
});

// Dangerous - Raw SQL
await prisma.$queryRaw`SELECT * FROM accommodations WHERE name = ${userInput}` // ❌ Unsafe

// Safe - Raw SQL with parameters
await prisma.$queryRaw`SELECT * FROM accommodations WHERE name = ${userInput}` // ✅ Safe (Prisma escapes)
```

### 2. Input Validation

All inputs validated with Zod before database operations.

### 3. Rate Limiting

```typescript
// lib/utils/rate-limit.ts (already exists)
import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({
  points: 100,      // 100 requests
  duration: 60,     // per 60 seconds
  blockDuration: 60 // block for 60 seconds if exceeded
});

export async function checkRateLimit(ip: string) {
  await limiter.consume(ip);
}
```

### 4. Authentication & Authorization

```typescript
// Middleware for protected routes
async function requireAuth(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

// Role-based access
async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request);
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
}
```

## Monitoring & Observability

### 1. Logging

```typescript
// Structured logging
logger.info('Accommodation created', {
  accommodationId: id,
  university: data.university,
  source: 'manual',
});

logger.error('Scraping failed', {
  scraper: 'university',
  url: page.url(),
  error: error.message,
});
```

### 2. Error Tracking

Integrate Sentry:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error, {
  tags: {
    route: '/api/accommodations',
    university: filters.university,
  },
});
```

### 3. Performance Monitoring

```typescript
// Track slow queries
import { performance } from 'perf_hooks';

const start = performance.now();
const results = await repository.search(filters);
const duration = performance.now() - start;

if (duration > 1000) {
  logger.warn('Slow query detected', { duration, filters });
}
```

## Testing Strategy

### 1. Repository Tests

```typescript
describe('AccommodationRepository', () => {
  it('should find accommodation by slug', async () => {
    const accom = await repository.findByIdOrSlug('unsw-village');
    expect(accom).toBeDefined();
    expect(accom?.slug).toBe('unsw-village');
  });
});
```

### 2. API Route Tests

```typescript
describe('GET /api/accommodations', () => {
  it('should return paginated results', async () => {
    const response = await fetch('/api/accommodations?page=1&limit=12');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.pagination.page).toBe(1);
    expect(data.data.length).toBeLessThanOrEqual(12);
  });
});
```

### 3. Scraper Tests

```typescript
describe('UniversityScraper', () => {
  it('should extract accommodation data', async () => {
    const scraper = new UniversityScraper();
    const data = await scraper.extractAccommodationData(mockPage);

    expect(data.name).toBeDefined();
    expect(data.university).toBeDefined();
  });
});
```

## Performance Benchmarks

Expected performance targets:

| Operation | Target | Notes |
|-----------|--------|-------|
| List accommodations | < 200ms | With 12 results per page |
| Get single accommodation | < 100ms | Including amenities |
| Create review | < 300ms | Including rating update |
| Search with filters | < 500ms | Complex queries with joins |
| Scrape single page | 2-5s | Network dependent |
| Import 100 accommodations | < 30s | Batch processing |

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────────┐
│ Vercel (Frontend + API Routes)                  │
│ - Auto-scaling                                   │
│ - Global CDN                                     │
│ - Serverless functions                          │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ Vercel Postgres (Database)                      │
│ - Connection pooling                             │
│ - Automated backups                             │
│ - Point-in-time recovery                        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Upstash Redis (Caching) - Optional              │
│ - Global edge caching                           │
│ - Rate limiting                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Cron Jobs (Scraping) - Vercel Cron              │
│ - Scheduled scraping                            │
│ - Data refresh                                   │
└─────────────────────────────────────────────────┘
```

## Cost Estimates

Vercel deployment (estimated monthly costs):

| Service | Free Tier | Pro Tier | Notes |
|---------|-----------|----------|-------|
| Vercel Hosting | $0 | $20/mo | Includes serverless functions |
| Vercel Postgres | $0 (500MB) | $24/mo (10GB) | Shared vs dedicated |
| Upstash Redis | $0 (10k req/day) | $10/mo | Pay per use |
| **Total** | **$0** | **$54/mo** | For small to medium traffic |

Alternative (lower cost):
- Railway: $5/mo PostgreSQL + $0 hosting
- Supabase: $0 (free tier includes PostgreSQL + Auth)
- Total: $0-5/mo

## Conclusion

This architecture provides:

1. **Scalability**: Handle thousands of accommodations and reviews
2. **Performance**: Sub-200ms API responses with caching
3. **Maintainability**: Clean separation of concerns
4. **Type Safety**: End-to-end TypeScript
5. **Reliability**: Error handling and retry logic at all layers
6. **Observability**: Comprehensive logging and monitoring
7. **Security**: Input validation, rate limiting, SQL injection prevention
8. **Flexibility**: Easy to add new features and data sources

The architecture is production-ready and follows industry best practices for Next.js applications.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-17
