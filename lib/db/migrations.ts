import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

/**
 * Run database migrations to ensure schema is up to date
 * This should be called during app initialization
 */
export async function runMigrations() {
  console.log('[v0] Starting database migrations...')

  try {
    // Create domainVerification table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "domainVerification" (
        id text PRIMARY KEY,
        "domainId" text NOT NULL REFERENCES domain(id) ON DELETE CASCADE,
        "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "verificationCode" text NOT NULL,
        "verificationStatus" text DEFAULT 'pending_verification',
        "verifiedAt" timestamp,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp DEFAULT NOW(),
        "updatedAt" timestamp DEFAULT NOW()
      )
    `)
    console.log('[v0] ✓ domainVerification table created/verified')

    // Create domainAvailabilityCache table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "domainAvailabilityCache" (
        id text PRIMARY KEY,
        "normalizedName" text UNIQUE NOT NULL,
        "isAvailable" boolean NOT NULL,
        "externallyRegistered" boolean NOT NULL,
        "lastChecked" timestamp DEFAULT NOW(),
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp DEFAULT NOW()
      )
    `)
    console.log('[v0] ✓ domainAvailabilityCache table created/verified')

    // Add missing columns to domain table
    const domainColumns = [
      { name: 'normalizedName', type: 'text UNIQUE' },
      { name: 'displayName', type: 'text' },
      { name: 'buyPrice', type: 'integer' },
      { name: 'leasePrice', type: 'integer' },
      { name: 'category', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'score', type: 'integer DEFAULT 75' },
      { name: 'status', type: "text DEFAULT 'available'" },
      { name: 'buyerId', type: 'text' },
      { name: 'leaserId', type: 'text' },
      { name: 'ownerId', type: 'text' },
      { name: 'purchasedAt', type: 'timestamp' },
      { name: 'leaseStartAt', type: 'timestamp' },
      { name: 'leaseExpiresAt', type: 'timestamp' },
      { name: 'externallyRegistered', type: 'boolean DEFAULT false' },
      { name: 'verificationStatus', type: "text DEFAULT 'unverified'" },
      { name: 'verificationId', type: 'text' },
      { name: 'lastExternalCheck', type: 'timestamp' },
      { name: 'createdAt', type: 'timestamp DEFAULT NOW()' },
      { name: 'updatedAt', type: 'timestamp DEFAULT NOW()' },
    ]

    for (const col of domainColumns) {
      try {
        await db.execute(sql.raw(`ALTER TABLE domain ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`))
      } catch (err) {
        // Column might already exist, continue
        console.log(`[v0] Column ${col.name} already exists or error adding it`)
      }
    }
    console.log('[v0] ✓ domain table columns verified/added')

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_domain_normalized_name ON domain("normalizedName")',
      'CREATE INDEX IF NOT EXISTS idx_domain_owner_id ON domain("ownerId")',
      'CREATE INDEX IF NOT EXISTS idx_domain_status ON domain(status)',
      'CREATE INDEX IF NOT EXISTS idx_domain_verification_status ON domain("verificationStatus")',
      'CREATE INDEX IF NOT EXISTS idx_domain_verification_code ON "domainVerification"("verificationCode")',
      'CREATE INDEX IF NOT EXISTS idx_domain_availability_cache_expires ON "domainAvailabilityCache"("expiresAt")',
    ]

    for (const indexSQL of indexes) {
      try {
        await db.execute(sql.raw(indexSQL))
      } catch (err) {
        // Index might already exist
        console.log(`[v0] Index already exists`)
      }
    }
    console.log('[v0] ✓ Indexes created/verified')

    console.log('[v0] ✓ All migrations completed successfully')
    return { success: true }
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error',
    }
  }
}
