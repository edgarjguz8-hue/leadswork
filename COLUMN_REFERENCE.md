# Column Name Reference - Schema Consistency Guide

## Domain Table - Standardized Column Names

All domain table columns use **camelCase** to match Drizzle ORM conventions.

### Column Name Mapping

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `id` | text | ✓ | Primary key (uuid or custom) |
| `normalizedName` | text | ✓ | Lowercase domain: "example.com" |
| `displayName` | text | ✓ | Original casing: "Example.com" |
| `buyPrice` | integer | ✓ | Buy price in cents (e.g., 500000 = $5000) |
| `leasePrice` | integer | ✓ | Monthly lease price in cents |
| `category` | text | ✓ | E.g., "Technology", "E-commerce" |
| `description` | text | ✓ | Domain description |
| `score` | integer | ✓ | Domain quality 0-100 (default 75) |
| `status` | text | ✓ | "available", "pending_verification", "sold", "leased" |
| `ownerId` | text | ✓ | FK to user - seller who listed it |
| `buyerId` | text | | FK to user - who bought it |
| `leaserId` | text | | FK to user - who leased it |
| `verificationStatus` | text | | "unverified", "pending_verification", "verified_owner", "rejected" |
| `verificationId` | text | | FK to domainVerification |
| `externallyRegistered` | boolean | | Is it registered externally? |
| `purchasedAt` | timestamp | | When was it purchased? |
| `leaseStartAt` | timestamp | | When did lease start? |
| `leaseExpiresAt` | timestamp | | When does lease expire? |
| `lastExternalCheck` | timestamp | | Last RDAP lookup |
| `createdAt` | timestamp | ✓ | Record created at |
| `updatedAt` | timestamp | ✓ | Record last updated |

## DomainVerification Table

Tracks DNS TXT record verification for proving ownership.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `id` | text | ✓ | Primary key |
| `domainId` | text | ✓ | FK to domain.id |
| `userId` | text | ✓ | FK to user.id - who's verifying |
| `verificationCode` | text | ✓ | TXT record value: "leadswork-verify-[token]" |
| `verificationStatus` | text | ✓ | "pending_verification", "verified_owner", "rejected" |
| `verifiedAt` | timestamp | | When was ownership verified? |
| `expiresAt` | timestamp | ✓ | When does code expire? (7 days from creation) |
| `createdAt` | timestamp | ✓ | Record created at |
| `updatedAt` | timestamp | ✓ | Record last updated |

## DomainAvailabilityCache Table

Caches external RDAP lookups to avoid rate limits.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `id` | text | ✓ | Primary key |
| `normalizedName` | text | ✓ | Normalized domain (unique) |
| `isAvailable` | boolean | ✓ | Is domain available for purchase? |
| `externallyRegistered` | boolean | ✓ | Is it registered externally? |
| `lastChecked` | timestamp | ✓ | When did we check? |
| `expiresAt` | timestamp | ✓ | When does cache expire? |
| `createdAt` | timestamp | ✓ | Record created at |

## Column Name Rules

### DO
- ✓ Use **camelCase** for all column names
- ✓ Use **singular** names (domain, not domains)
- ✓ Use descriptive names (verificationCode, not code)
- ✓ Use FK suffix for foreign keys in queries
- ✓ Use `At` suffix for timestamps

### DON'T
- ✗ Use snake_case (use_snake_case)
- ✗ Use abbreviations (ver_code instead of verificationCode)
- ✗ Use plural names (domains instead of domain)
- ✗ Mix naming conventions (sometimes camelCase, sometimes snake_case)

## Common Mistakes & Fixes

### ❌ Wrong Query
```javascript
// WRONG: snake_case column names
const result = await db
  .select()
  .from(domain)
  .where(eq(domain.normalized_name, normalized))
```

### ✅ Correct Query
```javascript
// CORRECT: camelCase column names
const result = await db
  .select()
  .from(domainTable)
  .where(eq(domainTable.normalizedName, normalized))
```

### ❌ Wrong Insert
```javascript
// WRONG: missing required columns
await db.insert(domainTable).values({
  id: domainId,
  name: domainName,  // WRONG: should be normalizedName + displayName
  price: 5000,       // WRONG: should be buyPrice in cents
})
```

### ✅ Correct Insert
```javascript
// CORRECT: all required columns with correct names
await db.insert(domainTable).values({
  id: domainId,
  normalizedName: normalized,
  displayName: domainName,
  buyPrice: 500000,  // cents
  leasePrice: 50000, // cents
  category: category,
  description: description,
  score: 75,
  status: 'pending_verification',
  ownerId: userId,
  externallyRegistered: false,
  verificationStatus: 'pending_verification',
  createdAt: new Date(),
  updatedAt: new Date(),
})
```

## Drizzle ORM Column Mapping

When defining columns in Drizzle, the second parameter is the database column name:

```typescript
export const domain = pgTable('domain', {
  // Parameter 1: JS property name (camelCase)
  // Parameter 2: Database column name (quoted for camelCase)
  id: text('id').primaryKey(),
  normalizedName: text('normalizedName').notNull().unique(),
  displayName: text('displayName').notNull(),
  buyPrice: integer('buyPrice').notNull(),
  leasePrice: integer('leasePrice').notNull(),
  // ... etc
})
```

## Performance Considerations

### Indexed Columns (for queries)
- ✓ `normalizedName` - unique lookups
- ✓ `ownerId` - seller's domains
- ✓ `status` - filter available domains
- ✓ `verificationStatus` - filter by verification state
- ✓ `verificationCode` - lookup during DNS verification

### Query Patterns
```sql
-- Fast: uses normalizedName index
SELECT * FROM domain WHERE "normalizedName" = 'example.com';

-- Fast: uses ownerId index
SELECT * FROM domain WHERE "ownerId" = 'user_123' AND status = 'available';

-- Fast: uses status index
SELECT * FROM domain WHERE status = 'available' LIMIT 10;
```

## Validation Rules

When inserting or updating domains:

| Field | Validation |
|-------|-----------|
| `normalizedName` | Must be lowercase, alphanumeric, dots only. Must be unique. |
| `displayName` | Original domain format. Can have mixed case. |
| `buyPrice` | Integer >= 0. Must be in cents (1000 = $10.00). |
| `leasePrice` | Integer >= 0. Monthly price in cents. |
| `category` | Must be one of predefined categories. |
| `description` | Non-empty string, max 1000 chars. |
| `score` | Integer between 0-100. |
| `status` | One of: available, pending_verification, sold, leased. |
| `ownerId` | Must reference existing user.id. |
| `verificationStatus` | One of: unverified, pending_verification, verified_owner, rejected. |
| `expiresAt` | Must be in future (for pending verifications). |
