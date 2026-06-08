-- Leadswork Production Database Migration
-- Run these SQL commands in your Neon database console if you encounter database errors

-- If businessLaunch table is missing these columns, add them:
ALTER TABLE businessLaunch
ADD COLUMN IF NOT EXISTS isApproved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approvedAt timestamp,
ADD COLUMN IF NOT EXISTS lastSavedAt timestamp DEFAULT NOW();

-- Verify all required tables exist. If any are missing, contact support.
-- The following tables must exist:
-- - user (authentication)
-- - session (authentication)
-- - account (authentication)
-- - verification (authentication)
-- - businessLaunch (core)
-- - launchStep (core)
-- - launchSubtask (core)
-- - launchAsset (assets)
-- - launchChat (AI chat)
-- - launchResource (resources)
-- - domain (domain management)
-- - domainAvailabilityCache (domain cache)
-- - domainVerification (domain verification)
-- - userDomain (user domains)

-- To verify tables exist:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
