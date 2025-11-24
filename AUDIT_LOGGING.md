# Audit Logging System

## Overview

Comprehensive audit logging system that tracks all authentication, authorization, security, and data operation events in the RateMyAccom application.

**Jira Ticket**: [KAN-28: Audit Logging](https://ratemyaccom.atlassian.net/browse/KAN-28)

## Features

✅ **Comprehensive Event Tracking** - 25+ event types covering all security operations
✅ **Automatic Integration** - Integrated into all auth endpoints
✅ **User & IP Tracking** - Records both authenticated users and IP addresses
✅ **Admin Interface** - Full-featured admin API for viewing and managing logs
✅ **Advanced Filtering** - Filter by event type, status, user, IP, date range
✅ **Statistics Dashboard** - Real-time statistics and security insights
✅ **Retention Policy** - Automated cleanup of old logs
✅ **Structured Metadata** - Rich context stored as JSON for each event

## Event Types Tracked

### Authentication Events

| Event Type | Description | When Logged |
|------------|-------------|-------------|
| `AUTH_LOGIN` | User login | Successful/failed login attempts |
| `AUTH_REGISTER` | User registration | New account creation |
| `AUTH_LOGOUT` | User logout | User signs out |
| `AUTH_VERIFY_EMAIL` | Email verification | Email address verified |
| `AUTH_REFRESH_TOKEN` | Token refresh | Access token refreshed |

### Account Security Events

| Event Type | Description | When Logged |
|------------|-------------|-------------|
| `ACCOUNT_LOCKED` | Account locked | Too many failed login attempts |
| `ACCOUNT_UNLOCKED` | Account unlocked | Admin unlocks or auto-unlock |
| `PASSWORD_CHANGED` | Password changed | User resets/changes password |
| `PASSWORD_RESET_REQUESTED` | Password reset request | User requests password reset |

### Authorization Events

| Event Type | Description | When Logged |
|------------|-------------|-------------|
| `PERMISSION_DENIED` | Access denied | User attempts unauthorized action |
| `ROLE_CHANGED` | User role changed | Admin modifies user role |

### Security Events

| Event Type | Description | When Logged |
|------------|-------------|-------------|
| `RATE_LIMIT_EXCEEDED` | Rate limit hit | Too many requests from IP/user |
| `CSRF_VALIDATION_FAILED` | CSRF check failed | Invalid/missing CSRF token |
| `SUSPICIOUS_ACTIVITY` | Suspicious behavior | Anomalous patterns detected |

### Data Operation Events

| Event Type | Description | When Logged |
|------------|-------------|-------------|
| `REVIEW_CREATED` | Review posted | User creates review |
| `REVIEW_UPDATED` | Review edited | User updates review |
| `REVIEW_DELETED` | Review removed | User/admin deletes review |
| `REVIEW_FLAGGED` | Review reported | Review flagged for moderation |

### Admin Events

| Event Type | Description | When Logged |
|------------|-------------|-------------|
| `ADMIN_ACTION` | Admin operation | Any admin action performed |
| `DATA_EXPORT` | Data exported | Admin exports user data |
| `SETTINGS_CHANGED` | Settings modified | Admin changes system settings |

## Event Status Types

| Status | Description | Use Case |
|--------|-------------|----------|
| `SUCCESS` | Operation completed successfully | Normal operations |
| `FAILURE` | Operation failed | Failed attempts |
| `WARNING` | Potentially concerning event | Rate limits, suspicious activity |
| `INFO` | Informational event | General tracking |

## Database Schema

```prisma
model AuditLog {
  id              String            @id @default(cuid())

  // Event information
  eventType       AuditEventType
  eventAction     String            // 'success', 'failure', 'locked', etc.
  eventStatus     AuditEventStatus

  // User information (if authenticated)
  userId          String?
  userEmail       String?
  userName        String?
  userRole        String?

  // Request information
  ipAddress       String
  userAgent       String?
  requestPath     String?
  requestMethod   String?

  // Additional context
  metadata        Json?             // Flexible JSON for event-specific data
  message         String?           // Human-readable description
  errorMessage    String?           // Error details for failures

  createdAt       DateTime          @default(now())

  @@index([eventType])
  @@index([eventStatus])
  @@index([userId])
  @@index([userEmail])
  @@index([ipAddress])
  @@index([createdAt])
}
```

## Usage

### Logging Events in Code

#### Authentication Events

```typescript
import {
  logLoginSuccess,
  logLoginFailure,
  logRegistration,
  logEmailVerification,
  logLogout
} from '@/lib/security/audit-logger';

// Successful login
await logLoginSuccess(request, {
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

// Failed login
await logLoginFailure(request, email, 'Invalid password', {
  attemptsRemaining: 3,
});

// Registration
await logRegistration(request, {
  id: user.id,
  email: user.email,
  name: user.name,
  university: user.university,
});

// Email verification
await logEmailVerification(request, {
  id: user.id,
  email: user.email,
  name: user.name,
});

// Logout
await logLogout(request, {
  id: user.id,
  email: user.email,
  name: user.name,
});
```

#### Account Security Events

```typescript
import {
  logAccountLocked,
  logAccountUnlocked,
  logPasswordChange,
} from '@/lib/security/audit-logger';

// Account locked
await logAccountLocked(
  ipAddress,
  { id: user.id, email: user.email, name: user.name },
  lockedUntil,
  { attempts: 5, lockDuration: '30 minutes' }
);

// Account unlocked
await logAccountUnlocked(
  ipAddress,
  { id: user.id, email: user.email, name: user.name },
  { id: admin.id, email: admin.email, name: admin.name } // Admin who unlocked
);

// Password changed
await logPasswordChange(request, {
  id: user.id,
  email: user.email,
  name: user.name,
});
```

#### Authorization Events

```typescript
import { logPermissionDenied } from '@/lib/security/audit-logger';

// Permission denied
await logPermissionDenied(
  request,
  'User role USER cannot access admin endpoint',
  {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
);
```

#### Security Events

```typescript
import {
  logRateLimitExceeded,
  logCsrfFailure,
  logSuspiciousActivity,
} from '@/lib/security/audit-logger';

// Rate limit exceeded
await logRateLimitExceeded(request, 'auth:login', {
  id: user?.id,
  email: user?.email,
});

// CSRF validation failed
await logCsrfFailure(request);

// Suspicious activity
await logSuspiciousActivity(request, 'Multiple failed logins from different IPs', {
  ipAddresses: ['192.168.1.1', '192.168.1.2'],
  timeWindow: '5 minutes',
});
```

#### Data Operation Events

```typescript
import {
  logReviewCreated,
  logReviewUpdated,
  logReviewDeleted,
} from '@/lib/security/audit-logger';

// Review created
await logReviewCreated(request, {
  id: user.id,
  email: user.email,
  name: user.name,
}, accommodationId);

// Review updated
await logReviewUpdated(request, {
  id: user.id,
  email: user.email,
  name: user.name,
}, reviewId);

// Review deleted
await logReviewDeleted(
  request,
  { id: user.id, email: user.email, name: user.name },
  reviewId,
  { id: admin.id, email: admin.email, role: admin.role } // Optional: who deleted
);
```

#### Admin Events

```typescript
import { logAdminAction } from '@/lib/security/audit-logger';

// Generic admin action
await logAdminAction(
  request,
  { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  'ban_user',
  { id: targetUser.id, email: targetUser.email },
  { reason: 'Spam reviews', duration: '30 days' }
);
```

### Custom Audit Logging

For events not covered by helper functions:

```typescript
import { logAuditEvent, AuditEventType, AuditEventStatus } from '@/lib/security/audit-logger';

await logAuditEvent({
  eventType: AuditEventType.ADMIN_ACTION,
  eventAction: 'custom_action',
  eventStatus: AuditEventStatus.SUCCESS,
  ipAddress: '192.168.1.1',
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  userRole: user.role,
  userAgent: 'Mozilla/5.0...',
  requestPath: '/api/admin/custom',
  requestMethod: 'POST',
  message: 'Custom admin action performed',
  metadata: {
    customField: 'value',
    timestamp: new Date().toISOString(),
  },
});
```

## Admin API

### 1. View Audit Logs

**Endpoint**: `GET /api/admin/audit-logs`

**Authentication**: Admin or Moderator role required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Results per page (max 100, default: 50) | `?limit=25` |
| `eventType` | AuditEventType | Filter by event type | `?eventType=AUTH_LOGIN` |
| `eventStatus` | AuditEventStatus | Filter by status | `?eventStatus=FAILURE` |
| `userId` | string | Filter by user ID | `?userId=cuid123` |
| `userEmail` | string | Filter by email (partial match) | `?userEmail=john@unsw.edu.au` |
| `ipAddress` | string | Filter by IP address | `?ipAddress=192.168.1.1` |
| `startDate` | ISO date | Filter from date | `?startDate=2025-01-01T00:00:00Z` |
| `endDate` | ISO date | Filter to date | `?endDate=2025-01-24T23:59:59Z` |

**Example Request**:

```bash
curl -X GET "http://localhost:3000/api/admin/audit-logs?eventType=AUTH_LOGIN&eventStatus=FAILURE&page=1&limit=25" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN"
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "cm5a1b2c3d4e5f6g7h8i9j0k",
        "eventType": "AUTH_LOGIN",
        "eventAction": "failure",
        "eventStatus": "FAILURE",
        "userId": null,
        "userEmail": "user@unsw.edu.au",
        "userName": null,
        "userRole": null,
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "requestPath": "/api/auth/login",
        "requestMethod": "POST",
        "message": "Failed login attempt for user@unsw.edu.au",
        "errorMessage": "Invalid credentials",
        "metadata": {
          "attemptsRemaining": 3
        },
        "createdAt": "2025-01-24T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 125,
      "limit": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "eventType": "AUTH_LOGIN",
      "eventStatus": "FAILURE",
      "userId": null,
      "userEmail": null,
      "ipAddress": null,
      "startDate": null,
      "endDate": null
    }
  }
}
```

### 2. View Audit Log Statistics

**Endpoint**: `GET /api/admin/audit-logs/stats`

**Authentication**: Admin or Moderator role required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | ISO date | Statistics from date | `?startDate=2025-01-01T00:00:00Z` |
| `endDate` | ISO date | Statistics to date | `?endDate=2025-01-24T23:59:59Z` |

**Example Request**:

```bash
curl -X GET "http://localhost:3000/api/admin/audit-logs/stats?startDate=2025-01-01T00:00:00Z" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN"
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalLogs": 15234,
      "recentFailures24h": 42,
      "suspiciousActivityCount": 8
    },
    "breakdown": {
      "byEventType": [
        { "eventType": "AUTH_LOGIN", "count": 8432 },
        { "eventType": "REVIEW_CREATED", "count": 3210 },
        { "eventType": "AUTH_LOGOUT", "count": 2156 }
      ],
      "byEventStatus": [
        { "eventStatus": "SUCCESS", "count": 14012 },
        { "eventStatus": "FAILURE", "count": 892 },
        { "eventStatus": "WARNING", "count": 330 }
      ],
      "topIpAddresses": [
        { "ipAddress": "192.168.1.100", "count": 432 },
        { "ipAddress": "10.0.0.50", "count": 289 }
      ]
    },
    "timeRange": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "all"
    }
  }
}
```

### 3. Cleanup Old Audit Logs

**Endpoint**: `POST /api/admin/audit-logs/cleanup`

**Authentication**: Admin role required (NOT moderator)

**Request Body**:

```typescript
{
  olderThanDays: number;      // Delete logs older than this (minimum 7 days)
  eventTypes?: string[];      // Optional: Only delete specific event types
}
```

**Example Request**:

```bash
curl -X POST "http://localhost:3000/api/admin/audit-logs/cleanup" \
  -H "Cookie: auth-token=YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "olderThanDays": 90,
    "eventTypes": ["REVIEW_CREATED", "REVIEW_UPDATED"]
  }'
```

**Example Response**:

```json
{
  "success": true,
  "message": "Successfully deleted 1234 audit log(s)",
  "data": {
    "deletedCount": 1234,
    "cutoffDate": "2024-10-26T00:00:00.000Z",
    "olderThanDays": 90,
    "eventTypes": ["REVIEW_CREATED", "REVIEW_UPDATED"]
  }
}
```

## Retention Policy

### Recommended Retention Periods

| Event Category | Recommended Retention | Rationale |
|----------------|----------------------|-----------|
| **Authentication Events** | 90 days | Investigate security incidents |
| **Account Security Events** | 1 year | Legal/compliance requirements |
| **Authorization Events** | 90 days | Security audits |
| **Security Events** | 180 days | Threat analysis |
| **Data Operations** | 30 days | General activity tracking |
| **Admin Actions** | 1 year | Accountability |

### Automated Cleanup Script

Create a cron job or scheduled task:

```typescript
// scripts/cleanup-audit-logs.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldLogs() {
  const ninety DaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: ninetyDaysAgo,
      },
      eventType: {
        in: ['REVIEW_CREATED', 'REVIEW_UPDATED', 'AUTH_LOGIN'],
      },
    },
  });

  console.log(`Deleted ${result.count} old audit logs`);
}

cleanupOldLogs();
```

Run daily via cron:

```bash
0 2 * * * node scripts/cleanup-audit-logs.ts
```

## Query Examples

### Find All Failed Login Attempts for a User

```typescript
const failedLogins = await prisma.auditLog.findMany({
  where: {
    eventType: 'AUTH_LOGIN',
    eventStatus: 'FAILURE',
    userEmail: 'user@unsw.edu.au',
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});
```

### Find Suspicious Activity in Last 24 Hours

```typescript
const suspicious = await prisma.auditLog.findMany({
  where: {
    eventType: 'SUSPICIOUS_ACTIVITY',
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Find All Admin Actions by Specific Admin

```typescript
const adminActions = await prisma.auditLog.findMany({
  where: {
    eventType: 'ADMIN_ACTION',
    userId: adminId,
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Find All Actions from Specific IP

```typescript
const ipActions = await prisma.auditLog.findMany({
  where: {
    ipAddress: '192.168.1.100',
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

## Best Practices

### 1. **Log Everything Security-Related**

Always log:
- Authentication attempts (success and failure)
- Authorization failures
- Password changes
- Account locks/unlocks
- Admin actions
- Security events (CSRF, rate limits, etc.)

### 2. **Include Rich Context**

Use the `metadata` field to store additional context:

```typescript
await logLoginFailure(request, email, 'Invalid password', {
  attemptsRemaining: 3,
  lockoutThreshold: 5,
  lockoutDuration: '30 minutes',
  userAgent: request.headers.get('user-agent'),
});
```

### 3. **Don't Log Sensitive Data**

❌ **Never log**:
- Passwords (plain or hashed)
- CSRF tokens
- Session tokens
- Credit card numbers
- Full authentication tokens

✅ **Safe to log**:
- User IDs
- Email addresses
- IP addresses
- Timestamps
- Event types
- Success/failure status

### 4. **Monitor Critical Events**

Set up alerts for:
- Multiple failed logins from same IP
- Account lockouts
- Suspicious activity
- Permission denied events
- Admin actions

### 5. **Regular Reviews**

- Review audit logs weekly for patterns
- Investigate suspicious activity
- Verify admin actions are legitimate
- Check for brute force attempts

### 6. **Compliance & Legal**

- Retain logs for required periods
- Document retention policy
- Secure access to logs (admin only)
- Consider GDPR implications

## Security Considerations

### ✅ Implemented

1. **Admin-Only Access** - Only admins/moderators can view logs
2. **Rich Context** - Stores IP, user agent, request details
3. **Automatic Logging** - Integrated into all auth endpoints
4. **Structured Data** - JSON metadata for flexible queries
5. **Indexed Fields** - Fast queries on common fields
6. **Retention Policy** - Cleanup endpoint for old logs

### ⚠️ Important Notes

1. **PII Considerations**:
   - Logs contain email addresses and IP addresses (PII)
   - Document in privacy policy
   - Respect data deletion requests (GDPR)

2. **Storage Growth**:
   - High-traffic apps generate many logs
   - Implement automated cleanup
   - Consider archiving old logs

3. **Performance**:
   - Audit logging is non-blocking (async)
   - Errors in logging don't break app
   - Database indexes optimize queries

4. **Tampering Protection**:
   - Current: Logs stored in database
   - Enhanced: Consider write-once storage
   - Advanced: Cryptographic signatures

## Troubleshooting

### Issue: Logs not appearing

**Solutions**:
1. Check database connection
2. Verify Prisma schema is migrated
3. Check console for errors (logging failures are logged)
4. Ensure function is awaited: `await logLoginSuccess(...)`

### Issue: Too many logs slowing down database

**Solutions**:
1. Add database indexes (already included in schema)
2. Implement retention policy (cleanup old logs)
3. Archive old logs to separate storage
4. Consider pagination when querying

### Issue: Missing context in logs

**Solutions**:
1. Use helper functions (they extract IP, user agent automatically)
2. Pass metadata object with additional context
3. Check request object is being passed correctly

## Files Created/Modified

### Created

1. **lib/security/audit-logger.ts** (~500 lines) - Core audit logging utilities
2. **app/api/admin/audit-logs/route.ts** - Admin viewing endpoint
3. **app/api/admin/audit-logs/stats/route.ts** - Statistics endpoint
4. **app/api/admin/audit-logs/cleanup/route.ts** - Cleanup endpoint
5. **AUDIT_LOGGING.md** - This documentation

### Modified

1. **prisma/schema.prisma** - Added AuditLog model and enums
2. **app/api/auth/login/route.ts** - Added login success/failure logging
3. **app/api/auth/register/route.ts** - Added registration logging
4. **app/api/auth/verify/route.ts** - Added email verification logging
5. **app/api/auth/logout/route.ts** - Added logout logging
6. **app/api/auth/reset-password/route.ts** - Added password change logging

## Database Migration

After implementing audit logging, run the migration:

```bash
# Generate migration
npx prisma migrate dev --name add_audit_logging

# Apply migration
npx prisma migrate deploy
```

## Related Documentation

- [Enhanced Rate Limiting](./ENHANCED_RATE_LIMITING.md)
- [Account Lockout](./ACCOUNT_LOCKOUT.md)
- [CSRF Protection](./CSRF_PROTECTION.md)
- [KAN-28: Audit Logging](https://ratemyaccom.atlassian.net/browse/KAN-28)

## Summary

| Feature | Status |
|---------|--------|
| Database schema | ✅ Complete |
| Audit logger utilities | ✅ 15+ helper functions |
| Auth endpoint integration | ✅ All major endpoints |
| Admin viewing API | ✅ With filtering & pagination |
| Statistics API | ✅ Real-time insights |
| Cleanup/retention API | ✅ With safety limits |
| Documentation | ✅ Complete |
| Database migration | ⚠️ Ready to run |

## Next Steps

1. **Run database migration**:
   ```bash
   npx prisma migrate dev --name add_audit_logging
   ```

2. **Test admin endpoints**:
   - Login as admin
   - View logs at `/api/admin/audit-logs`
   - Check statistics at `/api/admin/audit-logs/stats`

3. **Set up monitoring**:
   - Create dashboard for critical events
   - Set up alerts for suspicious activity
   - Schedule regular log reviews

4. **Implement retention policy**:
   - Set up cron job for automated cleanup
   - Document retention periods in privacy policy
   - Archive important logs before deletion
