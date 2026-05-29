# Database Migration Quick Start

## What's the Problem?

The Sell Domains feature was failing because the database schema in Neon didn't have all the required columns. The code was trying to insert/query columns that didn't exist.

## How to Fix It

### For Development (Local)

If using a local PostgreSQL:

```bash
# Run the migration script
cd /vercel/share/v0-project
bash scripts/migrate.sh
```

### For Production (Neon on Vercel)

**Option A: Using the API Endpoint**

```bash
# Get your app URL from Vercel
# Then call the migration endpoint:

curl https://your-leadswork-app.vercel.app/api/admin/migrate

# With auth token (recommended for production):
curl -H "Authorization: Bearer YOUR_ADMIN_MIGRATION_TOKEN" \
  https://your-leadswork-app.vercel.app/api/admin/migrate
```

**Option B: Using Neon Dashboard**

1. Go to https://console.neon.tech
2. Select your database
3. Go to SQL Editor
4. Copy and paste the contents of `migrations/001_add_domain_verification.sql`
5. Run the SQL

**Option C: Using Neon CLI**

```bash
# If you have neon CLI installed
neon sql < migrations/001_add_domain_verification.sql
```

## What Gets Created

Running the migration will:

✓ Create `domainVerification` table (for DNS verification codes)
✓ Create `domainAvailabilityCache` table (for RDAP caching)
✓ Add missing columns to `domain` table
✓ Create proper foreign keys
✓ Create performance indexes

## After Migration

Once the migration completes:

1. The form UI will work
2. Submitted domains will save to the database
3. DNS verification codes will generate
4. Verified domains will appear in the marketplace
5. Errors will show the exact reason (not just "Failed query")

## Verify It Worked

Test the sell flow:

1. Go to LeadsWork > Sell Domains
2. Fill in: domain name, price, category, description
3. Click "Submit Listing"
4. Should see the DNS verification code
5. Check dashboard - domain should appear with "Awaiting Verification" status

If you see specific error messages (not just generic failures), the migration worked!

## Need Help?

- Check browser console for exact error messages
- Check Vercel logs: `vercel logs --follow`
- Check database: Open Neon dashboard SQL Editor and verify tables exist
  ```sql
  \dt  -- List all tables
  SELECT column_name, data_type FROM information_schema.columns 
  WHERE table_name = 'domain';  -- Check domain columns
  ```
