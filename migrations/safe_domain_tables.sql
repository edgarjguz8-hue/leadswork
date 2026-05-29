-- Create the domain table
CREATE TABLE IF NOT EXISTS "domain" (
	"id" text PRIMARY KEY NOT NULL,
	"normalizedName" text NOT NULL,
	"displayName" text NOT NULL,
	"buyPrice" integer NOT NULL,
	"leasePrice" integer NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"score" integer NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"buyerId" text,
	"leaserId" text,
	"ownerId" text,
	"purchasedAt" timestamp,
	"leaseStartAt" timestamp,
	"leaseExpiresAt" timestamp,
	"externallyRegistered" boolean DEFAULT false,
	"verificationStatus" text DEFAULT 'unverified',
	"verificationId" text,
	"lastExternalCheck" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domain_normalizedName_unique" UNIQUE("normalizedName")
);

-- Create the domainVerification table
CREATE TABLE IF NOT EXISTS "domainVerification" (
	"id" text PRIMARY KEY NOT NULL,
	"domainId" text NOT NULL,
	"userId" text NOT NULL,
	"verificationCode" text NOT NULL,
	"verificationStatus" text DEFAULT 'pending_verification' NOT NULL,
	"verifiedAt" timestamp,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create the domainAvailabilityCache table
CREATE TABLE IF NOT EXISTS "domainAvailabilityCache" (
	"id" text PRIMARY KEY NOT NULL,
	"normalizedName" text NOT NULL,
	"isAvailable" boolean NOT NULL,
	"externallyRegistered" boolean NOT NULL,
	"lastChecked" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domainAvailabilityCache_normalizedName_unique" UNIQUE("normalizedName")
);

-- Add domainId column to userDomain if it doesn't exist
ALTER TABLE "userDomain" ADD COLUMN IF NOT EXISTS "domainId" text;
