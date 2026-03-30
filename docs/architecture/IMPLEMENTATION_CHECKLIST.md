# Backend Implementation Checklist

Use this checklist to track your implementation progress.

## Phase 1: Database Setup (30 minutes)

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Git repository cloned
- [ ] Code editor (VS Code recommended) set up

### Database Installation
- [ ] Choose database option (Local/Docker/Cloud)
- [ ] Install PostgreSQL (if local)
  ```bash
  # Ubuntu/WSL
  sudo apt install postgresql
  # Mac
  brew install postgresql
  # Or use Docker
  docker run --name ratemyaccom-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
  ```
- [ ] Create database and user
- [ ] Test connection with `psql`

### Dependencies
- [ ] Install Prisma
  ```bash
  npm install prisma @prisma/client tsx --save-dev
  npm install @prisma/client
  ```
- [ ] Verify installation
  ```bash
  npx prisma --version
  ```

### Environment Configuration
- [ ] Copy `.env.example.backend` to `.env.local`
- [ ] Update `DATABASE_URL` with your credentials
- [ ] Set `DATABASE_SSL` appropriately
- [ ] Test environment variables load correctly

### Prisma Setup
- [ ] Generate Prisma Client
  ```bash
  npx prisma generate
  ```
- [ ] Run initial migration
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] Verify migration succeeded
- [ ] Check tables created in Prisma Studio
  ```bash
  npx prisma studio
  ```

### Data Seeding
- [ ] Run setup script
  ```bash
  npx tsx scripts/setup-database.ts
  ```
- [ ] Verify amenities created (14 amenities)
- [ ] Verify accommodations imported (4 accommodations)
- [ ] Verify test user created
- [ ] Check data in Prisma Studio

## Phase 2: API Routes Update (15 minutes)

### Backup Current Routes
- [ ] Backup accommodations route
  ```bash
  mv app/api/accommodations/route.ts app/api/accommodations/route.old.ts
  ```
- [ ] Backup accommodation detail route
  ```bash
  mv app/api/accommodations/[id]/route.ts app/api/accommodations/[id]/route.old.ts
  ```
- [ ] Backup reviews route
  ```bash
  mv app/api/reviews/route.ts app/api/reviews/route.old.ts
  ```

### Activate New Routes
- [ ] Activate accommodations list route
  ```bash
  mv app/api/accommodations/route.new.ts app/api/accommodations/route.ts
  ```
- [ ] Activate accommodation detail route
  ```bash
  mv app/api/accommodations/[id]/route.new.ts app/api/accommodations/[id]/route.ts
  ```
- [ ] Activate reviews route
  ```bash
  mv app/api/reviews/route.new.ts app/api/reviews/route.ts
  ```

### Type Check
- [ ] Run TypeScript check
  ```bash
  npm run type-check
  ```
- [ ] Fix any type errors
- [ ] Regenerate Prisma Client if needed
  ```bash
  npx prisma generate
  ```

## Phase 3: Testing (20 minutes)

### Start Development Server
- [ ] Start Next.js dev server
  ```bash
  npm run dev
  ```
- [ ] Verify no build errors
- [ ] Check console for warnings

### Manual API Testing

#### Test Accommodations List
- [ ] Open browser: http://localhost:3000/api/accommodations
- [ ] Verify response format:
  ```json
  {
    "success": true,
    "data": [...],
    "pagination": {...}
  }
  ```
- [ ] Test with filters: `?university=UNSW`
- [ ] Test with price filter: `?priceMax=500`
- [ ] Test with pagination: `?page=1&limit=2`

#### Test Single Accommodation
- [ ] Get accommodation by slug: http://localhost:3000/api/accommodations/unsw-village
- [ ] Verify full accommodation data returned
- [ ] Test with invalid slug (should return 404)

#### Test Reviews
- [ ] Get reviews for accommodation: `?accommodationId=<id>`
- [ ] Verify pagination works
- [ ] Test with invalid ID (should return error)

### Using curl (Optional)
```bash
# List accommodations
curl http://localhost:3000/api/accommodations

# Get single
curl http://localhost:3000/api/accommodations/unsw-village

# Search with filters
curl "http://localhost:3000/api/accommodations?university=UNSW&priceMax=500"

# Get reviews
curl "http://localhost:3000/api/reviews?accommodationId=<id>&page=1"
```

### Database Verification
- [ ] Open Prisma Studio
  ```bash
  npx prisma studio
  ```
- [ ] Check Accommodations table (should have 4 records)
- [ ] Check Amenities table (should have 14 records)
- [ ] Check AccommodationAmenity junction table
- [ ] Check Users table (should have test user)

### Frontend Integration
- [ ] Test accommodation listing page
- [ ] Verify data displays correctly
- [ ] Check for console errors
- [ ] Verify images load
- [ ] Test search/filter functionality

## Phase 4: Web Scraping (Optional - 1 hour)

### Scraper Configuration
- [ ] Review scraper configuration in `lib/scraping/scrapers/university-scraper.ts`
- [ ] Customize selectors for target websites
- [ ] Set appropriate rate limits
- [ ] Configure user agent

### Test Scraper
- [ ] Run scraper in test mode
  ```bash
  npx tsx scripts/run-scraper.ts university
  ```
- [ ] Check console output
- [ ] Verify scraping job created in database
- [ ] Check DataImportLog table
- [ ] Verify new accommodations imported

### Customize Scrapers
- [ ] Create scraper for UniLodge (optional)
- [ ] Create scraper for Urbanest (optional)
- [ ] Create scraper for StudentVIP (optional)
- [ ] Test each scraper
- [ ] Review import logs

## Phase 5: Production Preparation (30 minutes)

### Code Quality
- [ ] Run linter
  ```bash
  npm run lint
  ```
- [ ] Fix linting errors
- [ ] Run formatter
  ```bash
  npm run format
  ```
- [ ] Type check passes
  ```bash
  npm run type-check
  ```
- [ ] Build succeeds
  ```bash
  npm run build
  ```

### Database Preparation
- [ ] Review migration files
- [ ] Test migration rollback (optional)
- [ ] Backup database
  ```bash
  pg_dump -U myuser ratemyaccom > backup.sql
  ```
- [ ] Document any manual steps needed

### Environment Variables
- [ ] List all required environment variables
- [ ] Document default values
- [ ] Create production .env.example
- [ ] Verify no secrets in code

### Security Review
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify input validation on all endpoints
- [ ] Review error messages (no sensitive data exposed)
- [ ] Check rate limiting is configured
- [ ] Review CORS settings

## Phase 6: Deployment (Vercel - 30 minutes)

### Vercel Setup
- [ ] Install Vercel CLI
  ```bash
  npm i -g vercel
  ```
- [ ] Login to Vercel
  ```bash
  vercel login
  ```
- [ ] Link project
  ```bash
  vercel link
  ```

### Database Deployment
- [ ] Create Vercel Postgres database
  ```bash
  vercel postgres create ratemyaccom-prod
  ```
- [ ] Pull environment variables
  ```bash
  vercel env pull .env.production
  ```
- [ ] Or manually set DATABASE_URL in Vercel dashboard

### Configure Build
- [ ] Update build command in vercel.json or dashboard:
  ```
  prisma generate && prisma migrate deploy && next build
  ```
- [ ] Set environment variables in Vercel dashboard
- [ ] Enable SSL: `DATABASE_SSL=true`

### Deploy
- [ ] Deploy to preview
  ```bash
  vercel
  ```
- [ ] Test preview deployment
- [ ] Deploy to production
  ```bash
  vercel --prod
  ```

### Post-Deployment
- [ ] Run migrations on production database
  ```bash
  # SSH into Vercel or run locally against prod DB
  DATABASE_URL="<prod-url>" npx prisma migrate deploy
  ```
- [ ] Seed production database (optional)
- [ ] Test production API endpoints
- [ ] Monitor logs for errors
- [ ] Check Vercel Analytics

## Phase 7: Monitoring & Maintenance (Ongoing)

### Setup Monitoring
- [ ] Configure Sentry (error tracking)
- [ ] Enable Vercel Analytics
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

### Regular Maintenance
- [ ] Schedule database backups
- [ ] Monitor database size
- [ ] Review slow queries
- [ ] Update dependencies monthly
- [ ] Review security advisories

### Data Quality
- [ ] Schedule scraper runs
- [ ] Review import logs weekly
- [ ] Verify data accuracy
- [ ] Remove duplicates
- [ ] Update stale data

## Phase 8: Future Enhancements (Optional)

### Authentication
- [ ] Install NextAuth.js
  ```bash
  npm install next-auth
  ```
- [ ] Configure providers (Google, Email)
- [ ] Protect admin routes
- [ ] Add user roles

### Caching
- [ ] Set up Redis (Upstash)
- [ ] Implement API route caching
- [ ] Add CDN caching headers
- [ ] Implement cache invalidation

### Admin Dashboard
- [ ] Create admin UI components
- [ ] Add accommodation management
- [ ] Add review moderation
- [ ] Add user management

### Advanced Features
- [ ] Implement full-text search
- [ ] Add geospatial queries
- [ ] Real-time notifications
- [ ] Analytics dashboard
- [ ] Export functionality

## Troubleshooting Checklist

### Database Issues
- [ ] Verify PostgreSQL is running
- [ ] Check DATABASE_URL format
- [ ] Test connection with psql
- [ ] Check firewall settings
- [ ] Verify user permissions

### Prisma Issues
- [ ] Run `npx prisma generate`
- [ ] Clear node_modules and reinstall
- [ ] Check Prisma version compatibility
- [ ] Review migration files
- [ ] Reset database if needed

### API Issues
- [ ] Check server logs
- [ ] Verify routes are activated
- [ ] Test with curl/Postman
- [ ] Check CORS settings
- [ ] Review error responses

### Build Issues
- [ ] Clear .next directory
- [ ] Run `npm run type-check`
- [ ] Check for circular dependencies
- [ ] Verify all imports are correct
- [ ] Review build logs

## Success Criteria

### Phase 1 Complete When:
- [x] Database created and accessible
- [x] Prisma Client generated
- [x] Migrations applied successfully
- [x] Seed data imported
- [x] Prisma Studio shows data

### Phase 2 Complete When:
- [x] New routes activated
- [x] No TypeScript errors
- [x] Build succeeds
- [x] Old routes backed up

### Phase 3 Complete When:
- [x] All API endpoints return data
- [x] Frontend displays database data
- [x] No console errors
- [x] Pagination works
- [x] Filters work

### Phase 4 Complete When:
- [x] Scraper runs successfully
- [x] Data imported from scraper
- [x] Import logs created
- [x] No duplicate data

### Phase 5 Complete When:
- [x] Linter passes
- [x] Type check passes
- [x] Build succeeds
- [x] Tests pass (if any)

### Phase 6 Complete When:
- [x] Deployed to Vercel
- [x] Production database connected
- [x] API endpoints work in production
- [x] No errors in logs

## Time Estimates

- **Phase 1**: 30 minutes
- **Phase 2**: 15 minutes
- **Phase 3**: 20 minutes
- **Phase 4**: 1 hour (optional)
- **Phase 5**: 30 minutes
- **Phase 6**: 30 minutes
- **Total**: ~2.5 hours (without scraping)
- **Total**: ~3.5 hours (with scraping)

## Support

If you get stuck:
1. Check the relevant documentation file
2. Review error messages carefully
3. Check Prisma Studio for data issues
4. Review logs in console
5. Search Prisma/Next.js documentation
6. Check GitHub issues for similar problems

## Documentation References

- **Quick Start**: See `QUICK_START.md`
- **Full Guide**: See `BACKEND_IMPLEMENTATION_GUIDE.md`
- **Architecture**: See `BACKEND_ARCHITECTURE.md`
- **Summary**: See `BACKEND_SUMMARY.md`
- **Environment**: See `.env.example.backend`

---

**Version**: 1.0.0
**Last Updated**: 2025-11-17

Good luck with your implementation!
