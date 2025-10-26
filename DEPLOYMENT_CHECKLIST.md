# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Code Quality

- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] All tests passing (`npm test`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks
- [ ] All TODO comments addressed or documented

### Configuration

- [ ] `.env.example` updated with all required variables
- [ ] `package.json` version bumped
- [ ] Dependencies updated and tested (`npm update`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Production environment variables set in Vercel
- [ ] Database connection string configured
- [ ] NEXTAUTH_SECRET generated and set
- [ ] Email service configured (if applicable)

### Database

- [ ] Database migrations created and tested
- [ ] Database migrations run on staging
- [ ] Rollback plan documented
- [ ] Database backup created (if production)
- [ ] Indexes optimized for queries
- [ ] Connection pooling configured

### Security

- [ ] Security headers configured (`vercel.json`)
- [ ] CORS properly configured
- [ ] Rate limiting tested
- [ ] API routes protected (authentication required where needed)
- [ ] Input validation implemented
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection implemented (if applicable)
- [ ] Sensitive data not exposed in client-side code
- [ ] Environment variables not committed to Git

### Performance

- [ ] Images optimized (using Next.js Image component)
- [ ] Bundle size analyzed (`npm run build:analyze`)
- [ ] Unused dependencies removed
- [ ] Code splitting implemented
- [ ] Static pages pre-rendered
- [ ] API response times tested
- [ ] Database queries optimized
- [ ] Caching strategy implemented

### Testing

- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] E2E tests passing (if applicable)
- [ ] Manual testing on all major browsers
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Mobile responsiveness tested
  - [ ] iOS Safari
  - [ ] Android Chrome
- [ ] Accessibility tested (keyboard navigation, screen readers)

## Staging Deployment

### Deploy to Staging

- [ ] Push to staging branch
- [ ] Verify staging build succeeds
- [ ] Run database migrations on staging
- [ ] Verify staging deployment URL accessible

### Staging Verification

- [ ] Health check endpoint returns success (`/api/health`)
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Search functionality works
- [ ] Accommodation listing loads
- [ ] Accommodation detail pages load
- [ ] Review submission works (if enabled)
- [ ] Forms validate correctly
- [ ] Error pages display correctly (404, 500)
- [ ] Analytics tracking verified
- [ ] API endpoints respond correctly
- [ ] Rate limiting works as expected
- [ ] Email sending works (if configured)

### Performance on Staging

- [ ] Lighthouse score checked (aim for 90+ in all categories)
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO
- [ ] Core Web Vitals acceptable
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Page load times acceptable
- [ ] API response times < 500ms

### User Acceptance Testing

- [ ] Product owner reviewed
- [ ] Design review completed
- [ ] Content review completed
- [ ] Stakeholders approved

## Production Deployment

### Pre-Production

- [ ] Create production database backup
- [ ] Document rollback procedure
- [ ] Prepare incident response plan
- [ ] Schedule maintenance window (if needed)
- [ ] Notify team of deployment time
- [ ] Prepare monitoring dashboards

### Production Deploy

- [ ] Merge to main branch
- [ ] Verify production build succeeds
- [ ] Run database migrations (with rollback plan)
- [ ] Deploy to production (`npm run deploy:production`)
- [ ] Verify deployment successful

### Post-Deployment Verification

- [ ] Production URL accessible (https://ratemyaccom.com.au)
- [ ] Health check passes
- [ ] Homepage loads
- [ ] Critical user paths tested
  - [ ] Search accommodations
  - [ ] View accommodation details
  - [ ] Read reviews
  - [ ] Submit review (if enabled)
- [ ] SSL certificate valid
- [ ] www redirect working
- [ ] Analytics tracking
- [ ] Error tracking configured

### Monitoring (First 24 Hours)

- [ ] Monitor error rates (should be < 1%)
- [ ] Check response times
- [ ] Verify database performance
- [ ] Monitor memory usage
- [ ] Check for any 4xx/5xx errors
- [ ] Review user feedback
- [ ] Monitor Core Web Vitals
- [ ] Check Vercel Analytics for issues

### Documentation

- [ ] Deployment documented in changelog
- [ ] Release notes published (if applicable)
- [ ] Known issues documented
- [ ] Post-deployment report created

## Post-Deployment

### Communication

- [ ] Team notified of successful deployment
- [ ] Stakeholders informed
- [ ] Documentation updated
- [ ] Support team briefed on changes

### Verification (Week 1)

- [ ] Monitor error logs daily
- [ ] Review performance metrics
- [ ] Check user feedback
- [ ] Verify analytics data
- [ ] Monitor database performance
- [ ] Check for memory leaks
- [ ] Review security logs

### Optimization

- [ ] Identify slow queries
- [ ] Analyze bundle size
- [ ] Review caching strategy
- [ ] Plan performance improvements
- [ ] Document lessons learned

## Rollback Procedure

If issues are detected post-deployment:

1. [ ] Identify the issue and impact
2. [ ] Assess if rollback is necessary
3. [ ] Notify team of rollback decision
4. [ ] Revert to previous deployment
   ```bash
   vercel rollback <previous-deployment-url>
   ```
5. [ ] Verify rollback successful
6. [ ] Restore database if needed
7. [ ] Document the issue
8. [ ] Create hotfix plan
9. [ ] Communicate status to stakeholders

## Emergency Contacts

- **Deployment Lead**: [Name]
- **Database Admin**: [Name]
- **DevOps**: [Name]
- **Vercel Support**: support@vercel.com

## Notes

- Keep this checklist updated with each deployment
- Add items based on lessons learned
- Review and improve process regularly
- Automate where possible

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Version**: ___________
**Deployment URL**: ___________
