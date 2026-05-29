# ⚡ QUICK START - SELL DOMAINS READY

## DO THIS NOW (Choose 1):

### Option 1: Vercel (Easiest)
```bash
curl -X POST https://your-leadswork-app.vercel.app/api/admin/setup-domain-tables
```

### Option 2: Local Dev
```bash
npx ts-node scripts/run-migration.ts
```

### Option 3: Neon Dashboard
1. Go to https://console.neon.tech
2. Open SQL Editor
3. Run: migrations/create_domain_tables.sql

---

## What You Get After Setup

✅ Users can list domains they own
✅ DNS verification ensures they're the owner
✅ Verified domains appear in marketplace
✅ Domains appear in seller's dashboard
✅ No more "table does not exist" errors

---

## How Users List a Domain

1. Click "Sell" button
2. Enter domain, prices, category, description
3. Click "Submit Listing"
4. Add DNS TXT record (instructions shown)
5. Click "Verify Ownership"
6. Domain is live in marketplace

---

## File Guide

| File | Purpose |
|------|---------|
| `migrations/create_domain_tables.sql` | Database schema |
| `app/api/admin/setup-domain-tables/route.ts` | Setup endpoint |
| `scripts/run-migration.ts` | Local migration runner |
| `SELL_DOMAINS_FIX_SUMMARY.md` | Full technical details |
| `SELL_DOMAINS_COMPLETE_GUIDE.md` | Complete user guide |

---

## Troubleshooting

**Error: "relation domain does not exist"**
→ Run one of the 3 setup commands above

**Error: "column ownerId does not exist"**
→ Run one of the 3 setup commands above

**DNS verification not working**
→ Wait 5-15 minutes, DNS takes time to propagate

**Domain doesn't appear in marketplace**
→ Verify it shows status='available' in database

---

## Status: COMPLETE ✅

The Sell Domains feature is now fully fixed and ready to use. All error handling is in place, database schema is created, and users can list domains with ownership verification.
