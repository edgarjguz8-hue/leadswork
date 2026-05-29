import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

const migrationSQL = `
-- Create domain table with all required columns for sell domains feature
CREATE TABLE IF NOT EXISTS "domain" (
  "id" text PRIMARY KEY,
  "normalizedName" text NOT NULL UNIQUE,
  "displayName" text NOT NULL,
  "buyPrice" integer NOT NULL,
  "leasePrice" integer NOT NULL,
  "category" text NOT NULL,
  "description" text NOT NULL,
  "score" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending_verification',
  "buyerId" text REFERENCES "user"("id") ON DELETE SET NULL,
  "leaserId" text REFERENCES "user"("id") ON DELETE SET NULL,
  "ownerId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "purchasedAt" timestamp without time zone,
  "leaseStartAt" timestamp without time zone,
  "leaseExpiresAt" timestamp without time zone,
  "externallyRegistered" boolean DEFAULT false,
  "verificationStatus" text DEFAULT 'pending_verification',
  "verificationId" text,
  "lastExternalCheck" timestamp without time zone,
  "createdAt" timestamp without time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "domainVerification" (
  "id" text PRIMARY KEY,
  "domainId" text NOT NULL REFERENCES "domain"("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "verificationCode" text NOT NULL,
  "verificationStatus" text NOT NULL DEFAULT 'pending_verification',
  "verifiedAt" timestamp without time zone,
  "expiresAt" timestamp without time zone NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT NOW()
);

ALTER TABLE "domain" ADD CONSTRAINT "domain_verificationId_fkey" 
  FOREIGN KEY ("verificationId") REFERENCES "domainVerification"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "idx_domain_normalizedName" ON "domain"("normalizedName");
CREATE INDEX IF NOT EXISTS "idx_domain_status" ON "domain"("status");
CREATE INDEX IF NOT EXISTS "idx_domain_verificationStatus" ON "domain"("verificationStatus");
CREATE INDEX IF NOT EXISTS "idx_domain_ownerId" ON "domain"("ownerId");
CREATE INDEX IF NOT EXISTS "idx_domainVerification_domainId" ON "domainVerification"("domainId");
CREATE INDEX IF NOT EXISTS "idx_domainVerification_userId" ON "domainVerification"("userId");
`

export async function POST(req: NextRequest) {
  try {
    console.log('[v0] Migration API: Starting database migration...')
    
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log('[v0] Executing statement...')
      await db.execute(sql.raw(statement))
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully! The domain tables are now ready.',
    })
  } catch (error) {
    console.error('[v0] Migration API error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: `Migration failed: ${errorMsg}`,
    }, { status: 500 })
  }
}
