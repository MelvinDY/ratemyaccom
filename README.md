# RateMyAccom NSW

**Student accommodation reviews for NSW universities** - Find the perfect place to live while studying in New South Wales.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A production-ready web application for rating and reviewing student accommodations across NSW universities. Built with security, accessibility, and user experience as top priorities.

## Features

### Core Features
- **Student-Verified Reviews**: Only verified university students can submit reviews
- **Comprehensive Ratings**: Multi-dimensional ratings covering cleanliness, location, value, amenities, management, and safety
- **Advanced Search**: Filter accommodations by university, location, price range, and amenities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Security Features
- **Input Validation & Sanitization**: XSS, SQL injection, and path traversal protection
- **CSRF Protection**: Token-based protection for all state-changing requests
- **Rate Limiting**: Prevents spam and abuse with configurable limits
- **Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **Student Data Privacy**: Email verification and minimal data collection

### Code Quality
- **TypeScript Strict Mode**: Enhanced type safety with comprehensive type definitions
- **Automated Testing**: Jest + React Testing Library with 70%+ coverage
- **ESLint + Prettier**: Enforced code style and best practices
- **Pre-commit Hooks**: Husky + lint-staged for quality gates
- **Error Boundaries**: Graceful error handling throughout the app

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library
- **Security**: CSRF protection, rate limiting, input sanitization
- **Code Quality**: ESLint, Prettier, Husky

## Project Structure

```
ratemyaccom/
├── app/                          # Next.js App Router pages
│   ├── accommodation/[slug]/     # Dynamic accommodation detail pages
│   ├── layout.tsx               # Root layout with header/footer
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles and Tailwind directives
├── components/
│   ├── accommodations/          # Accommodation-related components
│   │   ├── AccommodationCard.tsx
│   │   └── FeaturedGrid.tsx
│   ├── forms/                   # Form components
│   │   └── ReviewForm.tsx
│   ├── reviews/                 # Review-related components
│   │   ├── ReviewCard.tsx
│   │   └── RatingBreakdown.tsx
│   └── ui/                      # General UI components
│       ├── Header.tsx
│       ├── Hero.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── auth/                    # Authentication utilities (future)
│   ├── database/                # Database utilities (future)
│   ├── utils/                   # Helper functions
│   └── data/
│       └── placeholder.ts       # Sample data for demonstration
├── types/
│   └── index.ts                 # TypeScript type definitions
└── public/                      # Static assets

```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript compiler checks

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Key Components

### Landing Page
- Hero section with value proposition
- Search bar for filtering by university/location
- Featured accommodations grid
- Benefits section

### Accommodation Detail Page
- Comprehensive accommodation information
- Rating breakdown by category (cleanliness, location, value, amenities, management, safety)
- Student reviews with pros/cons
- Review submission form
- Contact information and pricing

## TypeScript Interfaces

The project uses strongly-typed interfaces for:
- `Accommodation` - Property details, location, amenities, pricing
- `Review` - User reviews with ratings and feedback
- `User` - User profiles with university affiliation
- `RatingBreakdown` - Category-specific ratings
- `SearchFilters` - Search and filter parameters

## Styling

The project uses Tailwind CSS with a custom color scheme:
- **Primary**: Blue tones for main actions and branding
- **Secondary**: Purple accents for highlights
- **Accent**: Green for success states and verified badges

Custom utility classes include:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline` - Button styles
- `.card` - Card container with shadow
- `.input` - Form input styling
- `.badge` - Status badges

## Sample Data

The project includes placeholder data for 4 NSW accommodations:
1. UNSW Village (Kensington)
2. UniLodge on Broadway (Ultimo)
3. Macquarie University Village (North Ryde)
4. Urbanest Darlington (Darlington)

Each includes realistic pricing, amenities, and student reviews.

## Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ratemyaccom)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Staging**
   ```bash
   npm run deploy:staging
   ```

3. **Deploy to Production**
   ```bash
   npm run deploy:production
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For pre-deployment checklist, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Environment Setup

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your environment variables (see `.env.example` for required variables)

3. Set up database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Production Features

### Implemented

- ✅ Vercel deployment configuration
- ✅ Security headers and CSP
- ✅ API rate limiting
- ✅ Database connection pooling
- ✅ Error tracking ready (Sentry)
- ✅ Analytics (Vercel Analytics & Speed Insights)
- ✅ SEO optimization
- ✅ Performance monitoring
- ✅ Automated deployments (CI/CD)

### API Endpoints

- `GET /api/accommodations` - List accommodations with filtering
- `GET /api/accommodations/[id]` - Get single accommodation
- `GET /api/reviews?accommodationId=xxx` - Get reviews for accommodation
- `POST /api/reviews` - Submit new review
- `GET /api/health` - Health check endpoint

## Monitoring & Analytics

- **Vercel Analytics**: Real-time visitor analytics
- **Speed Insights**: Core Web Vitals monitoring
- **Error Tracking**: Sentry integration ready
- **Logs**: Real-time deployment logs via Vercel

## Security

### Comprehensive Security Implementation

#### Input Validation & Sanitization
All user inputs are validated using Zod schemas and sanitized to prevent:
- XSS attacks
- SQL injection
- Path traversal
- Script injection

```typescript
// Example: Review submission validation
const reviewSchema = z.object({
  title: z.string().min(10).max(100),
  text: z.string().min(50).max(2000).refine(/* XSS check */),
  rating: z.number().min(1).max(5),
});
```

#### CSRF Protection
All state-changing requests require valid CSRF tokens:
```typescript
// Automatically handled by API client
api.post('/reviews', reviewData); // CSRF token added automatically
```

#### Rate Limiting
Endpoints are protected with rate limiting:
- **Auth endpoints**: 5 requests per 15 minutes
- **Review submissions**: 3 reviews per 24 hours
- **Search**: 60 requests per minute
- **General API**: 100 requests per minute

#### Security Headers
- Content Security Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- X-XSS-Protection
- Referrer-Policy

#### Authentication & Authorization
- Student email verification (NSW universities only)
- Bcrypt password hashing
- JWT-based session management
- Role-based access control

### Data Privacy

We take student data protection seriously:
1. **Email Verification**: Students must verify their university email
2. **Password Security**: Strong password requirements enforced
3. **Data Minimization**: Only collect necessary information
4. **User Control**: Students can delete their reviews and account
5. **No Third-Party Tracking**: No analytics or tracking by default

## Future Enhancements

- User authentication and authorization (NextAuth.js ready)
- Database integration (PostgreSQL migrations ready)
- Image upload and gallery (AWS S3/Cloudinary ready)
- Advanced search and filtering
- Review voting system
- Admin dashboard
- Email notifications (SendGrid configured)
- Map integration for locations (Google Maps API ready)
- Comparison tool for accommodations
- Mobile app version

## Performance

- Static site generation (SSG) for accommodation pages
- Image optimization via Next.js Image component
- Code splitting and lazy loading
- Edge caching via Vercel CDN
- Optimized bundle size
- Server-side rendering where needed

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

Tests use Jest and React Testing Library:

```typescript
import { render, screen } from '@/__tests__/utils/test-utils';
import { AccommodationCard } from '@/components/accommodations/AccommodationCard';

describe('AccommodationCard', () => {
  it('renders accommodation details', () => {
    render(<AccommodationCard accommodation={mockAccommodation} />);
    expect(screen.getByText('Test Accommodation')).toBeInTheDocument();
  });
});
```

### Coverage Requirements

- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

## Accessibility

RateMyAccom is built with accessibility in mind:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)
- Focus management

## Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow the TypeScript style guide
- Write tests for new features
- Ensure all tests pass (`npm test`)
- Run linting (`npm run lint`)
- Format code (`npm run format`)
- Maintain test coverage above 70%

### Pre-commit Checks

The following checks run automatically before each commit:
1. ESLint (auto-fix enabled)
2. Prettier formatting
3. TypeScript type checking
4. Test suite

## Support

For deployment issues, see:
- [Deployment Guide](./DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Vercel Documentation](https://vercel.com/docs)

## License

MIT License - feel free to use this as a template for your own projects.
