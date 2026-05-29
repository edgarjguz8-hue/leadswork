# LeadsWork Database Schema & Migration Guide

## Overview

LeadsWork uses PostgreSQL with Drizzle ORM for type-safe database operations. The database schema supports:
- User authentication via Better Auth
- Domain marketplace (buy/sell/lease domains)
- Domain verification system (DNS TXT record verification)
- Domain availability caching

## Schema Overview

### Core Tables

#### `user` (Better Auth)
- id (text, PK)
- name, email, emailVerified
- image, createdAt, updatedAt

#### `domain` 
Main domains table - tracks all domains in the marketplace and user submissions.

**Key Columns:**
- `id` (text, PK) - Unique domain identifier
- `normalizedName` (text, UNIQUE) - Lowercase normalized domain (e.g., "example.com")
- `displayName` (text) - Original casing for display (e.g., "Example.com")
- `buyPrice` (integer) - Buy price in cents
- `leasePrice` (integer) - Monthly lease price in cents
- `category` (text) - Domain category (Technology, E-commerce, etc.)
- `description` (text) - Domain description
- `score` (integer) - Domain quality score (0-100)
- `status` (text) - Domain status: "available", "pending_verification", "sold", "leased"
- `ownerId` (text, FK to user) - Seller who listed the domain
- `buyerId` (text, FK to user) - Buyer who purchased the domain
- `leaserId` (text, FK to user) - User leasing the domain
- `verificationStatus` (text) - Verification state: "unverified", "pending_verification", "verified_owner", "rejected"
- `verificationId` (text, FK to domainVerification) - Link to verification record
- `externallyRegistered` (boolean) - Is domain registered externally?
- `purchasedAt`, `leaseStartAt`, `leaseExpiresAt` (timestamp)
- `lastExternalCheck` (timestamp) - When we last checked RDAP
- `createdAt`, `updatedAt` (timestamp)

#### `domainVerification`
Tracks DNS TXT verification codes for proving domain ownership.

**Columns:**
- `id` (text, PK)
- `domainId` (text, FK) - References domain.id
- `userId` (text, FK) - User attempting verification
- `verificationCode` (text) - TXT record code (e.g., "leadswork-verify-abc123")
- `verificationStatus` (text) - "pending_verification", "verified_owner", "rejected"
- `verifiedAt` (timestamp) - When verification succeeded
- `expiresAt` (timestamp) - When code expires (7 days)
- `createdAt`, `updatedAt` (timestamp)

#### `domainAvailabilityCache`
Caches RDAP lookups to avoid rate limits.

**Columns:**
- `id` (text, PK)
- `normalizedName` (text, UNIQUE)
- `isAvailable` (boolean)
- `externallyRegistered` (boolean)
- `lastChecked`, `expiresAt`, `createdAt` (timestamp)

#### `userDomain`
Tracks purchased/leased domains by users.

**Columns:**
- `id` (text, PK)
- `userId` (text, FK)
- `domainId` (text, FK)
- `type` (text) - "buy" or "lease"
- `priceInCents` (integer)
- `stripeSessionId` (text, UNIQUE)
- `purchasedAt`, `expiresAt`, `createdAt`, `updatedAt` (timestamp)

## Running Migrations

### Option 1: Automatic Migration on App Startup (Recommended)

The app will automatically run migrations on startup. This is handled in the initialization code.

### Option 2: Manual API Endpoint

Call the migration endpoint directly:

```bash
# Run migrations (development - no auth required)
curl http://localhost:3000/api/admin/migrate

# Production (with auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://leadswork.vercel.app/api/admin/migrate
```

Set `ADMIN_MIGRATION_TOKEN` in environment variables for production.

### Option 3: Direct SQL Migration

If using Neon directly:

```bash
# Using psql with connection string
psql $DATABASE_URL < migrations/001_add_domain_verification.sql

# Or using Neon CLI
neon sql --database default < migrations/001_add_domain_verification.sql
```

## Seller Domain Flow

1. **Submit Domain** (`submitDomainListing`)
   - Validates domain format
   - Checks LeadsWork database for duplicates
   - Checks external registries (RDAP) for registration
   - Creates domain with status = "pending_verification"
   - Generates DNS verification code
   - Returns verificationCode to seller

2. **Verify Ownership** (`confirmDomainVerification`)
   - Queries domain's DNS TXT records
   - Checks for matching verification code
   - Updates domain status to "available" on success
   - Domain now appears in marketplace

3. **Purchase/Lease**
   - Buyer initiates Stripe checkout
   - On payment success, webhook marks domain as "sold" or "leased"
   - Creates userDomain record linking buyer to domain

## Common Errors & Fixes

### "Failed to submit domain listing: Failed query"
- **Cause**: Missing database columns
- **Fix**: Run migrations: `curl http://localhost:3000/api/admin/migrate`

### "Failed to fetch available domains: Failed query"  
- **Cause**: Missing columns on domain table
- **Fix**: Same as above

### Domain shows but can't be purchased
- **Cause**: Domain has status = "pending_verification"
- **Fix**: User must verify DNS ownership first

## Schema Consistency

The schema is defined in `lib/db/schema.ts` using Drizzle ORM. Changes to the schema:

1. Update the Drizzle schema in `lib/db/schema.ts`
2. Create a new migration file in `migrations/`
3. Run migrations via API or direct SQL
4. Update server actions in `app/actions/domain.ts` if needed

All column names use camelCase to match database conventions.
