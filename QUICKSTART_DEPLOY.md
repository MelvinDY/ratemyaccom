# Quick Start Deployment Guide

Get your RateMyAccom project deployed to Vercel in 10 minutes.

## Prerequisites

- Vercel account (free tier works)
- Git repository (GitHub/GitLab/Bitbucket)
- Node.js 18+ installed locally

## Step 1: Install Dependencies (30 seconds)

```bash
npm install
```

## Step 2: Setup Vercel CLI (1 minute)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

## Step 3: Link Project (30 seconds)

```bash
# Link to Vercel (creates new project or links existing)
vercel link
```

Choose:
- Scope: Your Vercel account
- Link to existing project? No (for new) or Yes (for existing)
- Project name: `ratemyaccom`

## Step 4: Set Environment Variables (2 minutes)

### Option A: Use Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these required variables:

```
NEXT_PUBLIC_APP_URL = https://ratemyaccom.com.au
NEXTAUTH_SECRET = [Generate with: openssl rand -base64 32]
DATABASE_URL = [Your PostgreSQL connection string]
```

### Option B: Use CLI

```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://ratemyaccom.com.au

vercel env add NEXTAUTH_SECRET production
# Generate with: openssl rand -base64 32

vercel env add DATABASE_URL production
# Enter your PostgreSQL connection string
```

## Step 5: Setup Database (3 minutes)

### Using Vercel Postgres (Recommended)

```bash
# Create Vercel Postgres database
vercel postgres create

# Pull environment variables
vercel env pull .env.local

# Run migrations
npm run db:migrate

# Optional: Seed with sample data
npm run db:seed
```

### Using External Database (Neon, Supabase, etc.)

1. Create PostgreSQL database at your provider
2. Get connection string
3. Add to `DATABASE_URL` environment variable
4. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Step 6: Deploy to Production (2 minutes)

```bash
# Deploy to production
npm run deploy:production
# or
vercel --prod
```

You'll see output like:
```
✅ Deployed to production: https://ratemyaccom.vercel.app
```

## Step 7: Verify Deployment (1 minute)

1. Visit your deployment URL
2. Check health endpoint:
   ```bash
   curl https://your-deployment.vercel.app/api/health
   ```
3. Expected response:
   ```json
   {
     "status": "healthy",
     "checks": { "database": "ok", "api": "ok" }
   }
   ```

## Step 8: Add Custom Domain (Optional - 3 minutes)

### Via Vercel Dashboard:

1. Go to **Project Settings** → **Domains**
2. Add `ratemyaccom.com.au`
3. Update DNS at your registrar:
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```
4. Wait for verification (usually < 5 minutes)

### Via CLI:

```bash
vercel domains add ratemyaccom.com.au
```

## That's It! 🎉

Your site is now live at:
- **Vercel URL**: https://ratemyaccom.vercel.app
- **Custom Domain**: https://ratemyaccom.com.au (if configured)

## Next Steps

### Enable Auto-Deploy

If using GitHub:
1. Go to Vercel project settings
2. Connect to GitHub repository
3. Enable automatic deployments for main branch

Now every push to `main` automatically deploys!

### Monitor Your Site

- **Analytics**: https://vercel.com/dashboard → Your Project → Analytics
- **Logs**: `vercel logs --follow`
- **Health Check**: Visit `/api/health`

### Optional Enhancements

```bash
# Enable staging environment
git checkout -b staging
git push origin staging
vercel --prod  # Creates preview deployment
```

## Common Issues & Solutions

### Build Fails

```bash
# Check TypeScript errors locally
npm run type-check

# Check linting
npm run lint

# Test build locally
npm run build
```

### Database Connection Error

1. Verify `DATABASE_URL` is set in Vercel
2. Check database accepts connections
3. Verify SSL settings match database requirements
4. Test connection:
   ```bash
   npm run db:migrate
   ```

### Environment Variables Not Working

```bash
# Pull latest environment variables
vercel env pull .env.local

# List all environment variables
vercel env ls
```

## Getting Help

- **Full Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Deployment Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Create an issue in your repository

## Estimated Total Time: 10-15 minutes

- ✅ Install: 30s
- ✅ Vercel Setup: 1 min
- ✅ Link Project: 30s
- ✅ Environment Variables: 2 min
- ✅ Database: 3 min
- ✅ Deploy: 2 min
- ✅ Verify: 1 min
- ⏸️ Custom Domain: 3 min (optional)

**Total**: ~10 minutes (without custom domain)

---

**Pro Tip**: Save time by using Vercel's GitHub integration for automatic deployments!
