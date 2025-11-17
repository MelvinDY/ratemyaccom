-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "AccommodationType" AS ENUM ('ON_CAMPUS', 'OFF_CAMPUS', 'PRIVATE', 'COLLEGE');

-- CreateEnum
CREATE TYPE "PricePeriod" AS ENUM ('WEEK', 'MONTH', 'SEMESTER', 'YEAR');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImportAction" AS ENUM ('CREATE', 'UPDATE', 'SKIP', 'ERROR');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('SUCCESS', 'FAILED', 'DUPLICATE', 'VALIDATION_ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "university" TEXT,
    "studentId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "provider" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "type" "AccommodationType" NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priceMin" INTEGER NOT NULL,
    "priceMax" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "pricePeriod" "PricePeriod" NOT NULL DEFAULT 'WEEK',
    "capacity" INTEGER NOT NULL,
    "roomTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactInfo" JSONB NOT NULL,
    "ratingOverall" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCleanliness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingLocation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingAmenities" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingManagement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingSafety" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "distanceToCampus" DOUBLE PRECISION,
    "distanceToTransport" DOUBLE PRECISION,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT,
    "scrapedAt" TIMESTAMP(3),
    "lastVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_amenities" (
    "accommodationId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "accommodation_amenities_pkey" PRIMARY KEY ("accommodationId","amenityId")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "ratingCleanliness" DOUBLE PRECISION NOT NULL,
    "ratingLocation" DOUBLE PRECISION NOT NULL,
    "ratingValue" DOUBLE PRECISION NOT NULL,
    "ratingAmenities" DOUBLE PRECISION NOT NULL,
    "ratingManagement" DOUBLE PRECISION NOT NULL,
    "ratingSafety" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "pros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "roomType" TEXT,
    "stayDuration" TEXT,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "reported" INTEGER NOT NULL DEFAULT 0,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_accommodations" (
    "userId" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_accommodations_pkey" PRIMARY KEY ("userId","accommodationId")
);

-- CreateTable
CREATE TABLE "scraping_jobs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "config" JSONB NOT NULL,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsImported" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraping_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_import_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "action" "ImportAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "rawData" JSONB,
    "processedData" JSONB,
    "status" "ImportStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_university_idx" ON "users"("university");

-- CreateIndex
CREATE UNIQUE INDEX "accommodations_slug_key" ON "accommodations"("slug");

-- CreateIndex
CREATE INDEX "accommodations_university_idx" ON "accommodations"("university");

-- CreateIndex
CREATE INDEX "accommodations_suburb_idx" ON "accommodations"("suburb");

-- CreateIndex
CREATE INDEX "accommodations_state_idx" ON "accommodations"("state");

-- CreateIndex
CREATE INDEX "accommodations_type_idx" ON "accommodations"("type");

-- CreateIndex
CREATE INDEX "accommodations_slug_idx" ON "accommodations"("slug");

-- CreateIndex
CREATE INDEX "accommodations_verified_idx" ON "accommodations"("verified");

-- CreateIndex
CREATE INDEX "accommodations_featured_idx" ON "accommodations"("featured");

-- CreateIndex
CREATE INDEX "accommodations_ratingOverall_idx" ON "accommodations"("ratingOverall");

-- CreateIndex
CREATE INDEX "accommodations_priceMin_idx" ON "accommodations"("priceMin");

-- CreateIndex
CREATE INDEX "accommodations_priceMax_idx" ON "accommodations"("priceMax");

-- CreateIndex
CREATE INDEX "accommodations_createdAt_idx" ON "accommodations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE INDEX "amenities_category_idx" ON "amenities"("category");

-- CreateIndex
CREATE INDEX "reviews_accommodationId_idx" ON "reviews"("accommodationId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "scraping_jobs_status_idx" ON "scraping_jobs"("status");

-- CreateIndex
CREATE INDEX "scraping_jobs_source_idx" ON "scraping_jobs"("source");

-- CreateIndex
CREATE INDEX "scraping_jobs_createdAt_idx" ON "scraping_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "data_import_logs_source_idx" ON "data_import_logs"("source");

-- CreateIndex
CREATE INDEX "data_import_logs_status_idx" ON "data_import_logs"("status");

-- CreateIndex
CREATE INDEX "data_import_logs_createdAt_idx" ON "data_import_logs"("createdAt");

-- CreateIndex
CREATE INDEX "data_import_logs_entityType_idx" ON "data_import_logs"("entityType");

-- AddForeignKey
ALTER TABLE "accommodation_amenities" ADD CONSTRAINT "accommodation_amenities_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_amenities" ADD CONSTRAINT "accommodation_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_accommodations" ADD CONSTRAINT "saved_accommodations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_accommodations" ADD CONSTRAINT "saved_accommodations_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
