-- Create domain table with all required columns for sell domains feature
CREATE TABLE IF NOT EXISTS "domain" (
  "id" text PRIMARY KEY,
  "normalizedName" text NOT NULL UNIQUE,
  "displayName" text NOT NULL,
  "buyPrice" integer NOT NULL,
  "leasePrice" integer NOT NULL,
  "category" text NOT NULL,
  "description" text NOT NULL,
  "score" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending_verification',
  "buyerId" text REFERENCES "user"("id") ON DELETE SET NULL,
  "leaserId" text REFERENCES "user"("id") ON DELETE SET NULL,
  "ownerId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "purchasedAt" timestamp without time zone,
  "leaseStartAt" timestamp without time zone,
  "leaseExpiresAt" timestamp without time zone,
  "externallyRegistered" boolean DEFAULT false,
  "verificationStatus" text DEFAULT 'pending_verification',
  "verificationId" text,
  "lastExternalCheck" timestamp without time zone,
  "createdAt" timestamp without time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT NOW()
);

-- Create domainVerification table for DNS verification tracking
CREATE TABLE IF NOT EXISTS "domainVerification" (
  "id" text PRIMARY KEY,
  "domainId" text NOT NULL REFERENCES "domain"("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "verificationCode" text NOT NULL,
  "verificationStatus" text NOT NULL DEFAULT 'pending_verification',
  "verifiedAt" timestamp without time zone,
  "expiresAt" timestamp without time zone NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT NOW()
);

-- Add foreign key for domainVerification reference in domain table
ALTER TABLE "domain" ADD CONSTRAINT "domain_verificationId_fkey" 
  FOREIGN KEY ("verificationId") REFERENCES "domainVerification"("id") ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_domain_normalizedName" ON "domain"("normalizedName");
CREATE INDEX IF NOT EXISTS "idx_domain_status" ON "domain"("status");
CREATE INDEX IF NOT EXISTS "idx_domain_verificationStatus" ON "domain"("verificationStatus");
CREATE INDEX IF NOT EXISTS "idx_domain_ownerId" ON "domain"("ownerId");
CREATE INDEX IF NOT EXISTS "idx_domainVerification_domainId" ON "domainVerification"("domainId");
CREATE INDEX IF NOT EXISTS "idx_domainVerification_userId" ON "domainVerification"("userId");
