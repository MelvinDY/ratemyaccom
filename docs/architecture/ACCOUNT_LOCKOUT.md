# Account Lockout Implementation

## Overview

Account lockout protection has been implemented to prevent brute force attacks by temporarily locking user accounts after multiple failed login attempts.

**Jira Ticket**: [KAN-24: Account Lockout](https://ratemyaccom.atlassian.net/browse/KAN-24)

## How It Works

### Lockout Trigger

- Account locks after **5 failed login attempts** within a **15-minute window**
- Failed attempts are tracked per user account
- Counter resets automatically after 15 minutes of no activity
- Counter resets immediately upon successful login

### Lockout Duration

**Progressive Lockout** is enabled:
- 1st lockout: **30 minutes**
- 2nd lockout: **60 minutes** (doubled)
- 3rd lockout: **120 minutes** (doubled again)
- Maximum: **24 hours**

### User Experience

1. **First few failed attempts**: Generic error message ("Invalid email or password")
2. **When 2 attempts remaining**: Warning message with remaining attempts
3. **After 5th failed attempt**: Account locks, email notification sent
4. **Locked account login attempt**: Clear message with unlock time
5. **After lockout expires**: Account automatically unlocks

## Configuration

All lockout settings are in `lib/auth/lockout.ts`:

```typescript
const MAX_FAILED_ATTEMPTS = 5; // Lock after 5 attempts
const LOCKOUT_DURATION_MINUTES = 30; // Initial lockout duration
const ATTEMPT_WINDOW_MINUTES = 15; // Reset window
const PROGRESSIVE_LOCKOUT = true; // Enable progressive lockout
```

## Database Schema

New fields added to `User` model:

```prisma
model User {
  // ... existing fields

  // Account lockout fields
  failedLoginAttempts Int      @default(0)
  lastFailedLogin     DateTime?
  lockedUntil         DateTime?
  lockoutCount        Int      @default(0)
}
```

**Migration**: Run `npm run db:migrate` to apply schema changes.

## API Endpoints

### 1. Login with Lockout Check

**Endpoint**: `POST /api/auth/login`

**Behavior**:
- Checks if account is locked before processing
- Records failed attempts on invalid password
- Resets failed attempts on successful login
- Sends email notification when account locks

**Response Codes**:
- `200`: Successful login
- `401`: Invalid credentials (with attempts remaining)
- `423`: Account locked (HTTP "Locked" status)
- `403`: Account not verified

**Response (Locked)**:
```json
{
  "success": false,
  "error": "Account locked",
  "message": "Account is temporarily locked due to multiple failed login attempts. Please try again in 28 minute(s).",
  "data": {
    "lockedUntil": "2025-01-24T15:30:00.000Z",
    "remainingMinutes": 28
  }
}
```

**Response (Failed with warning)**:
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Invalid email or password. You have 2 attempt(s) remaining before your account is temporarily locked.",
  "data": {
    "attemptsRemaining": 2
  }
}
```

### 2. Check Lockout Status

**Endpoint**: `GET /api/auth/lockout-status?email=user@example.com`

**Purpose**: Check if an account is locked before attempting login

**Response**:
```json
{
  "success": true,
  "data": {
    "isLocked": true,
    "lockedUntil": "2025-01-24T15:30:00.000Z",
    "remainingMinutes": 28,
    "message": "Account is locked. Please try again in 28 minute(s).",
    "config": {
      "maxFailedAttempts": 5,
      "lockoutDurationMinutes": 30,
      "attemptWindowMinutes": 15,
      "progressiveLockout": true
    }
  }
}
```

### 3. Admin Unlock Account

**Endpoint**: `POST /api/admin/unlock/[userId]`

**Authentication**: Requires ADMIN or MODERATOR role

**Purpose**: Manually unlock a user account

**Response**:
```json
{
  "success": true,
  "message": "Account unlocked successfully",
  "data": {
    "user": {
      "id": "user123",
      "email": "student@unsw.edu.au",
      "name": "John Doe"
    },
    "wasLocked": true,
    "unlockedAt": "2025-01-24T14:45:00.000Z",
    "previouslyLockedUntil": "2025-01-24T15:30:00.000Z"
  }
}
```

## Email Notifications

### Account Locked Email

Sent automatically when an account is locked.

**Subject**: `RateMyAccom account locked due to failed login attempts`

**Content**:
- Notification of lockout
- Unlock time
- Remaining minutes
- Security advice
- Contact support link

**Template**: `lib/email/templates.ts` → `accountLocked()`

**Example Email Preview**:
```
🔒 Account Temporarily Locked

Hi John Doe,

Your RateMyAccom account has been temporarily locked due to
multiple failed login attempts.

⏰ Locked Until:
24 Jan 2025, 3:30 PM (approximately 30 minutes from now)

Why was my account locked?
As a security measure, we temporarily lock accounts after several
unsuccessful login attempts. This helps protect your account from
unauthorized access.

What should I do?
• Wait until 24 Jan 2025, 3:30 PM before attempting to log in again
• Make sure you're using the correct password
• Check that Caps Lock is not enabled
• If you've forgotten your password, use the "Forgot Password" link

⚠️ Didn't attempt to log in?
If you didn't try to access your account, someone may have attempted
to gain unauthorized access. We recommend changing your password
immediately after your account is unlocked.
```

## Utility Functions

All functions are in `lib/auth/lockout.ts`:

### Check if Account is Locked

```typescript
import { isAccountLockedByEmail } from '@/lib/auth/lockout';

const lockStatus = await isAccountLockedByEmail('user@example.com');
if (lockStatus.locked) {
  console.log(`Locked until: ${lockStatus.lockedUntil}`);
  console.log(`Remaining: ${lockStatus.remainingMinutes} minutes`);
}
```

### Record Failed Login

```typescript
import { recordFailedLogin } from '@/lib/auth/lockout';

const result = await recordFailedLogin(userId);
if (result.shouldLock) {
  // Account was just locked
  console.log(`Locked until: ${result.lockedUntil}`);
} else {
  console.log(`Attempts remaining: ${result.attemptsRemaining}`);
}
```

### Reset Failed Attempts

```typescript
import { resetFailedAttempts } from '@/lib/auth/lockout';

// Called on successful login
await resetFailedAttempts(userId);
```

### Unlock Account (Admin)

```typescript
import { unlockAccount } from '@/lib/auth/lockout';

// Manually unlock an account
await unlockAccount(userId);
```

### Get Lockout Status

```typescript
import { getLockoutStatus } from '@/lib/auth/lockout';

const status = await getLockoutStatus(userId);
console.log(`Locked: ${status.isLocked}`);
console.log(`Failed attempts: ${status.failedAttempts}`);
console.log(`Total lockouts: ${status.lockoutCount}`);
```

## Testing

### Manual Testing

#### Test 1: Failed Login Attempts

```bash
# Attempt 1-4: Generic error
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@unsw.edu.au","password":"wrongpassword"}'

# Attempt 5: Account locks
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@unsw.edu.au","password":"wrongpassword"}'

# Expected: 423 status with lockout message
```

#### Test 2: Check Lockout Status

```bash
curl "http://localhost:3000/api/auth/lockout-status?email=student@unsw.edu.au"

# Expected: isLocked: true, with remaining time
```

#### Test 3: Admin Unlock

```bash
# Get admin auth token first (login as admin)
TOKEN="your-admin-token"

curl -X POST http://localhost:3000/api/admin/unlock/user123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Cookie: auth-token=$TOKEN"

# Expected: Account unlocked successfully
```

#### Test 4: Attempt Window Reset

```bash
# Make 3 failed attempts
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"student@unsw.edu.au","password":"wrong"}'
  sleep 1
done

# Wait 16 minutes (outside the 15-minute window)
# Make another attempt - counter should reset

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@unsw.edu.au","password":"wrong"}'

# Expected: Counter reset, 4 attempts remaining
```

### Automated Testing

Create test file: `__tests__/auth/lockout.test.ts`

```typescript
import { recordFailedLogin, resetFailedAttempts, isAccountLocked } from '@/lib/auth/lockout';

describe('Account Lockout', () => {
  it('should lock account after 5 failed attempts', async () => {
    // Record 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const result = await recordFailedLogin(userId);
      if (i < 4) {
        expect(result.shouldLock).toBe(false);
      } else {
        expect(result.shouldLock).toBe(true);
      }
    }

    // Check account is locked
    const isLocked = await isAccountLocked(userId);
    expect(isLocked).toBe(true);
  });

  it('should reset counter on successful login', async () => {
    // Record failed attempts
    await recordFailedLogin(userId);
    await recordFailedLogin(userId);

    // Reset
    await resetFailedAttempts(userId);

    // Verify reset
    const status = await getLockoutStatus(userId);
    expect(status.failedAttempts).toBe(0);
  });
});
```

## Security Considerations

### ✅ Implemented

1. **Progressive Lockout**: Duration increases with each lockout
2. **Time-based Reset**: Counter resets after 15 minutes of inactivity
3. **Email Notifications**: Users notified when locked
4. **Admin Controls**: Admins can manually unlock accounts
5. **Attempt Tracking**: All attempts logged with timestamps
6. **Generic Error Messages**: Don't reveal if email exists (until locked)

### ⚠️ Important Notes

1. **Email Enumeration**: When locked, the system must reveal the email exists
   - This is unavoidable - lockout protection requires confirming the account
   - Mitigated by rate limiting on the lockout-status endpoint

2. **Distributed Systems**: Current implementation uses database locks
   - For high-scale deployments, consider Redis for faster lookups
   - Add database connection pooling

3. **Account Recovery**: Ensure users can:
   - Reset password while locked
   - Contact support for manual unlock
   - See remaining lockout time

### 🔐 Best Practices

1. **Monitor Lockouts**: Track lockout frequency
2. **Alert on Patterns**: Detect coordinated attacks
3. **User Education**: Inform users about lockout policy
4. **Support Access**: Train support team on unlocking procedures
5. **Audit Trail**: Log all lockout/unlock events

## Troubleshooting

### Issue: Account locked indefinitely

**Solution**: Check `lockedUntil` timestamp in database

```sql
SELECT id, email, lockedUntil, failedLoginAttempts
FROM users
WHERE email = 'student@unsw.edu.au';
```

Admin can unlock via API or directly in database:

```sql
UPDATE users
SET lockedUntil = NULL, failedLoginAttempts = 0
WHERE email = 'student@unsw.edu.au';
```

### Issue: Counter not resetting

**Solution**: Check `lastFailedLogin` timestamp

```sql
SELECT email, failedLoginAttempts, lastFailedLogin,
       EXTRACT(EPOCH FROM (NOW() - lastFailedLogin))/60 AS minutes_since_last
FROM users
WHERE email = 'student@unsw.edu.au';
```

If > 15 minutes, counter should reset on next attempt.

### Issue: Email not sent

**Symptoms**: Account locks but user doesn't receive email

**Solutions**:
1. Check email service configuration (Resend API key)
2. Check application logs for email errors
3. Verify `FROM_EMAIL` environment variable
4. Email sending doesn't block lockout (fail gracefully)

### Issue: Progressive lockout not working

**Solution**: Check `PROGRESSIVE_LOCKOUT` configuration

```typescript
// In lib/auth/lockout.ts
const PROGRESSIVE_LOCKOUT = true; // Must be true
```

Check `lockoutCount` in database:

```sql
SELECT email, lockoutCount, lockedUntil
FROM users
WHERE email = 'student@unsw.edu.au';
```

## Files Created/Modified

### Created

1. **lib/auth/lockout.ts** - Core lockout utilities
2. **app/api/admin/unlock/[userId]/route.ts** - Admin unlock endpoint
3. **app/api/auth/lockout-status/route.ts** - Status check endpoint
4. **ACCOUNT_LOCKOUT.md** - This documentation

### Modified

1. **prisma/schema.prisma** - Added lockout fields to User model
2. **app/api/auth/login/route.ts** - Integrated lockout checks
3. **lib/email/service.ts** - Added `sendAccountLockedEmail()`
4. **lib/email/templates.ts** - Added `accountLocked()` template

## Related Documentation

- [Authentication](./AUTHENTICATION.md)
- [CSRF Protection](./CSRF_PROTECTION.md)
- [Rate Limiting](./lib/security/rate-limiter.ts)
- [KAN-24: Account Lockout](https://ratemyaccom.atlassian.net/browse/KAN-24)

## Configuration Summary

| Setting | Default Value | Description |
|---------|---------------|-------------|
| MAX_FAILED_ATTEMPTS | 5 | Failed attempts before lockout |
| LOCKOUT_DURATION_MINUTES | 30 | Initial lockout duration |
| ATTEMPT_WINDOW_MINUTES | 15 | Time window for attempt counting |
| PROGRESSIVE_LOCKOUT | true | Enable progressive duration increase |
| Max Lockout Duration | 24 hours | Maximum lockout duration cap |

## Lockout Duration Table

| Lockout # | Duration |
|-----------|----------|
| 1st | 30 minutes |
| 2nd | 60 minutes |
| 3rd | 120 minutes (2 hours) |
| 4th | 240 minutes (4 hours) |
| 5th | 480 minutes (8 hours) |
| 6th+ | 1440 minutes (24 hours - max) |
