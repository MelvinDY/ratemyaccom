-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('AUTH_LOGIN', 'AUTH_LOGOUT', 'AUTH_REGISTER', 'AUTH_VERIFY_EMAIL', 'AUTH_FORGOT_PASSWORD', 'AUTH_RESET_PASSWORD', 'AUTH_REFRESH_TOKEN', 'AUTH_TOKEN_EXPIRED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'ACCOUNT_DELETED', 'ACCOUNT_UPDATED', 'PASSWORD_CHANGED', 'EMAIL_CHANGED', 'PERMISSION_DENIED', 'ROLE_CHANGED', 'REVIEW_CREATED', 'REVIEW_UPDATED', 'REVIEW_DELETED', 'REVIEW_FLAGGED', 'ADMIN_ACTION', 'ADMIN_UNLOCK_ACCOUNT', 'ADMIN_DELETE_REVIEW', 'ADMIN_BAN_USER', 'RATE_LIMIT_EXCEEDED', 'CSRF_VALIDATION_FAILED', 'SUSPICIOUS_ACTIVITY');

-- CreateEnum
CREATE TYPE "AuditEventStatus" AS ENUM ('SUCCESS', 'FAILURE', 'WARNING', 'INFO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailedLogin" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "lockoutCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "eventType" "AuditEventType" NOT NULL,
    "eventAction" TEXT NOT NULL,
    "eventStatus" "AuditEventStatus" NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "userRole" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "requestPath" TEXT,
    "requestMethod" TEXT,
    "metadata" JSONB,
    "message" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_eventType_idx" ON "audit_logs"("eventType");

-- CreateIndex
CREATE INDEX "audit_logs_eventStatus_idx" ON "audit_logs"("eventStatus");

-- CreateIndex
CREATE INDEX "audit_logs_ipAddress_idx" ON "audit_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userEmail_idx" ON "audit_logs"("userEmail");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
