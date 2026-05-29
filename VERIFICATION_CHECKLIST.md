# Post-Migration Verification Checklist

## 1. Database Verification

Run these SQL queries in your Neon dashboard to verify the schema is correct:

```sql
-- Verify domain table exists and has required columns
SELECT COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'domain' 
AND column_name IN (
  'id', 'normalizedName', 'displayName', 'buyPrice', 'leasePrice',
  'category', 'description', 'score', 'status', 'ownerId', 'buyerId',
  'leaserId', 'verificationStatus', 'verificationId', 'externallyRegistered',
  'createdAt', 'updatedAt'
);
-- Expected result: 17 (all columns present)

-- Verify domainVerification table exists
SELECT COUNT(*) as exists 
FROM information_schema.tables 
WHERE table_name = 'domainVerification';
-- Expected result: 1

-- Verify domainAvailabilityCache table exists
SELECT COUNT(*) as exists 
FROM information_schema.tables 
WHERE table_name = 'domainAvailabilityCache';
-- Expected result: 1

-- Verify indexes were created
SELECT COUNT(*) as index_count 
FROM pg_indexes 
WHERE tablename IN ('domain', 'domainVerification', 'domainAvailabilityCache');
-- Expected result: 6 (all indexes created)
```

## 2. API Endpoint Verification

Run the migration endpoint to ensure it works:

```bash
# For development (localhost)
curl http://localhost:3000/api/admin/migrate

# For production
curl https://your-leadswork-app.vercel.app/api/admin/migrate

# Expected response:
# {
#   "success": true,
#   "message": "All migrations completed successfully"
# }
```

## 3. Functional Testing

### Test Sell Domain Flow

1. **Login/Auth**
   - ✓ Navigate to app
   - ✓ Sign in with test account
   - ✓ Are you logged in? (Check user menu)

2. **Sell Domains Page**
   - ✓ Click "Sell Domains" button
   - ✓ Page loads without errors
   - ✓ Form displays all fields

3. **Submit Domain**
   - ✓ Enter domain: test123456789.com
   - ✓ Enter price: 5000
   - ✓ Select category: Technology
   - ✓ Enter description: Test domain
   - ✓ Choose "Yes" for leasing
   - ✓ Enter lease price: 500
   - ✓ Click "Submit Listing"
   - ✓ No errors displayed
   - ✓ Verification modal appears
   - ✓ Verification code is displayed (format: leadswork-verify-[token])

4. **Check Dashboard**
   - ✓ Go to Dashboard
   - ✓ Switch to "Selling" tab
   - ✓ Domain appears in list
   - ✓ Status shows "Awaiting Verification"
   - ✓ Verification code visible

5. **Verify Ownership**
   - ✓ In verification modal, DNS code is shown
   - ✓ Click "Verify Ownership" button
   - ✓ (DNS lookup happens - may take a few seconds)
   - ✓ Expected: Either success or clear error message
   - (Note: DNS verification requires actual DNS record, so this may fail in test)

6. **After Verification** (if DNS record added)
   - ✓ Domain status changes to "Verified & Live"
   - ✓ Domain appears on homepage marketplace
   - ✓ Domain shows in Buy/Lease sections

### Test Error Messages

1. **Submit Duplicate Domain**
   - ✓ Submit same domain again
   - ✓ Error message: "This domain is already listed on LeadsWork"

2. **Missing Fields**
   - ✓ Try submitting with empty field
   - ✓ Clear error message shown (e.g., "Domain name is required")

3. **Invalid Domain**
   - ✓ Enter invalid domain: "not a domain"
   - ✓ Error message: "Invalid domain format"

4. **Invalid Price**
   - ✓ Enter price: "abc"
   - ✓ Error message: "Asking price must be a valid positive number"

## 4. Error Logging Check

Open browser console (F12 → Console) and submit a domain:

- ✓ Should see `[v0]` prefixed logs
- ✓ No red error messages in console (warnings OK)
- ✓ Logs show: "Domain listing created", etc.

Check Vercel logs:

```bash
vercel logs --follow
```

- ✓ Should show `[v0]` prefixed server logs
- ✓ Successful operations logged
- ✓ Any errors are specific (not generic "Failed query")

## 5. Homepage Verification

1. **Browse Domains**
   - ✓ Go to homepage
   - ✓ Domains display with prices
   - ✓ No console errors
   - ✓ Buy/Lease buttons work

2. **Search/Filter**
   - ✓ Search domains by name
   - ✓ Filter by category
   - ✓ No database errors

## 6. Database State Check

After testing, query the database to verify data:

```sql
-- Check submitted domains
SELECT id, "normalizedName", "displayName", status, "verificationStatus", "ownerId"
FROM domain
ORDER BY "createdAt" DESC
LIMIT 5;

-- Check verification records
SELECT d."displayName", v."verificationCode", v."verificationStatus"
FROM "domainVerification" v
JOIN domain d ON v."domainId" = d.id
ORDER BY v."createdAt" DESC
LIMIT 5;
```

## 7. Performance Check

Test database performance:

```sql
-- Query with index (should be fast)
SELECT * FROM domain WHERE "normalizedName" = 'example.com';

-- Query with owner filter (should be fast)
SELECT * FROM domain WHERE "ownerId" = 'user_id' AND status = 'available';

-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM domain WHERE status = 'available' LIMIT 10;
-- Should show index scan, not sequential scan
```

## 8. Final Sign-Off

- ✓ All SQL queries return expected row counts
- ✓ Migration API endpoint returns success
- ✓ Can submit a domain without errors
- ✓ Domain appears in dashboard with correct status
- ✓ Homepage shows available domains
- ✓ Error messages are specific and helpful
- ✓ Logs show `[v0]` prefixed debug information
- ✓ No TypeScript/compilation errors
- ✓ Design remains unchanged from original

## Troubleshooting

### "Migration endpoint returns 500 error"
- Check Vercel logs: `vercel logs --follow`
- Ensure DATABASE_URL is set in environment
- Try running SQL migration directly in Neon dashboard

### "Domains still show 'Failed query' error"
- Re-run migration: `curl /api/admin/migrate`
- Check Neon dashboard to verify tables exist
- Clear browser cache and refresh

### "Verification code not generated"
- Check domainVerification table exists
- Check dns-verification.ts imports are correct
- Review Vercel logs for dns-verification errors

### "Domain appears but can't be purchased"
- Verify domain status is "available" (not "pending_verification")
- Check domain was verified (verificationStatus = "verified_owner")
- Try running DNS verification if status is pending

## Success Criteria

✅ Database schema is fully synchronized
✅ All required tables and columns exist
✅ Seller can submit domain without errors
✅ Domain gets verification code
✅ Dashboard shows submitted domains
✅ Error messages are specific
✅ Homepage displays available domains
✅ No console errors on any page
