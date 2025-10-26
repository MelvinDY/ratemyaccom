# Deployment Guide - Rate My Accom NSW

Complete guide for deploying Rate My Accom NSW to Vercel with production-ready configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Vercel Deployment](#vercel-deployment)
6. [Domain Configuration](#domain-configuration)
7. [Post-Deployment](#post-deployment)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] Node.js 18+ installed
- [x] npm or yarn package manager
- [x] Vercel account (free tier works for staging)
- [x] PostgreSQL database (Vercel Postgres, Supabase, or Neon recommended)
- [x] Git repository (GitHub, GitLab, or Bitbucket)
- [x] Domain name (optional, for custom domain)

---

## Initial Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Your Project

```bash
vercel link
```

Follow the prompts to link your local project to a Vercel project.

---

## Environment Variables

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Local Environment

Edit `.env.local` with your development credentials:

```bash
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=your-postgresql-connection-string
DATABASE_SSL=true

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Email (optional for development)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_FROM=noreply@ratemyaccom.com.au
```

### 3. Set Production Environment Variables

#### Using Vercel CLI:

```bash
# Production Database
vercel env add DATABASE_URL production
vercel env add DATABASE_SSL production

# Authentication
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# Email Service
vercel env add EMAIL_SERVER_HOST production
vercel env add EMAIL_SERVER_PASSWORD production

# API Keys
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production
```

#### Using Vercel Dashboard:

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from `.env.example`
4. Select appropriate environment (Production, Preview, Development)

---

## Database Setup

### Option 1: Vercel Postgres (Recommended)

```bash
# Install Vercel Postgres
vercel env pull .env.local
vercel postgres create
```

### Option 2: External PostgreSQL (Neon, Supabase, etc.)

1. Create a PostgreSQL database
2. Get connection string
3. Add to environment variables

### Run Migrations

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

---

## Vercel Deployment

### Staging Deployment

Deploy to preview environment:

```bash
npm run deploy:staging
# or
vercel
```

This creates a preview deployment with a unique URL.

### Production Deployment

Deploy to production:

```bash
npm run deploy:production
# or
vercel --prod
```

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

Configure in `vercel.json` or Vercel Dashboard.

---

## Domain Configuration

### 1. Add Custom Domain

#### Via Vercel Dashboard:

1. Project Settings → **Domains**
2. Add `ratemyaccom.com.au`
3. Add `www.ratemyaccom.com.au` (will redirect to non-www)

#### Via CLI:

```bash
vercel domains add ratemyaccom.com.au
vercel domains add www.ratemyaccom.com.au
```

### 2. DNS Configuration

Add these DNS records at your domain registrar:

```
Type    Name    Value                           TTL
A       @       76.76.21.21                    Auto
CNAME   www     cname.vercel-dns.com          Auto
```

Vercel will automatically provision SSL certificates.

### 3. Verify Domain

```bash
vercel domains verify ratemyaccom.com.au
```

---

## Post-Deployment

### 1. Health Check

Verify deployment health:

```bash
curl https://ratemyaccom.com.au/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-26T...",
  "checks": {
    "database": "ok",
    "api": "ok"
  }
}
```

### 2. Test API Endpoints

```bash
# List accommodations
curl https://ratemyaccom.com.au/api/accommodations

# Get specific accommodation
curl https://ratemyaccom.com.au/api/accommodations/unsw-village

# Get reviews
curl https://ratemyaccom.com.au/api/reviews?accommodationId=1
```

### 3. Verify Analytics

1. Visit Vercel Dashboard → **Analytics**
2. Check Web Vitals are being tracked
3. Monitor real-time traffic

---

## CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Protection

Enable in Vercel Dashboard:

1. **Settings** → **Deployment Protection**
2. Enable "Vercel Authentication" for Preview Deployments
3. Set up "Deployment Protection Bypass" for team members

---

## Monitoring & Analytics

### Vercel Analytics

Already integrated via:
- `@vercel/analytics` - Page views and user metrics
- `@vercel/speed-insights` - Core Web Vitals

Access at: **Vercel Dashboard → Analytics**

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Configure environment variables:
```bash
vercel env add SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production
```

### Log Monitoring

View logs:
```bash
vercel logs <deployment-url>
vercel logs --follow  # Real-time logs
```

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors

```bash
# Run type check locally
npm run type-check

# Fix errors and redeploy
git add .
git commit -m "Fix TypeScript errors"
git push
```

**Issue**: Missing environment variables

```bash
# Pull latest environment variables
vercel env pull .env.local

# Verify all required variables are set
vercel env ls
```

### Database Connection Issues

**Issue**: Cannot connect to database

1. Verify `DATABASE_URL` is correct
2. Check database is accepting connections
3. Verify SSL settings match database requirements
4. Check connection pool settings

```bash
# Test database connection
npm run db:migrate
```

### Rate Limiting Issues

**Issue**: Getting 429 errors

- Default: 100 requests per 15 minutes
- Adjust in `.env`: `RATE_LIMIT_MAX_REQUESTS=200`
- Different limits for auth, reviews, search endpoints

### Performance Issues

**Issue**: Slow page loads

1. Check **Speed Insights** in Vercel Dashboard
2. Analyze bundle size:
   ```bash
   npm run build:analyze
   ```
3. Optimize images (use Next.js Image component)
4. Enable caching headers (configured in `vercel.json`)

### Domain Issues

**Issue**: Domain not connecting

1. Verify DNS records are correct
2. Wait for DNS propagation (up to 48 hours)
3. Check SSL certificate status in Vercel Dashboard
4. Force SSL renewal:
   ```bash
   vercel certs issue ratemyaccom.com.au
   ```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript checks pass (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] `.env.example` updated with all variables

### Staging Deployment

- [ ] Deploy to preview environment
- [ ] Run database migrations
- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Test review submission
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags

### Production Deployment

- [ ] Staging thoroughly tested
- [ ] Backup database (if applicable)
- [ ] Deploy to production
- [ ] Run production migrations
- [ ] Verify health check endpoint
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check analytics are tracking

### Post-Deployment

- [ ] Announce deployment to team
- [ ] Monitor performance metrics
- [ ] Watch for error spikes
- [ ] Verify all features working
- [ ] Check email notifications (if configured)
- [ ] Test from different locations/devices

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate regularly, use secret management
3. **HTTPS**: Always use SSL in production
4. **Rate Limiting**: Configured and tested
5. **Input Validation**: All user input sanitized
6. **SQL Injection**: Use parameterized queries
7. **XSS Protection**: Headers configured in `vercel.json`
8. **CORS**: Properly configured in middleware
9. **CSP**: Content Security Policy set
10. **Dependencies**: Keep updated, run `npm audit`

---

## Scaling Considerations

### Database

- **Connection Pooling**: Configured in `lib/database/db.ts`
- **Indexes**: Created in migrations for performance
- **Query Optimization**: Use proper indexes, limit results

### Caching

- **Static Pages**: Pre-rendered at build time
- **API Responses**: Consider Redis for caching
- **CDN**: Vercel Edge Network handles static assets

### Rate Limiting

- Currently in-memory (rate-limiter-flexible)
- For multi-instance: Use Redis-backed rate limiter

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub Repository**: [Your repo URL]
- **Project Documentation**: See README.md

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Deployment
npm run deploy:staging         # Deploy to staging
npm run deploy:production      # Deploy to production
vercel logs --follow          # View real-time logs

# Database
npm run db:migrate            # Run migrations
npm run db:seed               # Seed database
npm run vercel:env            # Pull environment variables

# Quality
npm run lint                  # Run linter
npm run type-check            # TypeScript check
npm run test                  # Run tests
```

---

**Last Updated**: October 2024
**Version**: 1.0.0
**Maintained by**: Rate My Accom NSW Team
