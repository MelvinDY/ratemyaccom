# CSRF Protection Implementation

## Overview

Cross-Site Request Forgery (CSRF) protection has been implemented to prevent unauthorized state-changing requests to the API.

## How It Works

### 1. Double-Submit Cookie Pattern

We use the **double-submit cookie pattern**:
- Server generates a CSRF token and sets it as a cookie
- Client reads the token from the cookie and includes it in request headers
- Server validates that both values match

### 2. Token Generation

- Tokens are randomly generated (32 bytes hex)
- Signed with HMAC-SHA256 using `CSRF_SECRET`
- Format: `{token}.{signature}`
- Valid for 24 hours

### 3. Automatic Protection

**Global Middleware** (`middleware.ts`):
- Validates CSRF tokens on all API requests
- Only for state-changing methods: POST, PUT, PATCH, DELETE
- Sets CSRF cookies on page requests
- Skips validation for webhooks and health checks

**API Client** (`lib/api/client.ts`):
- Automatically includes CSRF token in headers
- Fetches new token if missing
- Retries request if CSRF validation fails (403)

## Usage

### Client-Side (Automatic)

The API client handles CSRF tokens automatically. No action needed:

```typescript
import api from '@/lib/api/client';

// CSRF token is automatically included
await api.post('/reviews', { ... });
await api.put('/profile', { ... });
await api.delete('/reviews/123');
```

### Server-Side API Routes

#### Option 1: Automatic Global Validation

All API routes are automatically protected by the global middleware.

No additional code needed!

```typescript
// app/api/reviews/route.ts
export async function POST(request: NextRequest) {
  // CSRF already validated by global middleware
  const body = await request.json();
  // ... handle request
}
```

#### Option 2: Manual Validation (for fine-grained control)

```typescript
import { requireCsrf } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  // Manually validate CSRF
  const csrfError = requireCsrf(request);
  if (csrfError) {
    return csrfError; // Returns 403 response
  }

  // ... handle request
}
```

#### Option 3: Combined with Authentication

```typescript
import { requireVerifiedAndCsrf } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Validates CSRF + authentication + email verification
    const { user } = await requireVerifiedAndCsrf(request);

    // User is authenticated and CSRF is valid
    // ... handle request
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    );
  }
}
```

### Skipping CSRF Validation

To skip CSRF validation for specific paths (e.g., webhooks), update `middleware.ts`:

```typescript
// In validateCsrfMiddleware function
const skipPaths = [
  '/api/webhooks/',
  '/api/health',
  '/api/your-custom-path',
];
```

Or in your API route:

```typescript
export async function POST(request: NextRequest) {
  // Skip CSRF for webhooks
  if (request.headers.get('x-webhook-signature')) {
    // Validate webhook signature instead
    // ... handle webhook
  }

  // Regular request - CSRF validated by middleware
}
```

## Testing

### Manual Testing

1. **Get CSRF Token**:
```bash
curl -c cookies.txt http://localhost:3000/api/auth/csrf
```

2. **Make Request with CSRF Token**:
```bash
# Extract token from cookies
TOKEN=$(grep csrf_token cookies.txt | awk '{print $7}')

# Make authenticated request
curl -X POST http://localhost:3000/api/reviews \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{"rating":5,"text":"Great place!"}'
```

3. **Test CSRF Failure** (should return 403):
```bash
curl -X POST http://localhost:3000/api/reviews \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: invalid-token" \
  -d '{"rating":5,"text":"Great place!"}'
```

### Frontend Testing

Open browser console and test:

```javascript
// Should work (CSRF token automatically included)
await fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ rating: 5, text: 'Test' })
});

// Should fail with 403 (missing CSRF token)
await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': 'invalid-token'
  },
  credentials: 'include',
  body: JSON.stringify({ rating: 5, text: 'Test' })
});
```

## Security Considerations

### ✅ Implemented

1. **Cryptographic Signatures**: Tokens are HMAC-signed to prevent forgery
2. **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual` to prevent timing attacks
3. **httpOnly: false**: CSRF cookie must be readable by JavaScript (by design)
4. **SameSite: Lax**: Provides additional CSRF protection
5. **Automatic Retry**: Client automatically fetches new token if validation fails
6. **Token Rotation**: New tokens generated as needed

### ⚠️ Important Notes

1. **HTTPS in Production**: Always use HTTPS to prevent token interception
2. **Secure Cookie Flag**: Set to `true` in production (already configured)
3. **Secret Management**: Use strong random values for `CSRF_SECRET`
4. **Token Expiration**: Tokens expire after 24 hours
5. **Double-Submit Pattern**: Both cookie and header must match

### 🚫 What CSRF Protection Does NOT Prevent

1. **XSS Attacks**: Use Content Security Policy and input sanitization
2. **Replay Attacks**: Use nonces or timestamps if needed
3. **Man-in-the-Middle**: Use HTTPS
4. **SQL Injection**: Use parameterized queries
5. **Authentication Issues**: CSRF supplements but doesn't replace authentication

## Environment Configuration

### Required Environment Variables

```env
# .env.local
CSRF_SECRET="your-csrf-secret-here-change-in-production"
```

### Generate Strong Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

## Troubleshooting

### Issue: CSRF validation fails

**Symptoms**: 403 errors with "CSRF validation failed" message

**Solutions**:
1. Check that CSRF cookie is being set (check browser DevTools → Cookies)
2. Verify `CSRF_SECRET` is set in environment variables
3. Ensure `withCredentials: true` in API client config
4. Check that request includes `x-csrf-token` header
5. Clear browser cookies and try again

### Issue: CSRF token missing

**Symptoms**: No CSRF cookie in browser

**Solutions**:
1. Visit any page first to get CSRF cookie set by middleware
2. Call `/api/auth/csrf` endpoint to fetch token
3. Check middleware is running (should set cookie on all page requests)
4. Verify cookie is not being blocked by browser settings

### Issue: Token expiration

**Symptoms**: CSRF validation fails after 24 hours

**Solutions**:
- This is expected behavior
- Client automatically fetches new token on 403 error
- If still failing, clear cookies and refresh page

## API Endpoints

### GET /api/auth/csrf

Get a new CSRF token.

**Response**:
```json
{
  "success": true,
  "data": {
    "csrfToken": "abc123...def456"
  }
}
```

**Cookie Set**: `csrf_token` (24 hour expiration)

## Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. GET /page (or /api/auth/csrf)
       ▼
┌─────────────┐
│ Middleware  │ 2. Generate CSRF token
│             │ 3. Set csrf_token cookie
└──────┬──────┘
       │
       │ 4. Cookie sent to client
       ▼
┌─────────────┐
│   Client    │ 5. Read csrf_token from cookie
│             │ 6. Include in X-CSRF-Token header
└──────┬──────┘
       │
       │ 7. POST /api/reviews (with CSRF header)
       ▼
┌─────────────┐
│ Middleware  │ 8. Validate cookie === header
│             │ 9. Verify HMAC signature
└──────┬──────┘
       │
       │ 10. If valid, allow request
       ▼
┌─────────────┐
│ API Route   │ 11. Process request
│  Handler    │
└─────────────┘
```

## Files Modified

1. **lib/auth/csrf.ts** - Core CSRF utilities
2. **app/api/auth/csrf/route.ts** - CSRF token endpoint
3. **lib/auth/middleware.ts** - Auth + CSRF middleware
4. **middleware.ts** - Global CSRF validation
5. **lib/api/client.ts** - Automatic CSRF token handling
6. **.env.local** - CSRF_SECRET configuration

## Related

- [Authentication Documentation](./AUTHENTICATION.md)
- [Security Headers](./lib/security/headers.ts)
- [Rate Limiting](./lib/security/rate-limiter.ts)
- [KAN-27: CSRF Protection](https://ratemyaccom.atlassian.net/browse/KAN-27)
