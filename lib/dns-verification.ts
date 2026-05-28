import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { domainVerification } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const VERIFICATION_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Generate a unique verification code for a domain
 */
export function generateVerificationCode(): string {
  const randomToken = randomBytes(12).toString('hex')
  return `leadswork-verify-${randomToken}`
}

/**
 * Create a DNS verification request for a domain
 */
export async function createVerificationRequest({
  domainId,
  userId,
}: {
  domainId: string
  userId: string
}): Promise<{
  success: boolean
  verificationCode?: string
  error?: string
  existingVerification?: {
    verificationCode: string
    expiresAt: Date
  }
}> {
  try {
    // Check if there's an existing pending verification
    const existing = await db
      .select()
      .from(domainVerification)
      .where(
        and(
          eq(domainVerification.domainId, domainId),
          eq(domainVerification.userId, userId),
          eq(domainVerification.verificationStatus, 'pending_verification')
        )
      )
      .limit(1)

    if (existing.length > 0) {
      const verification = existing[0]
      return {
        success: true,
        verificationCode: verification.verificationCode,
        existingVerification: {
          verificationCode: verification.verificationCode,
          expiresAt: verification.expiresAt,
        },
      }
    }

    // Generate new verification code
    const code = generateVerificationCode()
    const verificationId = `verify_${domainId}_${userId}_${Date.now()}`
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY)

    await db.insert(domainVerification).values({
      id: verificationId,
      domainId,
      userId,
      verificationCode: code,
      verificationStatus: 'pending_verification',
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      success: true,
      verificationCode: code,
    }
  } catch (error) {
    console.error('[v0] Failed to create verification request:', error)
    return {
      success: false,
      error: 'Failed to create verification request',
    }
  }
}

/**
 * Verify DNS TXT record for domain ownership
 */
export async function verifyDNSRecord(domainName: string): Promise<{
  success: boolean
  verified: boolean
  foundRecords?: string[]
  error?: string
}> {
  try {
    // Remove www prefix if present
    const cleanDomain = domainName.replace(/^www\./, '').toLowerCase()

    // Query DNS TXT records
    const response = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=TXT`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return {
        success: false,
        verified: false,
        error: 'Failed to query DNS records',
      }
    }

    const data = (await response.json()) as {
      Answer?: Array<{ data: string }>
    }

    const txtRecords = data.Answer?.map((record) => record.data) || []
    console.log('[v0] DNS TXT records found:', txtRecords)

    // Check if any record contains leadswork-verify prefix
    const verified = txtRecords.some((record) =>
      record.includes('leadswork-verify-') || record.includes('leadswork-verify')
    )

    return {
      success: true,
      verified,
      foundRecords: txtRecords,
    }
  } catch (error) {
    console.error('[v0] DNS verification check error:', error)
    return {
      success: false,
      verified: false,
      error: 'Failed to verify DNS records',
    }
  }
}

/**
 * Verify ownership by checking DNS record and updating verification status
 */
export async function verifyDomainOwnership({
  domainId,
  domainName,
  userId,
}: {
  domainId: string
  domainName: string
  userId: string
}): Promise<{
  success: boolean
  verified: boolean
  error?: string
}> {
  try {
    // Get the verification request
    const verification = await db
      .select()
      .from(domainVerification)
      .where(
        and(
          eq(domainVerification.domainId, domainId),
          eq(domainVerification.userId, userId),
          eq(domainVerification.verificationStatus, 'pending_verification')
        )
      )
      .limit(1)

    if (verification.length === 0) {
      return {
        success: false,
        verified: false,
        error: 'No pending verification found',
      }
    }

    const verificationRecord = verification[0]

    // Check DNS records
    const dnsCheck = await verifyDNSRecord(domainName)

    if (!dnsCheck.success || !dnsCheck.verified) {
      return {
        success: true,
        verified: false,
        error: `DNS verification failed. Please add the TXT record "${verificationRecord.verificationCode}" to your domain.`,
      }
    }

    // Update verification status to verified
    const verifiedAt = new Date()
    await db
      .update(domainVerification)
      .set({
        verificationStatus: 'verified_owner',
        verifiedAt,
        updatedAt: verifiedAt,
      })
      .where(eq(domainVerification.id, verificationRecord.id))

    console.log('[v0] Domain ownership verified:', domainName, 'for user:', userId)

    return {
      success: true,
      verified: true,
    }
  } catch (error) {
    console.error('[v0] Domain ownership verification error:', error)
    return {
      success: false,
      verified: false,
      error: 'Failed to verify domain ownership',
    }
  }
}

/**
 * Check if a user has verified ownership of a domain
 */
export async function hasVerifiedOwnership({
  domainId,
  userId,
}: {
  domainId: string
  userId: string
}): Promise<boolean> {
  try {
    const verification = await db
      .select()
      .from(domainVerification)
      .where(
        and(
          eq(domainVerification.domainId, domainId),
          eq(domainVerification.userId, userId),
          eq(domainVerification.verificationStatus, 'verified_owner')
        )
      )
      .limit(1)

    return verification.length > 0
  } catch (error) {
    console.error('[v0] Error checking verified ownership:', error)
    return false
  }
}

/**
 * Get current verification status for a domain and user
 */
export async function getVerificationStatus({
  domainId,
  userId,
}: {
  domainId: string
  userId: string
}): Promise<{
  status: 'unverified' | 'pending_verification' | 'verified_owner' | 'rejected'
  verificationCode?: string
  expiresAt?: Date
  verifiedAt?: Date
}> {
  try {
    const verification = await db
      .select()
      .from(domainVerification)
      .where(
        and(
          eq(domainVerification.domainId, domainId),
          eq(domainVerification.userId, userId)
        )
      )
      .limit(1)

    if (verification.length === 0) {
      return { status: 'unverified' }
    }

    const record = verification[0]
    return {
      status: (record.verificationStatus as any) || 'unverified',
      verificationCode: record.verificationCode,
      expiresAt: record.expiresAt,
      verifiedAt: record.verifiedAt || undefined,
    }
  } catch (error) {
    console.error('[v0] Error getting verification status:', error)
    return { status: 'unverified' }
  }
}
