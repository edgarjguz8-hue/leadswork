## LeadsWork Sell Domains - Complete Setup & Troubleshooting Guide

### STEP 1: Database Setup (CRITICAL - DO THIS FIRST)

Your database is missing the required tables. Run ONE of these commands:

#### Quick Vercel Setup (Recommended):
```bash
curl -X POST https://your-vercel-app-url.vercel.app/api/admin/setup-domain-tables
```

#### Neon Dashboard:
1. Go to https://console.neon.tech
2. Open your database SQL Editor
3. Run: `migrations/create_domain_tables.sql`

#### Local Development:
```bash
npx ts-node scripts/run-migration.ts
```

**Expected output:** "Database migration completed successfully!"

---

### STEP 2: Understanding the System

#### Database Tables Created

**`domain` table**
- Stores domain listings
- Columns: id, normalizedName, displayName, buyPrice, leasePrice, category, description, score, status, ownerId, verificationStatus, etc.
- Unique constraint on normalizedName (no duplicate domains)
- Default status: `pending_verification`

**`domainVerification` table**
- Tracks DNS ownership verification
- Links to domain table
- Stores verification codes (TXT records)
- Tracks verification status

#### Domain Status Flow

```
User submits domain
        ↓
domain.status = 'pending_verification'
        ↓
User adds DNS TXT record (shown in UI)
        ↓
User clicks "Verify Ownership"
        ↓
System checks DNS for verification code
        ↓
If found: domain.status = 'available'
         domain.verificationStatus = 'verified_owner'
        ↓
Domain appears in marketplace (visible to buyers)
        ↓
Domain appears in user's dashboard (selling tab)
```

#### Verification Status

- `pending_verification` - Waiting for DNS verification
- `verified_owner` - Successfully verified, publicly listed
- `rejected` - Verification failed (can retry)

---

### STEP 3: How Users List Domains

1. **User clicks "Sell"** on homepage
2. **Fills out form:**
   - Domain name (e.g., yourdomain.com)
   - Buy price (required)
   - Lease price (optional)
   - Category (required)
   - Description (required)
3. **Clicks "Submit Listing"**
   - Domain saved with `status='pending_verification'`
   - DNS verification code generated
   - User shown TXT record to add

4. **User adds TXT record** to their domain registrar
   - Example: `leadswork-verify-[random-code]`

5. **User clicks "Verify Ownership"**
   - System queries domain's DNS records
   - Checks for the TXT record
   - If found: domain becomes public

6. **Domain is now live**
   - Appears in marketplace
   - Appears in user's dashboard under "Selling"
   - Buyers can make offers

---

### STEP 4: Testing the Feature

Test as a seller:
```
1. Log in
2. Click "Sell"
3. Enter:
   - Domain: example.com (or your own test domain)
   - Buy price: $5000
   - Lease price: $500/month
   - Category: Technology
   - Description: Premium tech domain
4. Click "Submit Listing"
5. Verify you see DNS code
6. Add TXT record to your domain
7. Click "Verify"
8. Check dashboard - domain should appear under "Selling"
```

Test as a buyer:
```
1. Go to marketplace
2. See all verified domains
3. Can buy/lease verified domains
```

---

### STEP 5: Common Issues & Solutions

#### Error: "column ownerId does not exist"
**Solution:** Database tables haven't been created. Run the setup command in Step 1.

#### Error: "relation domain does not exist"
**Solution:** Run the migration. The `domain` table is missing.

#### Error: "This domain is already listed on LeadsWork"
**Solution:** The domain normalized name already exists. This prevents duplicates - expected behavior.

#### DNS verification shows error
**Possible causes:**
1. TXT record not fully propagated (DNS can take 5-15 minutes)
2. Wrong TXT record name or value
3. Wrong domain registrar account

**Solution:** Wait 5-10 minutes and retry. Verify TXT record is exactly as shown.

#### Domain doesn't appear in marketplace
**Check:**
1. Is status = 'available'? (check: `SELECT * FROM domain WHERE normalizedName='yourdomain'`)
2. Is verificationStatus = 'verified_owner'?
3. Run marketplace query to see available domains

```sql
SELECT * FROM domain WHERE status='available' AND verificationStatus='verified_owner'
```

---

### STEP 6: Database Queries for Debugging

Check domains by owner:
```sql
SELECT id, displayName, status, verificationStatus FROM domain WHERE ownerId='[user-id]'
```

Check all unverified domains:
```sql
SELECT * FROM domain WHERE verificationStatus='pending_verification'
```

Check verification codes:
```sql
SELECT domainId, verificationCode, verificationStatus FROM domainVerification WHERE userId='[user-id]'
```

Check marketplace (what buyers see):
```sql
SELECT displayName, buyPrice, leasePrice, category FROM domain 
WHERE status='available' AND verificationStatus='verified_owner'
ORDER BY score DESC
```

---

### STEP 7: Feature Checklist

- [ ] Database migration completed
- [ ] `domain` table exists with all columns
- [ ] `domainVerification` table exists
- [ ] Can submit domain (appears in dashboard with pending_verification status)
- [ ] DNS verification code shown to user
- [ ] Can add TXT record and verify
- [ ] After verification, domain status changes to 'available'
- [ ] Domain appears in marketplace
- [ ] Dashboard shows "Selling" tab with user's domains
- [ ] No database errors in console

---

### STEP 8: Design & User Experience

- LeadsWork dark theme maintained (no changes)
- Emerald accents for seller actions
- Sky accents for marketplace/buy actions
- Clear error messages (specific database errors shown)
- Success confirmation when domain verified
- DNS instructions clear and simple

---

### CRITICAL REMINDERS

✅ **DO:**
- Run the migration first before testing
- Wait for DNS propagation (5-15 minutes)
- Check database with SQL queries if stuck
- Use exact TXT record name and value shown

❌ **DON'T:**
- Try to list same domain twice (unique constraint)
- Submit form with empty required fields
- Modify verification code before user receives it
- Rush DNS verification - it can take time

---

### Support

If issues persist after following this guide:
1. Check database tables exist: `\dt` in SQL console
2. Check error messages in browser console (F12)
3. Check server logs for "[v0]" errors
4. Verify DATABASE_URL environment variable is set
5. Ensure Neon database is running

**All errors now include specific details to debug the issue.**
