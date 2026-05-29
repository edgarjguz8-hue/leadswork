# Domain Listing Backend Architecture

## Overview

The domain listing backend implements a two-stage verification process to ensure only legitimate domain owners can list their domains on LeadsWork. This document explains the complete flow.

## Two-Stage Verification Process

### Stage 1: Internal LeadsWork Database Check
When a user submits a domain for listing, the backend performs these checks:

1. **Domain Uniqueness Check**
   - Query the `domain` table by `normalizedName`
   - Block listing if domain already exists with status: `available`, `pending_verification`, `sold`, `leased`, or `verified`
   - Error: "This domain is already listed on LeadsWork. Only one listing per domain is allowed."

2. **Business Logic Validation**
   - Validate all required fields (domainName, buyPrice, category, description)
   - Normalize domain name (remove www, http://, etc.)
   - Calculate domain score (0-100 random value for now)

### Stage 2: External Internet/DNS Check
The backend then verifies the domain is actually registered on the internet:

1. **RDAP/WHOIS Registry Lookup**
   - Query RDAP protocol at `https://rdap.org/domain/{domain}`
   - Fallback to Google DNS API for NS record lookup
   - Result: `externallyRegistered = true/false`
   - Only domains that ARE externally registered can be listed

2. **DNS Verification Requirement**
   - Generate unique verification code: `leadswork-verify-{random}`
   - Store in `domainVerification` table
   - Return code to user to add as TXT record
   - Set `verificationStatus = pending_verification`

### Stage 3: DNS Ownership Proof
User adds the TXT record to their domain, then clicks "Verify Ownership":

1. **DNS TXT Record Lookup**
   - Query domain's TXT records via Google DNS API
   - Check if any record contains `leadswork-verify-`
   - This proves the user controls the domain

2. **Status Update**
   - If verification succeeds:
     - Update `domainVerification.verificationStatus = verified_owner`
     - Update `domain.status = available`
     - Update `domain.verificationStatus = verified_owner`
   - Domain is now publicly visible in marketplace

## Database Schema

### domain table
```
- id: UUID (primary key)
- normalizedName: text (unique) - lowercase, no www/http
- displayName: text - original user input
- buyPrice: integer (cents)
- leasePrice: integer (cents)
- category: text
- description: text
- score: integer (0-100)
- status: text - pending_verification | available | sold | leased
- ownerId: UUID (foreign key to user)
- buyerId: UUID (foreign key to user)
- leaserId: UUID (foreign key to user)
- externallyRegistered: boolean - true if registered on internet
- verificationStatus: text - pending_verification | verified_owner | rejected
- verificationId: UUID (foreign key to domainVerification)
- lastExternalCheck: timestamp
- createdAt: timestamp
- updatedAt: timestamp
```

### domainVerification table
```
- id: UUID (primary key)
- domainId: UUID (foreign key to domain)
- userId: UUID (foreign key to user)
- verificationCode: text - leadswork-verify-{random}
- verificationStatus: text - pending_verification | verified_owner | rejected
- verifiedAt: timestamp
- expiresAt: timestamp (7 days from creation)
- createdAt: timestamp
- updatedAt: timestamp
```

### domainAvailabilityCache table
```
- id: UUID (primary key)
- normalizedName: text (unique)
- isAvailable: boolean
- externallyRegistered: boolean
- lastChecked: timestamp
- expiresAt: timestamp (24 hours)
- createdAt: timestamp
```

## Public Marketplace Display

Domains are shown in marketplace (`getAvailableDomains`) only if ALL conditions are met:
```sql
WHERE status = 'available'
  AND verificationStatus = 'verified_owner'
  AND externallyRegistered = true
```

## Key Functions

### submitDomainListing
- Input: domainName, buyPrice, leasePrice, category, description
- Performs: Database check → External check → Creates pending domain → Generates verification code
- Output: domainId, verificationCode, or detailed error
- Error handling: Shows specific reason why listing failed

### confirmDomainVerification
- Input: domainId, userId
- Performs: Verifies user ownership → Checks DNS TXT record → Updates status to available
- Output: Success message or specific DNS error
- Security: Verifies requesting user is the domain owner

### getAvailableDomains
- Returns: Only verified, publicly-listed domains
- Filters: status = available AND verificationStatus = verified_owner
- Used by: Marketplace page

## Error Handling

All backend errors are specific and actionable:
- "Domain is not registered on the internet" → User must own the domain first
- "DNS verification failed. No TXT records found" → User forgot to add DNS record
- "Domain is already listed on LeadsWork (status: available)" → Prevent duplicates
- "Could not verify domain status. Please try again" → Network error, user should retry

All errors are logged with `[v0]` prefix in server logs for debugging.

## Security & Fraud Prevention

1. **Ownership Verification**: DNS TXT record proves user controls domain
2. **One Listing Per Domain**: Prevents duplicate listings via normalizedName unique constraint
3. **Status Blocking**: Sold/Leased domains cannot be re-listed
4. **User Ownership**: Only domain owner can verify and modify listing
5. **No API Ownership Claims**: We don't trust any API to tell us who the "legal owner" is - only DNS verification

## Testing the Flow

1. **List a domain**: POST /api/domains/submit → domain created with pending_verification
2. **Get verification code**: Check database or API response
3. **Add DNS TXT record**: Add `leadswork-verify-{code}` as TXT record in DNS settings
4. **Verify ownership**: POST /api/domains/verify → checks DNS, updates status to available
5. **See in marketplace**: Domain appears in marketplace after verification

## Environment & Dependencies

- Database: Neon PostgreSQL with Drizzle ORM
- DNS lookups: Google Public DNS API (free, no auth required)
- RDAP lookups: rdap.org (free, no auth required)
- Timeouts: 5 seconds for DNS/RDAP lookups, 3 seconds for fallback
- Cache: 24 hours for availability checks to reduce API calls

## Logging

All operations log with `[v0]` prefix:
- `[v0] Step 1: Checking LeadsWork database for {domain}`
- `[v0] Step 2: Checking external domain registration`
- `[v0] Domain is externally registered - proceeding to create listing`
- `[v0] Creating verification request for domain {id}`
- `[v0] Verifying DNS TXT records for: {domain}`
- `[v0] DNS verification successful! Found leadswork-verify record`

Check server logs for debugging verification issues.
