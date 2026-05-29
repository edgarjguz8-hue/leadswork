# Sell Domains Flow Diagram

## Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SELLER WORKFLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. SUBMIT DOMAIN
   ┌──────────────────────┐
   │  Seller fills form:  │
   │  - domain.com        │
   │  - $5000 buy price   │
   │  - $500 lease price  │
   │  - category          │
   │  - description       │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────┐
   │ Form validation      │
   │ - Check required     │
   │ - Check formats      │
   │ - Check domain valid │
   └──────────────────────┘
           │
           ▼
   ┌──────────────────────────────────┐
   │ submitDomainListing() action      │
   │ - Check duplicate in DB          │
   │ - Check external registry (RDAP) │
   │ - Create domain record:          │
   │   status="pending_verification"  │
   │ - Generate verification code     │
   │   "leadswork-verify-xyz123"      │
   │ - Create domainVerification row  │
   └──────────────────────────────────┘
           │
           ▼ (if success)
   ┌──────────────────────────────┐
   │ Show DNS Verification Modal  │
   │ "Add TXT record:             │
   │  Name: _leadswork            │
   │  Value: leadswork-verify-xyz │
   └──────────────────────────────┘

2. VERIFY OWNERSHIP
           │
           ▼
   ┌──────────────────────────────┐
   │ Seller adds TXT record to     │
   │ their domain's DNS (external) │
   └──────────────────────────────┘
           │
           ▼
   ┌──────────────────────────────┐
   │ Seller clicks "Verify        │
   │ Ownership" button             │
   └──────────────────────────────┘
           │
           ▼
   ┌───────────────────────────────────┐
   │ confirmDomainVerification() action │
   │ - Query domain's DNS TXT records  │
   │ - Check for verification code     │
   │ - If found:                       │
   │   ✓ Update domain status=         │
   │     "available"                   │
   │   ✓ Update verification=          │
   │     "verified_owner"              │
   │   ✓ Mark verification as verified │
   │ - If not found:                   │
   │   ✗ Show error message            │
   │   ✗ Retry verification            │
   └───────────────────────────────────┘
           │
           ▼ (if verified)
   ┌──────────────────────┐
   │ Success message      │
   │ "Domain verified and │
   │  live on marketplace"│
   └──────────────────────┘

3. PUBLIC LISTING
           │
           ▼
   ┌──────────────────────────────────┐
   │ Homepage shows in:               │
   │ - "All Domains" section          │
   │ - "Buy Now" section              │
   │ - "Lease" section                │
   │ - Category filters               │
   │ - Search results                 │
   └──────────────────────────────────┘

4. BUYER PURCHASES
           │
           ▼
   ┌──────────────────────────────────┐
   │ Buyer clicks domain              │
   │ - Views domain details           │
   │ - Sees buy/lease prices          │
   │ - Clicks "Buy Now" or "Lease"    │
   └──────────────────────────────────┘
           │
           ▼
   ┌──────────────────────────────────┐
   │ Stripe Checkout                  │
   │ - Payment processed              │
   │ - Webhook received               │
   └──────────────────────────────────┘
           │
           ▼
   ┌────────────────────────────────────┐
   │ markDomainAsSold() or              │
   │ markDomainAsLeased()               │
   │ - Update domain status             │
   │ - Create userDomain record         │
   │ - Buyer sees in dashboard          │
   │ - Seller sees sale complete        │
   └────────────────────────────────────┘
```

## Database State Changes

```
INITIAL STATE (before submission)
═══════════════════════════════════════════════════════════════

domain table:                  (empty or other domains)
domainVerification table:      (empty)
userDomain table:              (other purchases)


AFTER SUBMISSION
═══════════════════════════════════════════════════════════════

domain table:
  id: domain_1234567_abc123
  normalizedName: example.com
  displayName: Example.com
  buyPrice: 500000 (cents)
  leasePrice: 50000 (cents)
  category: Technology
  description: Great domain
  score: 78
  status: ❌ pending_verification  ◄─── KEY: NOT IN MARKETPLACE YET
  ownerId: user_seller_123
  buyerId: NULL
  leaserId: NULL
  verificationStatus: ❌ pending_verification
  verificationId: verify_456
  externallyRegistered: false
  createdAt: 2026-01-15T10:00:00Z
  updatedAt: 2026-01-15T10:00:00Z

domainVerification table:
  id: verify_456
  domainId: domain_1234567_abc123
  userId: user_seller_123
  verificationCode: leadswork-verify-xyz789abc
  verificationStatus: ❌ pending_verification
  verifiedAt: NULL
  expiresAt: 2026-01-22T10:00:00Z  ◄─── EXPIRES IN 7 DAYS
  createdAt: 2026-01-15T10:00:00Z
  updatedAt: 2026-01-15T10:00:00Z


AFTER DNS VERIFICATION SUCCESS
═══════════════════════════════════════════════════════════════

domain table (UPDATED):
  status: ✅ available  ◄─── NOW IN MARKETPLACE
  verificationStatus: ✅ verified_owner
  updatedAt: 2026-01-15T10:05:00Z

domainVerification table (UPDATED):
  verificationStatus: ✅ verified_owner
  verifiedAt: 2026-01-15T10:05:00Z  ◄─── TIMESTAMP ADDED
  updatedAt: 2026-01-15T10:05:00Z


AFTER BUYER PURCHASES
═══════════════════════════════════════════════════════════════

domain table (UPDATED):
  status: sold  ◄─── NO LONGER AVAILABLE
  buyerId: user_buyer_456
  purchasedAt: 2026-01-15T10:30:00Z
  updatedAt: 2026-01-15T10:30:00Z

userDomain table (NEW RECORD):
  id: ud_789
  userId: user_buyer_456
  domainId: domain_1234567_abc123
  type: buy
  priceInCents: 500000
  stripeSessionId: cs_test_xyz123
  purchasedAt: 2026-01-15T10:30:00Z
  expiresAt: NULL (purchases don't expire)
  createdAt: 2026-01-15T10:30:00Z
  updatedAt: 2026-01-15T10:30:00Z
```

## Query Flow Diagram

```
SELLER DASHBOARD QUERY
══════════════════════════════════════════════════════════════

User logs in → getSellerDomains(userId)
   │
   ├─ SELECT * FROM domain WHERE ownerId = 'user_seller_123'
   │
   ├─ For each domain, get verification status:
   │  └─ SELECT * FROM domainVerification WHERE domainId = ?
   │
   └─ Display in dashboard:
      ├─ Domain name
      ├─ Status badge (Verified & Live / Awaiting Verification / Unverified)
      ├─ Buy/lease prices
      ├─ Verification code (if pending)


HOMEPAGE MARKETPLACE QUERY
══════════════════════════════════════════════════════════════

Load homepage → getAvailableDomains()
   │
   ├─ SELECT * FROM domain WHERE status = 'available'
   │  (Only returns verified, publicly listed domains)
   │
   └─ Transform and display:
      ├─ Domain name
      ├─ Buy price
      ├─ Lease price/month
      ├─ Category
      ├─ Description
      ├─ Quality score
      └─ Buy/Lease buttons


DNS VERIFICATION QUERY
══════════════════════════════════════════════════════════════

Seller clicks "Verify" → confirmDomainVerification()
   │
   ├─ SELECT * FROM domain WHERE id = 'domain_1234567_abc123'
   ├─ SELECT * FROM domainVerification WHERE domainId = ?
   │
   ├─ Query external DNS TXT records for example.com
   │  └─ Look for: leadswork-verify-xyz789abc
   │
   ├─ If found:
   │  └─ UPDATE domain SET status='available', verificationStatus='verified_owner'
   │  └─ UPDATE domainVerification SET verificationStatus='verified_owner', verifiedAt=NOW()
   │
   └─ If not found:
      └─ Return error with instructions
```

## Error Scenarios

```
SCENARIO 1: Domain Already Listed
═══════════════════════════════════════════════════════════════
User submits: example.com

Check: SELECT * FROM domain WHERE normalizedName = 'example.com'
Result: ✗ Found (already exists)
Error: "This domain is already listed on LeadsWork"


SCENARIO 2: Invalid Domain
═══════════════════════════════════════════════════════════════
User submits: "not a domain"

Validation: getDomainValidationError(input)
Result: ✗ Invalid format
Error: "Invalid domain format. Use: example.com or https://example.com"


SCENARIO 3: Missing Required Field
═══════════════════════════════════════════════════════════════
User submits: (no description)

Validation: Check all fields
Result: ✗ Empty
Error: "Description is required"


SCENARIO 4: Database Column Missing
═══════════════════════════════════════════════════════════════
OLD (before migration):
Error: "Failed to submit domain listing: column ownerId does not exist"

NEW (after migration):
✓ Column exists, operation succeeds


SCENARIO 5: DNS Verification Fails
═══════════════════════════════════════════════════════════════
User adds wrong TXT record or DNS not updated yet

Check: Query DNS for TXT record
Result: ✗ Not found
Error: "We could not verify ownership yet. Please make sure the TXT 
record was added correctly. DNS updates can take a few minutes."
(With retry button)


SCENARIO 6: Verification Code Expires
═══════════════════════════════════════════════════════════════
User waits 8 days to verify

Check: SELECT * FROM domainVerification 
       WHERE expiresAt < NOW()
Result: ✗ Expired
Error: "Verification code expired. Please submit domain again."
```

## Status Transitions

```
DOMAIN STATUS FLOW
════════════════════════════════════════════════════════════════

┌─ pending_verification ─────────┐
│   (seller submitted, needs DNS) │
├─────────────────────────────────┤
│                                 │
│ Seller verifies DNS ──────┐     │
│                           │     │
│                           ▼     │
├──► available ◄────────────┘     │
│   (publicly listed)              │
│        │                         │
│        ├─ Buyer purchases   ──► sold
│        │                         (domain purchased)
│        │
│        └─ Buyer leases      ──► leased
│                                 (domain rented)
│
└──────────────────────────────────

VERIFICATION STATUS FLOW
════════════════════════════════════════════════════════════════

unverified
    │
    ├─► pending_verification
    │       (waiting for DNS verification)
    │
    └─► verified_owner
            (DNS verified, domain public)
            
    Alternative: rejected
            (DNS verification failed permanently)
```

## Response Format

```
SUBMIT DOMAIN - SUCCESS RESPONSE
═══════════════════════════════════════════════════════════════

{
  "success": true,
  "domainId": "domain_1234567_abc123",
  "verificationCode": "leadswork-verify-xyz789abc",
  "message": "Domain listing created. Please verify ownership to make it live."
}


SUBMIT DOMAIN - ERROR RESPONSE
═══════════════════════════════════════════════════════════════

{
  "success": false,
  "error": "Failed to submit domain listing: column ownerId does not exist"
}

VERIFY DNS - SUCCESS RESPONSE
═══════════════════════════════════════════════════════════════

{
  "success": true,
  "verified": true,
  "message": "Domain verified successfully and is now live on the marketplace!"
}


VERIFY DNS - ERROR RESPONSE
═══════════════════════════════════════════════════════════════

{
  "success": false,
  "verified": false,
  "error": "We could not verify ownership yet. Please make sure the TXT 
record was added correctly. DNS updates can take a few minutes."
}
```

## Key Points

✅ **Before Migration:** Generic "Failed query" errors
✅ **After Migration:** Specific error messages like "column ownerId does not exist"

✅ **Before Migration:** Database tables missing
✅ **After Migration:** All required tables and columns exist

✅ **Before Migration:** No verification tracking
✅ **After Migration:** Complete audit trail in domainVerification table

✅ **Before Migration:** Seller domains not visible
✅ **After Migration:** Proper status tracking for pending/verified/public states
