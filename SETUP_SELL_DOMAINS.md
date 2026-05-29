## CRITICAL: Database Setup for Sell Domains Feature

The Sell Domains feature requires database tables that may not exist yet. Follow ONE of these options:

### OPTION 1: Automatic Setup (Easiest for Vercel)

Run this curl command in your terminal:

```bash
curl -X POST https://your-app-url.vercel.app/api/admin/setup-domain-tables
```

Replace `your-app-url` with your actual Vercel app URL.

Expected response:
```json
{
  "success": true,
  "message": "Database migration completed successfully! The domain tables are now ready."
}
```

---

### OPTION 2: Manual SQL (Neon Dashboard)

1. Go to https://console.neon.tech
2. Find your database and open the SQL Editor
3. Copy and paste the entire contents of `migrations/create_domain_tables.sql`
4. Execute the SQL

---

### OPTION 3: Local Development

Run this command in your terminal:

```bash
npx ts-node scripts/run-migration.ts
```

Make sure you have `DATABASE_URL` set in your `.env` file.

---

## What Gets Created

The migration creates:

1. **`domain` table** - Stores domain listings for sale/lease
   - Required columns: id, normalizedName, displayName, buyPrice, leasePrice, category, description, score, status, ownerId, etc.
   - Unique constraint on normalizedName to prevent duplicates
   - Default status: pending_verification

2. **`domainVerification` table** - Tracks DNS ownership verification
   - Links domains to verification codes
   - Tracks verification status: pending_verification, verified_owner, rejected

3. **Performance indexes** - Speed up queries on status, normalizedName, userId, etc.

---

## How the Sell Domains Flow Works

1. **User submits domain** → Domain created with `status='pending_verification'`
2. **User adds DNS TXT record** → Shown in UI with verification code
3. **User clicks "Verify"** → System checks DNS record
4. **Verification succeeds** → Domain status changes to `'available'` and `verificationStatus='verified_owner'`
5. **Domain appears** → Now visible in marketplace with other available domains
6. **User dashboard** → Shows domain with status in seller's dashboard

---

## Verification Status States

- `pending_verification` - Waiting for user to add DNS record and verify
- `verified_owner` - Successfully verified, domain is public
- `rejected` - Verification failed (user can retry)

---

## Domain Status States

- `pending_verification` - New domain, not yet verified
- `available` - Verified and ready for buyers (only these appear in marketplace)
- `sold` - Purchased by a buyer
- `leased` - Leased to a user

---

## Testing the Feature

1. Log in as a user
2. Click "Sell" on the homepage
3. Enter domain name, prices, category, description
4. Click "Submit Listing"
5. Add the DNS TXT record to your domain registrar
6. Click "Verify Ownership"
7. Domain should now appear in your dashboard AND the marketplace

---

## If You Get Database Errors

If you see errors like:
- "column ownerId does not exist"
- "relation domain does not exist"
- "table domainVerification does not exist"

It means the tables haven't been created yet. Run one of the setup options above.

---

## Production Deployment

For Vercel deployments:

1. Set up your Neon database connection
2. Run the setup API endpoint: `curl -X POST https://your-app.vercel.app/api/admin/setup-domain-tables`
3. Users can now list domains immediately

No additional configuration needed!
