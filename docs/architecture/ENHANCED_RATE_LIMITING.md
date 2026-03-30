# Enhanced Rate Limiting

## Overview

Enhanced per-route rate limiting with IP-based and user-based tracking, admin bypass, and comprehensive monitoring capabilities.

**Jira Ticket**: [KAN-26: Enhanced Rate Limiting](https://ratemyaccom.atlassian.net/browse/KAN-26)

## Features

✅ **Per-Route Configuration** - Different limits for each endpoint
✅ **IP-Based Limiting** - Track requests by IP address
✅ **User-Based Limiting** - Track authenticated requests by user ID
✅ **Admin Bypass** - Admins/moderators exempt from rate limits
✅ **Automatic Route Detection** - Smart mapping of paths to configurations
✅ **Monitoring API** - Admin endpoint to check and reset rate limits
✅ **Progressive Blocking** - Block duration increases on repeated violations
✅ **Standard Headers** - X-RateLimit-* headers on all responses

## Configuration

All rate limit configurations are in `lib/security/enhanced-rate-limiter.ts`:

### Authentication Endpoints

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| `/api/auth/login` | 5 requests | 15 minutes | 30 minutes |
| `/api/auth/register` | 3 requests | 1 hour | 24 hours |
| `/api/auth/verify` | 10 requests | 1 hour | 1 hour |
| `/api/auth/forgot-password` | 3 requests | 1 hour | 1 hour |
| `/api/auth/reset-password` | 5 requests | 1 hour | 1 hour |
| `/api/auth/refresh` | 20 requests | 1 minute | 5 minutes |

### Review Endpoints

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| `POST /api/reviews` (create) | 3 reviews | 24 hours | 24 hours |
| `PUT/PATCH /api/reviews` (update) | 10 requests | 1 hour | 1 hour |
| `DELETE /api/reviews` (delete) | 5 requests | 1 hour | 1 hour |
| `GET /api/reviews` (list) | 100 requests | 1 minute | 5 minutes |

### Accommodation Endpoints

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| `GET /api/accommodations` (list) | 60 requests | 1 minute | 5 minutes |
| `GET /api/accommodations/[id]` (detail) | 120 requests | 1 minute | 5 minutes |
| `GET /api/accommodations/search` | 60 requests | 1 minute | 5 minutes |

### Admin Endpoints

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| `/api/admin/unlock` | 20 requests | 1 minute | 5 minutes |
| `/api/admin/*` (general) | 50 requests | 1 minute | 5 minutes |

### Default (Fallback)

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| All other `/api/*` | 100 requests | 1 minute | 2 minutes |

## How It Works

### 1. Automatic Route Detection

```typescript
// Middleware automatically maps routes to configurations
POST /api/auth/login → auth:login (5 req/15min)
POST /api/reviews → review:create (3 req/24h)
GET /api/accommodations/123 → accommodation:detail (120 req/min)
```

### 2. Identifier Selection

**IP-Based** (default):
```
Rate limit key: auth:login:ip:192.168.1.100
```

**User-Based** (optional):
```
Rate limit key: review:create:user:cuid123abc
```

### 3. Admin Bypass

Admins and moderators are automatically exempt:
```typescript
// JWT contains role: "ADMIN" or "MODERATOR"
→ Rate limit bypassed
→ Returns: limit: Infinity, remaining: Infinity
```

### 4. Response Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2025-01-24T15:30:00.000Z
```

When rate limit exceeded (429):
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-01-24T15:45:00.000Z
Retry-After: 900
```

### 5. Block Duration

When limit is exceeded, the IP/user is blocked:
```
1st violation: Blocked for configured duration
2nd violation: Same duration (per route)
Subsequent: Same duration per route
```

## Usage

### Automatic (Recommended)

Rate limiting is applied automatically to all `/api/*` routes via middleware:

```typescript
// No code needed - just make API calls
// Middleware handles everything
```

### Manual Application

For custom use cases in API routes:

```typescript
import { applyRateLimit } from '@/lib/security/enhanced-rate-limiter';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, {
    routeKey: 'review:create', // Optional: override auto-detection
    useUserBasedLimit: true, // Optional: use user ID instead of IP
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: rateLimitResult.error,
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Continue with request processing
}
```

### User-Based Rate Limiting

Enable user-based tracking for authenticated endpoints:

```typescript
// Track by user ID instead of IP
const result = await applyRateLimit(request, {
  useUserBasedLimit: true,
});

// Key becomes: review:create:user:cuid123abc
// Prevents users from bypassing limits with VPN/proxies
```

## Admin Monitoring

### Get All Configurations

```bash
GET /api/admin/rate-limit-status

# Response
{
  "success": true,
  "data": {
    "configurations": {...},
    "availableKeys": ["auth:login", "review:create", ...]
  }
}
```

### Check Specific Rate Limit

```bash
GET /api/admin/rate-limit-status?key=auth:login&identifier=ip:192.168.1.100

# Response
{
  "success": true,
  "data": {
    "key": "auth:login",
    "identifier": "ip:192.168.1.100",
    "status": {
      "limit": 5,
      "remaining": 2,
      "consumed": 3,
      "resetTime": "2025-01-24T15:30:00.000Z",
      "isBlocked": false
    },
    "configuration": {
      "points": 5,
      "duration": 900,
      "blockDuration": 1800
    }
  }
}
```

### Reset Rate Limit

```bash
POST /api/admin/rate-limit-status/reset
Content-Type: application/json

{
  "key": "auth:login",
  "identifier": "ip:192.168.1.100"
}

# Response
{
  "success": true,
  "message": "Rate limit reset successfully",
  "data": {
    "key": "auth:login",
    "identifier": "ip:192.168.1.100",
    "resetAt": "2025-01-24T14:45:00.000Z"
  }
}
```

## Testing

### Manual Testing

#### Test Rate Limit

```bash
# Make requests until rate limit hit
for i in {1..6}; do
  echo "Request $i:"
  curl -i http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@unsw.edu.au","password":"wrong"}'
  echo "\n---"
  sleep 1
done

# Request 6 should return 429
```

#### Check Headers

```bash
curl -i http://localhost:3000/api/accommodations

# Look for headers:
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 59
# X-RateLimit-Reset: 2025-01-24T15:30:00.000Z
```

#### Test Admin Bypass

```bash
# Login as admin
TOKEN=$(curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unsw.edu.au","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Make many requests - should not be rate limited
for i in {1..100}; do
  curl -s http://localhost:3000/api/accommodations \
    -H "Cookie: auth-token=$TOKEN" \
    | jq -r '.success'
done

# All should succeed
```

### Automated Testing

```typescript
import { applyRateLimit } from '@/lib/security/enhanced-rate-limiter';

describe('Enhanced Rate Limiting', () => {
  it('should block after limit exceeded', async () => {
    const mockRequest = createMockRequest('/api/auth/login');

    // Make 5 requests (the limit)
    for (let i = 0; i < 5; i++) {
      const result = await applyRateLimit(mockRequest);
      expect(result.success).toBe(true);
    }

    // 6th request should be blocked
    const result = await applyRateLimit(mockRequest);
    expect(result.success).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should bypass for admins', async () => {
    const mockAdminRequest = createMockRequest('/api/auth/login', {
      role: 'ADMIN',
    });

    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      const result = await applyRateLimit(mockAdminRequest);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(Infinity);
    }
  });

  it('should use user-based limiting', async () => {
    const mockRequest = createMockRequest('/api/reviews', {
      userId: 'user123',
    });

    const result = await applyRateLimit(mockRequest, {
      useUserBasedLimit: true,
    });

    expect(result.key).toContain('user:user123');
  });
});
```

## Customization

### Add New Route Configuration

Edit `lib/security/enhanced-rate-limiter.ts`:

```typescript
export const RATE_LIMIT_CONFIGS = {
  // ... existing configs

  // Add new route
  'my-endpoint:custom': {
    points: 10,
    duration: 60, // 1 minute
    blockDuration: 5 * 60, // 5 minutes
    keyPrefix: 'rl:my-endpoint',
  },
};
```

### Update Route Mapping

Edit `getRateLimitKey()` function:

```typescript
export function getRateLimitKey(request: NextRequest): string {
  const path = request.nextUrl.pathname;

  // Add custom mapping
  if (path.includes('/api/my-endpoint')) return 'my-endpoint:custom';

  // ... existing mappings
}
```

### Change Limits

Modify values in `RATE_LIMIT_CONFIGS`:

```typescript
'auth:login': {
  points: 10, // Change from 5 to 10
  duration: 15 * 60, // Keep 15 minutes
  blockDuration: 60 * 60, // Change from 30 to 60 minutes
  keyPrefix: 'rl:login',
},
```

## Upgrading to Redis

For production with multiple servers, use Redis:

### 1. Install Redis Client

```bash
npm install redis
```

### 2. Update Rate Limiter

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'redis';

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL,
});

// Replace RateLimiterMemory with RateLimiterRedis
const rateLimiters: Record<string, RateLimiterRedis> = {};

for (const [key, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
  rateLimiters[key] = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: config.keyPrefix,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration,
  });
}
```

### 3. Add to Environment

```env
REDIS_URL="redis://localhost:6379"
```

## Security Considerations

### ✅ Implemented

1. **Per-Route Limits** - Fine-grained control over each endpoint
2. **IP Tracking** - Prevents single IP from abusing
3. **User Tracking** - Prevents authenticated users bypassing with VPN
4. **Admin Bypass** - Legitimate admins not hindered
5. **Standard Headers** - Clients can self-limit
6. **Block Duration** - Violators locked out temporarily
7. **Automatic Detection** - No manual configuration needed
8. **Health Check Exempt** - Monitoring always works

### ⚠️ Important Notes

1. **Memory vs Redis**:
   - Current: In-memory (per server)
   - Production: Use Redis (shared across servers)

2. **IP Spoofing**:
   - Trust x-forwarded-for from verified proxies only
   - Use Cloudflare CF-Connecting-IP if behind Cloudflare

3. **Distributed Systems**:
   - In-memory limits are per-instance
   - User can hit different servers
   - Solution: Redis or sticky sessions

4. **Admin Bypass**:
   - Only for ADMIN/MODERATOR roles
   - JWT must be valid
   - Can be disabled with `skipAdminCheck: true`

### 🔐 Best Practices

1. **Monitor Violations**: Track 429 responses
2. **Adjust Limits**: Based on legitimate usage patterns
3. **User Communication**: Document rate limits in API docs
4. **Graceful Degradation**: Show retry time to users
5. **Whitelist**: Consider IP whitelist for trusted partners

## Troubleshooting

### Issue: Rate limit too restrictive

**Symptoms**: Legitimate users hit limits

**Solutions**:
1. Check logs for patterns
2. Increase `points` for affected route
3. Increase `duration` (wider window)
4. Consider user-based instead of IP-based

### Issue: Rate limit not working

**Symptoms**: No 429 responses despite many requests

**Solutions**:
1. Check middleware is running
2. Verify route mapping in `getRateLimitKey()`
3. Check admin bypass isn't incorrectly triggered
4. Verify headers are present

### Issue: Different limits on different servers

**Symptoms**: Inconsistent rate limiting

**Solutions**:
1. Upgrade to Redis for shared state
2. Use sticky sessions
3. Document per-server limits

### Issue: Admin can't bypass

**Symptoms**: Admin users hit rate limits

**Solutions**:
1. Check JWT contains correct role
2. Verify `isAdmin()` function logic
3. Check `skipAdminCheck` isn't set to true
4. Verify auth-token cookie is set

## Files Created/Modified

### Created

1. **lib/security/enhanced-rate-limiter.ts** - Core enhanced rate limiting
2. **app/api/admin/rate-limit-status/route.ts** - Monitoring endpoint
3. **ENHANCED_RATE_LIMITING.md** - This documentation

### Modified

1. **middleware.ts** - Updated to use enhanced rate limiter

## Response Examples

### Success (200)

```json
{
  "success": true,
  "data": {...}
}

Headers:
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-01-24T15:31:00.000Z
```

### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 120 seconds.",
  "retryAfter": 120,
  "resetTime": "2025-01-24T15:32:00.000Z"
}

Headers:
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-01-24T15:32:00.000Z
Retry-After: 120
```

## Related Documentation

- [Account Lockout](./ACCOUNT_LOCKOUT.md)
- [CSRF Protection](./CSRF_PROTECTION.md)
- [Security Headers](./lib/security/headers.ts)
- [KAN-26: Enhanced Rate Limiting](https://ratemyaccom.atlassian.net/browse/KAN-26)

## Summary

| Feature | Status |
|---------|--------|
| Per-route configs | ✅ 15+ routes configured |
| IP-based limiting | ✅ Default mode |
| User-based limiting | ✅ Optional mode |
| Admin bypass | ✅ Automatic detection |
| Monitoring API | ✅ Admin endpoint |
| Standard headers | ✅ All responses |
| Redis support | ⚠️ Ready (needs setup) |
| Documentation | ✅ Complete |
