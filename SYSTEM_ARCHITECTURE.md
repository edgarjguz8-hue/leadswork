# Sell Domains System Architecture

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                        USER TABLE                           │
│  (existing - manages authentication)                        │
│  - id (PK)                                                  │
│  - email, name, etc.                                        │
└────────────┬────────────────────────────────────────────────┘
             │ ownerId FK
             │
┌────────────▼────────────────────────────────────────────────┐
│                      DOMAIN TABLE (NEW)                     │
│  - id (PK)                                                  │
│  - normalizedName (UNIQUE) ← Important for duplicate check  │
│  - displayName                                              │
│  - buyPrice (in cents)                                      │
│  - leasePrice (in cents)                                    │
│  - category                                                 │
│  - description                                              │
│  - score (0-100)                                            │
│  ├─ status: pending_verification|available|sold|leased      │
│  ├─ verificationStatus: pending|verified_owner|rejected     │
│  ├─ ownerId FK → user.id (seller)                          │
│  ├─ buyerId FK → user.id (buyer, if sold)                  │
│  ├─ leaserId FK → user.id (leaser, if leased)              │
│  ├─ verificationId FK ─────────────────┐                   │
│  └─ createdAt, updatedAt               │                   │
│                                         │                   │
└─────────────────────────────────────────┼───────────────────┘
                                          │
         ┌────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                DOMAIN VERIFICATION TABLE (NEW)              │
│  - id (PK)                                                  │
│  - domainId FK → domain.id                                  │
│  - userId FK → user.id                                      │
│  - verificationCode (TXT record name)                        │
│  ├─ verificationStatus: pending_verification|verified_owner │
│  ├─ verifiedAt (timestamp of successful verification)       │
│  ├─ expiresAt (7 days from creation)                        │
│  └─ createdAt, updatedAt                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## User Journey: Listing a Domain

```
START: User clicks "Sell" on homepage
  │
  ▼
User sees SellDomainForm component
  │
  ├─ User enters domain name
  ├─ Validates format (getDomainValidationError)
  ├─ Checks external registrar (getDomainAvailability)
  │
  ▼
User enters prices, category, description
  │
  ├─ Validates all fields
  │
  ▼
User clicks "Submit Listing"
  │
  ├─ Calls submitDomainListing() action
  │   ├─ Check if domain already listed (SELECT * FROM domain WHERE normalizedName=?)
  │   │   └─ Unique constraint on normalizedName prevents duplicates
  │   │
  │   ├─ Create domain record
  │   │   ├─ id: [uuid]
  │   │   ├─ normalizedName: [normalized]
  │   │   ├─ status: 'pending_verification'
  │   │   ├─ verificationStatus: 'pending_verification'
  │   │   ├─ ownerId: [current-user-id]
  │   │   └─ INSERT INTO domain VALUES (...)
  │   │
  │   ├─ Create verification request
  │   │   ├─ Generate verification code
  │   │   ├─ Create domainVerification record
  │   │   ├─ verificationCode: [code]
  │   │   ├─ expiresAt: NOW() + 7 days
  │   │   └─ INSERT INTO domainVerification VALUES (...)
  │   │
  │   └─ Return: { success: true, domainId, verificationCode }
  │
  ▼
showVerification = true
  │
  ├─ Display OwnershipVerification component
  ├─ Show DNS TXT record name and code
  ├─ Instructions: Add record to domain registrar
  │
  ▼
User adds TXT record to their domain registrar
  │
  └─ Record added: leadswork-verify-[code]
     (DNS propagation: 5-15 minutes)
  │
  ▼
User clicks "Verify Ownership"
  │
  ├─ Calls confirmDomainVerification() action
  │   ├─ Fetch domain from DB
  │   │   └─ SELECT * FROM domain WHERE id = ? LIMIT 1
  │   │
  │   ├─ Call verifyDomainOwnership()
  │   │   ├─ Query DNS for TXT records
  │   │   ├─ Check if verification code exists
  │   │   └─ Return: { verified: true/false }
  │   │
  │   ├─ If verified:
  │   │   └─ UPDATE domain SET
  │   │       status = 'available',
  │   │       verificationStatus = 'verified_owner'
  │   │
  │   └─ Return: { success: true, verified: true }
  │
  ▼
Domain is now LIVE
  │
  ├─ Status: 'available'
  ├─ VerificationStatus: 'verified_owner'
  ├─ Appears in marketplace
  ├─ Appears in user's dashboard → "Selling" tab
  └─ Buyers can browse and make offers

END: Domain successfully listed
```

---

## Marketplace Display Logic

```
When buyer goes to marketplace:

getAvailableDomainsForMarketplace()
  │
  ├─ Calls getAvailableDomains()
  │   └─ SELECT * FROM domain 
  │      WHERE status = 'available' 
  │      AND verificationStatus = 'verified_owner'
  │
  ├─ Maps each domain to display format:
  │   ├─ name, price, lease, category
  │   ├─ description, score
  │   └─ formatted prices ($X,XXX)
  │
  └─ Returns array of available domains

Buyer sees:
- Only verified, publicly available domains
- Sorted by score (best first)
- Can filter by category
- Can buy or lease each domain

NOT shown:
- Domains with status = 'pending_verification' (not verified yet)
- Domains with status = 'sold' (already sold)
- Domains with status = 'leased' (already leased)
```

---

## Dashboard Display Logic

### For Sellers (Selling Tab)

```
When seller goes to dashboard → "Selling" tab:

getSellerDomains(userId)
  │
  ├─ SELECT * FROM domain WHERE ownerId = ?
  │
  ├─ For each domain:
  │   └─ Get verification status from domainVerification table
  │
  └─ Returns all domains seller has listed (any status)

Seller sees:
- pending_verification: "Waiting for DNS verification"
- verified_owner: "Live in marketplace"
- sold: "Sold on [date]"
- leased: "Leased until [date]"

Actions available:
- pending_verification: Can verify or cancel
- verified_owner: Listed, can delist
- sold/leased: View history
```

### For Buyers (Purchased Tab)

```
When buyer goes to dashboard → "Purchased" tab:

getUserDomains(userId)
  │
  ├─ SELECT * FROM userDomain WHERE userId = ?
  │
  └─ Shows all domains purchased/leased by this user

Buyer sees:
- Buy: Purchased domains
- Lease: Leased domains (with expiration date)
```

---

## Error Handling

```
Error: "relation domain does not exist"
  → Database tables not created
  → Solution: Run migration (Step 1)

Error: "column ownerId does not exist"  
  → Database schema mismatch
  → Solution: Run migration (Step 1)

Error: "This domain is already listed on LeadsWork"
  → normalizedName unique constraint violation
  → Solution: Choose different domain or wait for existing listing to expire

Error: "Failed to add to database"
  → Specific error message included
  → Examples: "Column name misspelled", "Foreign key violation"
  → Solution: Check error message and database schema

Error: "DNS verification failed"
  → TXT record not found in DNS
  → Possible causes:
    ├─ Record not added yet
    ├─ Wrong record name
    ├─ DNS not yet propagated (wait 5-15 min)
    └─ Wrong domain registrar
```

---

## Database Queries for Debugging

```sql
-- Show all domains by owner
SELECT id, displayName, status, verificationStatus, createdAt 
FROM domain 
WHERE ownerId = 'user-id' 
ORDER BY createdAt DESC;

-- Show pending verification domains
SELECT id, displayName, ownerId, createdAt 
FROM domain 
WHERE verificationStatus = 'pending_verification';

-- Show marketplace domains (what buyers see)
SELECT displayName, buyPrice, leasePrice, category, score 
FROM domain 
WHERE status = 'available' 
AND verificationStatus = 'verified_owner' 
ORDER BY score DESC;

-- Show verification codes for user
SELECT d.displayName, dv.verificationCode, dv.verificationStatus, dv.expiresAt
FROM domainVerification dv
JOIN domain d ON d.id = dv.domainId
WHERE dv.userId = 'user-id'
ORDER BY dv.createdAt DESC;

-- Check if domain is already listed
SELECT id, displayName, status 
FROM domain 
WHERE normalizedName = 'example-com'
LIMIT 1;
```

---

## System Constraints

1. **Unique Domain Names**
   - normalizedName is UNIQUE
   - Prevents duplicate listings
   - Enforced at database level

2. **Ownership Requirement**
   - ownerId cannot be NULL
   - Each domain must have a seller
   - Foreign key to user.id

3. **Status Transitions**
   - pending_verification → available (after DNS verification)
   - available → sold (after purchase)
   - available → leased (after lease agreement)

4. **Verification Expiration**
   - Verification codes expire after 7 days
   - expiresAt set to NOW() + 7 days

5. **Cascading Deletes**
   - Delete domain → Delete domainVerification
   - Delete user → Delete all their domains

---

## Performance Optimization

```sql
-- Indexes created for common queries

CREATE INDEX idx_domain_normalizedName ON domain(normalizedName);
  → Fast duplicate checking
  → Fast domain lookup

CREATE INDEX idx_domain_status ON domain(status);
  → Fast filtered queries by status

CREATE INDEX idx_domain_verificationStatus ON domain(verificationStatus);
  → Fast marketplace query (WHERE verificationStatus = 'verified_owner')

CREATE INDEX idx_domain_ownerId ON domain(ownerId);
  → Fast seller dashboard query

CREATE INDEX idx_domainVerification_domainId ON domainVerification(domainId);
CREATE INDEX idx_domainVerification_userId ON domainVerification(userId);
  → Fast verification lookups
```
