-- Migration: Add domain verification tables and columns
-- This migration ensures the database schema matches the Drizzle ORM schema

-- Add missing columns to domain table if they don't exist
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "normalizedName" text UNIQUE;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "displayName" text;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "buyPrice" integer;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "leasePrice" integer;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "category" text;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 75;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'available';
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "buyerId" text;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "leaserId" text;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "ownerId" text;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "purchasedAt" timestamp;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "leaseStartAt" timestamp;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "leaseExpiresAt" timestamp;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "externallyRegistered" boolean DEFAULT false;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "verificationStatus" text DEFAULT 'unverified';
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "verificationId" text;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "lastExternalCheck" timestamp;
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT NOW();
ALTER TABLE domain ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT NOW();

-- Add foreign key constraints if they don't exist
ALTER TABLE domain ADD CONSTRAINT IF NOT EXISTS fk_domain_buyer FOREIGN KEY ("buyerId") REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE domain ADD CONSTRAINT IF NOT EXISTS fk_domain_leaser FOREIGN KEY ("leaserId") REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE domain ADD CONSTRAINT IF NOT EXISTS fk_domain_owner FOREIGN KEY ("ownerId") REFERENCES "user"(id) ON DELETE SET NULL;

-- Create domainVerification table if it doesn't exist
CREATE TABLE IF NOT EXISTS "domainVerification" (
  id text PRIMARY KEY,
  "domainId" text NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "verificationCode" text NOT NULL,
  "verificationStatus" text DEFAULT 'pending_verification',
  "verifiedAt" timestamp,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT NOW(),
  "updatedAt" timestamp DEFAULT NOW()
);

-- Create domainAvailabilityCache table if it doesn't exist
CREATE TABLE IF NOT EXISTS "domainAvailabilityCache" (
  id text PRIMARY KEY,
  "normalizedName" text UNIQUE NOT NULL,
  "isAvailable" boolean NOT NULL,
  "externallyRegistered" boolean NOT NULL,
  "lastChecked" timestamp DEFAULT NOW(),
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domain_normalized_name ON domain("normalizedName");
CREATE INDEX IF NOT EXISTS idx_domain_owner_id ON domain("ownerId");
CREATE INDEX IF NOT EXISTS idx_domain_status ON domain(status);
CREATE INDEX IF NOT EXISTS idx_domain_verification_status ON domain("verificationStatus");
CREATE INDEX IF NOT EXISTS idx_domain_verification_code ON "domainVerification"("verificationCode");
CREATE INDEX IF NOT EXISTS idx_domain_availability_cache_expires ON "domainAvailabilityCache"("expiresAt");

-- Add foreign key for verificationId if it doesn't exist
ALTER TABLE domain ADD CONSTRAINT IF NOT EXISTS fk_domain_verification FOREIGN KEY ("verificationId") REFERENCES "domainVerification"(id) ON DELETE SET NULL;
