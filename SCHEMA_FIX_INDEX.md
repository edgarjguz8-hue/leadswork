# LeadsWork Database Schema - Complete Fix Documentation

## 🎯 What This Is

Complete fix for the Sell Domains feature database schema synchronization issues. Includes:
- ✅ Enhanced error messages
- ✅ Three migration options
- ✅ Complete schema documentation
- ✅ Verification checklist
- ✅ Workflow diagrams

## 🚀 Quick Start (30 seconds)

```bash
# Run the migration
curl https://your-leadswork-app.vercel.app/api/admin/migrate

# Test it
# 1. Sign in
# 2. Go to Sell Domains
# 3. Submit a test domain
# 4. Should see verification code (not "Failed query" error)
```

## 📖 Documentation Index

### Getting Started
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Quick start guide for running migrations
- **[README_SCHEMA_FIX.md](./README_SCHEMA_FIX.md)** - Complete overview of what was fixed

### Understanding the System
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete schema reference with all tables and columns
- **[COLUMN_REFERENCE.md](./COLUMN_REFERENCE.md)** - Column naming conventions and validation rules
- **[WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md)** - Visual diagrams of the seller flow and database states

### Implementation Details
- **[SCHEMA_FIX_SUMMARY.md](./SCHEMA_FIX_SUMMARY.md)** - What was changed and why
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Post-deployment testing checklist

## 🗂️ Project Files

### New Files Created

**Migrations:**
- `migrations/001_add_domain_verification.sql` - SQL migration file
- `scripts/migrate.sh` - Bash migration script
- `lib/db/migrations.ts` - Node.js migration runner

**API:**
- `app/api/admin/migrate/route.ts` - Migration REST endpoint

**Documentation:**
- `DATABASE_SCHEMA.md` - Schema reference
- `MIGRATION_GUIDE.md` - Migration instructions
- `SCHEMA_FIX_SUMMARY.md` - Implementation summary
- `VERIFICATION_CHECKLIST.md` - Testing checklist
- `COLUMN_REFERENCE.md` - Column reference
- `WORKFLOW_DIAGRAMS.md` - Visual diagrams
- `README_SCHEMA_FIX.md` - Complete fix overview

### Modified Files

- `app/actions/domain.ts` - Better error messages
- `lib/marketplace-data.ts` - Better error logging

## 🔍 What Gets Fixed

### Before
```
User tries to sell domain
↓
"Error submitting domain listing: Failed query"
↓
No idea what went wrong
❌ Confusing
```

### After
```
User tries to sell domain
↓
"Error submitting domain listing: column ownerId does not exist"
↓
Run migration, columns are added
✅ Clear problem, clear solution
```

## 🛠️ Three Migration Options

### Option 1: REST API (Easiest)
```bash
curl https://leadswork.vercel.app/api/admin/migrate
```
- One command
- Works on Vercel
- No CLI tools needed
- Optional auth token for production

### Option 2: Direct SQL (Most Direct)
```bash
# In Neon dashboard SQL Editor:
# Paste: migrations/001_add_domain_verification.sql
```
- See changes in real-time
- No external tools
- Can be done immediately

### Option 3: Bash Script (Local)
```bash
bash scripts/migrate.sh
```
- For local development
- Requires `psql` installed
- Requires DATABASE_URL set

## ✅ What Gets Created

### Tables
- ✅ `domainVerification` - Tracks DNS verification codes
- ✅ `domainAvailabilityCache` - Caches external RDAP lookups
- ✅ Enhanced `domain` table - Adds all missing columns

### Columns (domain table)
- ✅ normalizedName, displayName
- ✅ buyPrice, leasePrice
- ✅ category, description, score
- ✅ status, verificationStatus
- ✅ ownerId, buyerId, leaserId, verificationId
- ✅ externallyRegistered, purchasedAt, leaseStartAt, leaseExpiresAt
- ✅ lastExternalCheck, createdAt, updatedAt

### Indexes (for performance)
- ✅ normalizedName (unique lookups)
- ✅ ownerId (seller domains)
- ✅ status (available domains)
- ✅ verificationStatus (filter pending)
- ✅ verificationCode (DNS verification)
- ✅ expiresAt (cache cleanup)

### Foreign Keys
- ✅ domain → user (ownerId, buyerId, leaserId)
- ✅ domain → domainVerification (verificationId)
- ✅ domainVerification → domain (domainId)
- ✅ domainVerification → user (userId)

## 🧪 Testing the Fix

1. **Run migration:**
   ```bash
   curl /api/admin/migrate
   ```

2. **Verify in database:**
   ```sql
   SELECT COUNT(*) FROM "domainVerification";  -- Should be 0
   SELECT COUNT(*) FROM domain;                 -- Should be > 0
   ```

3. **Test the flow:**
   - Sign in to app
   - Go to Sell Domains
   - Submit: example.com, $5000, Technology, "Test"
   - See DNS verification code appear
   - Check dashboard → domain listed with "Awaiting Verification"

4. **Verify errors are specific:**
   - Try: domain with missing field → specific error
   - Try: duplicate domain → specific error
   - Try: invalid price → specific error

## 📊 Error Messages - Before vs After

| Scenario | Before | After |
|----------|--------|-------|
| Database column missing | "Failed query" | "column ownerId does not exist" |
| Domain already listed | "Failed query" | "This domain is already listed on LeadsWork" |
| Invalid domain format | "Failed query" | "Invalid domain format" |
| Missing field | "Failed query" | "Description is required" |
| Network error | "Failed query" | Specific network error |
| DNS verification failed | "Failed query" | "We could not verify ownership yet..." |

## 🎨 Design Impact

**NONE** - All changes are backend infrastructure

- ✅ No UI changes
- ✅ No visual changes
- ✅ No design modifications
- ✅ LeadsWork appearance completely unchanged
- ✅ Same dark theme, colors, fonts, layouts

## 📋 Checklist for Deployment

- [ ] Read MIGRATION_GUIDE.md
- [ ] Run migration via one of three methods
- [ ] Run SQL verification queries from VERIFICATION_CHECKLIST.md
- [ ] Test submit domain flow
- [ ] Test error cases
- [ ] Check Vercel logs for `[v0]` prefixed messages
- [ ] Verify domains appear in marketplace after DNS verification
- [ ] Check dashboard shows seller domains with correct status

## 🔗 Related Files

### Database Configuration
- `lib/db/schema.ts` - Drizzle ORM schema definition (already correct)
- `lib/db/index.ts` - Database connection setup

### Domain Actions
- `app/actions/domain.ts` - Server actions (updated with better errors)
- `lib/marketplace-data.ts` - Marketplace data fetching (updated with better errors)

### Verification System
- `lib/dns-verification.ts` - DNS TXT record verification
- `lib/domain-availability.ts` - External domain registry checks
- `lib/domain-utils.ts` - Domain validation and normalization

### UI Components
- `components/sell-domain-form.tsx` - Sell domain UI
- `components/ownership-verification.tsx` - DNS verification modal
- `app/dashboard/page.tsx` - Seller dashboard

## 🆘 Troubleshooting

### Migration fails with "connection refused"
→ Check `DATABASE_URL` environment variable is set

### "Column still doesn't exist" after migration
→ Run migration again: `curl /api/admin/migrate`
→ Check Neon dashboard SQL Editor for errors

### Domain submit still shows generic error
→ Clear browser cache
→ Restart dev server
→ Check Vercel logs: `vercel logs --follow`

### Verification code not appearing
→ Check `lib/dns-verification.ts` is importing correctly
→ Check `domainVerification` table was created
→ Review Vercel logs for specific errors

### Can see domain in dashboard but not marketplace
→ Verify domain status is "available" (not "pending_verification")
→ Verify verificationStatus is "verified_owner"
→ Run manual check: `SELECT * FROM domain WHERE normalizedName = 'example.com'`

## 📚 Additional Resources

- **Drizzle ORM Docs:** https://orm.drizzle.team
- **Neon PostgreSQL:** https://neon.tech
- **DNS TXT Records:** https://en.wikipedia.org/wiki/TXT_record
- **RDAP Protocol:** https://www.icann.org/en/domain-abuse-activity-reporting/rdap

## 🎓 Key Concepts

**Column Names:** Use camelCase (normalizedName, not normalized_name)

**Status Values:** "available", "pending_verification", "sold", "leased"

**Verification:** DNS TXT record lookup proves domain ownership

**Schema Sync:** Database columns must match Drizzle ORM schema definition

**Error Messages:** Specific errors help with debugging

## 📞 Support

If you encounter issues:

1. **Check logs:** `vercel logs --follow`
2. **Look for `[v0]` prefix** - These are our debug logs
3. **Check error message** - It now shows specific reasons
4. **Reference documentation** - See VERIFICATION_CHECKLIST.md
5. **Query database** - Run SQL queries to verify schema

---

**Status:** ✅ Complete and ready to deploy
**Last Updated:** 2026-01-15
**Design Changes:** None (backend-only fixes)
