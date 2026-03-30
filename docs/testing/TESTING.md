# Testing Documentation

This document describes the testing setup and how to run tests for the RateMyAccom project.

## Testing Stack

- **Jest**: Testing framework
- **Testing Library**: React component testing
- **Playwright**: End-to-end testing
- **jest-mock-extended**: Prisma mocking
- **node-mocks-http**: HTTP request/response mocking

## Test Structure

```
__tests__/
├── api/
│   ├── auth/              # Authentication endpoint tests
│   │   ├── register.test.ts
│   │   ├── login.test.ts
│   │   ├── logout.test.ts
│   │   └── verify.test.ts
│   ├── users/             # User profile endpoint tests
│   │   └── users.test.ts
│   ├── reviews/           # Review endpoint tests
│   │   └── reviews.test.ts
│   └── accommodations/    # Accommodation endpoint tests
│       └── accommodations.test.ts
└── utils/
    ├── test-helpers.ts    # Common test utilities
    └── prisma-mock.ts     # Database mocking utilities
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run E2E tests
```bash
npm run test:e2e
```

### Run E2E tests with UI
```bash
npm run test:e2e:ui
```

## Test Coverage Goals

The project aims for the following coverage thresholds:
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Writing Tests

### Authentication Test Example

```typescript
import { POST } from '@/app/api/auth/login/route';
import { createMockRequest, parseJsonResponse } from '@/__tests__/utils/test-helpers';
import { prismaMock } from '@/__tests__/utils/prisma-mock';

describe('POST /api/auth/login', () => {
  it('should login successfully', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: { email: 'test@unsw.edu.au', password: 'TestPass123' },
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### Using Test Helpers

```typescript
// Create unauthenticated request
const request = createMockRequest({
  method: 'POST',
  body: { name: 'Test' },
});

// Create authenticated request
const user = createMockUser();
const authRequest = createAuthenticatedRequest(user, {
  method: 'POST',
  body: { name: 'Test' },
});

// Create admin request
const admin = createMockAdmin();
const adminRequest = createAuthenticatedRequest(admin, {
  method: 'DELETE',
});
```

## Continuous Integration

The project uses GitHub Actions for CI/CD:

### Workflows

1. **Lint & Type Check**
   - ESLint validation
   - TypeScript type checking
   - Prettier formatting check

2. **Unit & Integration Tests**
   - Run Jest tests with coverage
   - Upload coverage to Codecov
   - PostgreSQL service for database tests

3. **E2E Tests**
   - Playwright browser tests
   - Full application testing
   - Upload test reports as artifacts

4. **Build Check**
   - Verify production build succeeds
   - Check bundle sizes

### Pipeline Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## Environment Variables for Testing

Set in `jest.setup.js`:
```javascript
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jwt';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/ratemyaccom_test?schema=public';
```

## Test Database Setup

For local testing with real database:

```bash
# Create test database
createdb ratemyaccom_test

# Run migrations
DATABASE_URL="postgresql://postgres:password@localhost:5432/ratemyaccom_test?schema=public" npx prisma migrate deploy

# Run tests
npm test
```

## Best Practices

1. **Mock External Dependencies**: Always mock Prisma, external APIs, and file system
2. **Test Edge Cases**: Invalid inputs, missing auth, permission denied
3. **Clear Mocks**: Reset mocks in `beforeEach` hooks
4. **Descriptive Test Names**: Use clear, specific test descriptions
5. **Test One Thing**: Each test should verify a single behavior
6. **Use Test Helpers**: Leverage utility functions for common patterns

## Debugging Tests

```bash
# Run specific test file
npm test -- register.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should login"

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

## Common Issues

### Prisma Mock Not Working
Ensure you import the mock before the module:
```typescript
import { prismaMock } from '@/__tests__/utils/prisma-mock';
// This must be imported after the mock setup
import { POST } from '@/app/api/auth/register/route';
```

### Test Timeout
Increase timeout for slow tests:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Database Connection Issues
Make sure PostgreSQL is running and accessible:
```bash
# Check if PostgreSQL is running
pg_isready

# Verify test database exists
psql -l | grep ratemyaccom_test
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
