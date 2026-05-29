'use server'

import { db } from '@/lib/db'
import { userDomain, domain as domainTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { normalizeDomainName } from '@/lib/domain-utils'
import { getDomainAvailability } from '@/lib/domain-availability'
import {
  createVerificationRequest,
  verifyDomainOwnership,
  hasVerifiedOwnership,
  getVerificationStatus,
} from '@/lib/dns-verification'

/**
 * Check if a domain is available for purchase/lease
 */
export async function checkDomainAvailability(domainId: string) {
  try {
    const result = await db
      .select()
      .from(domainTable)
      .where(eq(domainTable.id, domainId))
      .limit(1)

    if (result.length === 0) {
      return {
        success: false,
        available: false,
        error: 'Domain not found',
      }
    }

    const domain = result[0]
    
    if (domain.status !== 'available') {
      return {
        success: true,
        available: false,
        status: domain.status,
        error: `Domain is currently ${domain.status}`,
      }
    }

    return {
      success: true,
      available: true,
      domain: {
        id: domain.id,
        displayName: domain.displayName,
        buyPrice: domain.buyPrice,
        leasePrice: domain.leasePrice,
      },
    }
  } catch (error) {
    console.error('Error checking domain availability:', error)
    return {
      success: false,
      available: false,
      error: 'Failed to check domain availability',
    }
  }
}

/**
 * Mark a domain as sold (called from webhook)
 */
export async function markDomainAsSold({
  domainId,
  buyerId,
  priceInCents,
  stripeSessionId,
}: {
  domainId: string
  buyerId: string
  priceInCents: number
  stripeSessionId: string
}) {
  try {
    const id = randomUUID()
    
    // Update domain status to sold
    await db
      .update(domainTable)
      .set({
        status: 'sold',
        buyerId,
        purchasedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(domainTable.id, domainId))

    // Create user domain record
    await db.insert(userDomain).values({
      id,
      userId: buyerId,
      domainId,
      type: 'buy',
      priceInCents,
      stripeSessionId,
      purchasedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      success: true,
      userDomainId: id,
    }
  } catch (error) {
    console.error('Error marking domain as sold:', error)
    return {
      success: false,
      error: 'Failed to mark domain as sold',
    }
  }
}

/**
 * Mark a domain as leased (called from webhook)
 */
export async function markDomainAsLeased({
  domainId,
  leaserId,
  priceInCents,
  stripeSessionId,
}: {
  domainId: string
  leaserId: string
  priceInCents: number
  stripeSessionId: string
}) {
  try {
    const id = randomUUID()
    const leaseExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Update domain status to leased
    await db
      .update(domainTable)
      .set({
        status: 'leased',
        leaserId,
        leaseStartAt: new Date(),
        leaseExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(domainTable.id, domainId))

    // Create user domain record
    await db.insert(userDomain).values({
      id,
      userId: leaserId,
      domainId,
      type: 'lease',
      priceInCents,
      stripeSessionId,
      purchasedAt: new Date(),
      expiresAt: leaseExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      success: true,
      userDomainId: id,
    }
  } catch (error) {
    console.error('Error marking domain as leased:', error)
    return {
      success: false,
      error: 'Failed to mark domain as leased',
    }
  }
}

/**
 * Get all available domains for marketplace (only verified domains ready for sale)
 */
export async function getAvailableDomains() {
  try {
    console.log('[v0] Fetching available domains for marketplace')
    const domains = await db
      .select()
      .from(domainTable)
      .where(
        and(
          eq(domainTable.status, 'available'),
          eq(domainTable.verificationStatus, 'verified_owner')
        )
      )

    console.log(`[v0] Found ${domains.length} available domains`)
    return {
      success: true,
      domains,
    }
  } catch (error) {
    console.error('[v0] Error fetching available domains:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: `Failed to fetch available domains: ${errorMessage}`,
    }
  }
}

/**
 * Get user's purchased domains
 */
export async function getUserDomains(userId: string) {
  try {
    const userDomains = await db
      .select()
      .from(userDomain)
      .where(eq(userDomain.userId, userId))

    return {
      success: true,
      domains: userDomains,
    }
  } catch (error) {
    console.error('Error fetching user domains:', error)
    return {
      success: false,
      error: 'Failed to fetch user domains',
    }
  }
}

/**
 * Check external domain availability and requirements
 */
export async function checkExternalDomainStatus(domainName: string) {
  try {
    const normalized = normalizeDomainName(domainName)

    // Check external availability
    const availability = await getDomainAvailability(domainName)

    if (!availability.success) {
      return {
        success: false,
        error: availability.error || 'Failed to check domain availability',
      }
    }

    return {
      success: true,
      isAvailable: availability.isAvailable,
      externallyRegistered: availability.externallyRegistered,
      cached: availability.cached,
      message: availability.externallyRegistered
        ? 'This domain is already registered and cannot be listed as available on LeadsWork.'
        : 'Domain is available for listing',
    }
  } catch (error) {
    console.error('[v0] Error checking external domain status:', error)
    return {
      success: false,
      error: 'Failed to check domain status',
    }
  }
}

/**
 * Request ownership verification for a domain
 */
export async function requestDomainVerification({
  domainId,
  userId,
}: {
  domainId: string
  userId: string
}) {
  try {
    const result = await createVerificationRequest({ domainId, userId })

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      }
    }

    return {
      success: true,
      verificationCode: result.verificationCode,
      existingVerification: result.existingVerification,
    }
  } catch (error) {
    console.error('[v0] Error requesting verification:', error)
    return {
      success: false,
      error: 'Failed to request verification',
    }
  }
}

/**
 * Verify domain ownership via DNS record
 */
export async function verifyDomainOwnershipAction({
  domainId,
  domainName,
  userId,
}: {
  domainId: string
  domainName: string
  userId: string
}) {
  try {
    const result = await verifyDomainOwnership({
      domainId,
      domainName,
      userId,
    })

    return result
  } catch (error) {
    console.error('[v0] Error verifying domain ownership:', error)
    return {
      success: false,
      verified: false,
      error: 'Failed to verify domain ownership',
    }
  }
}

/**
 * Get domain verification status for a user
 */
export async function getDomainVerificationStatus({
  domainId,
  userId,
}: {
  domainId: string
  userId: string
}) {
  try {
    const status = await getVerificationStatus({ domainId, userId })
    const hasVerified = await hasVerifiedOwnership({ domainId, userId })

    return {
      success: true,
      status: status.status,
      verificationCode: status.verificationCode,
      expiresAt: status.expiresAt,
      verifiedAt: status.verifiedAt,
      isVerified: hasVerified,
    }
  } catch (error) {
    console.error('[v0] Error getting verification status:', error)
    return {
      success: false,
      status: 'unverified',
      isVerified: false,
      error: 'Failed to get verification status',
    }
  }
}

/**
 * Submit a domain listing for seller (creates domain with pending status)
 */
export async function submitDomainListing({
  userId,
  domainName,
  buyPrice,
  leasePrice,
  category,
  description,
  isLeasing,
}: {
  userId: string
  domainName: string
  buyPrice: number
  leasePrice: number
  category: string
  description: string
  isLeasing: boolean
}) {
  try {
    const normalized = normalizeDomainName(domainName)
    console.log('[v0] Submitting domain listing:', normalized)

    // Check if domain already exists in LeadsWork
    const existing = await db
      .select()
      .from(domainTable)
      .where(eq(domainTable.normalizedName, normalized))
      .limit(1)

    if (existing.length > 0) {
      const domain = existing[0]
      // Block if status is available, pending, sold, or leased
      const blockedStatuses = ['available', 'pending', 'sold', 'leased']
      if (blockedStatuses.includes(domain.status)) {
        console.log(`[v0] Domain already listed with status: ${domain.status}`)
        return {
          success: false,
          error: `This domain is already listed on LeadsWork. Only one listing per domain is allowed.`,
        }
      }
    }

    // Create domain with pending status
    const domainId = randomUUID()
    const score = Math.min(100, Math.floor(Math.random() * 40 + 60))
    const buyPriceInCents = Math.round(buyPrice * 100)
    const leasePriceInCents = Math.round(leasePrice * 100)

    console.log('[v0] Creating domain record:', { domainId, normalized, status: 'pending' })

    await db.insert(domainTable).values({
      id: domainId,
      normalizedName: normalized,
      displayName: domainName,
      buyPrice: buyPriceInCents,
      leasePrice: leasePriceInCents,
      category,
      description,
      score,
      status: 'pending',
      ownerId: userId,
      externallyRegistered: true,
      verificationStatus: 'pending_verification',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create verification request
    console.log('[v0] Creating verification request for domain', domainId)
    const verificationResult = await createVerificationRequest({
      domainId,
      userId,
    })

    if (!verificationResult.success) {
      console.error('[v0] Failed to create verification request:', verificationResult.error)
      return {
        success: false,
        error: 'Failed to create verification request. Please try again.',
      }
    }

    console.log('[v0] Domain listing created successfully. Verification code:', verificationResult.verificationCode)

    return {
      success: true,
      domainId,
      verificationCode: verificationResult.verificationCode,
      message: 'Domain listing created! Please verify ownership by adding the DNS TXT record to make it live on the marketplace.',
    }
  } catch (error) {
    console.error('[v0] Error submitting domain listing:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Full error details:', errorMsg)
    return {
      success: false,
      error: `Failed to submit domain listing. Please try again.`,
    }
  }
}

/**
 * Confirm domain verification (called after DNS check passes)
 */
export async function confirmDomainVerification({
  domainId,
  userId,
}: {
  domainId: string
  userId: string
}) {
  try {
    console.log('[v0] Starting domain verification confirmation for:', { domainId, userId })
    
    // Verify ownership via DNS
    const domain = await db
      .select()
      .from(domainTable)
      .where(eq(domainTable.id, domainId))
      .limit(1)

    if (domain.length === 0) {
      console.error('[v0] Domain not found:', domainId)
      return {
        success: false,
        verified: false,
        error: 'Domain not found',
      }
    }

    const domainRecord = domain[0]
    console.log('[v0] Found domain:', domainRecord.displayName)

    // Check that the requesting user is the owner
    if (domainRecord.ownerId !== userId) {
      console.error('[v0] User is not the owner of this domain')
      return {
        success: false,
        verified: false,
        error: 'You do not own this domain',
      }
    }

    // Verify ownership via DNS TXT record
    console.log('[v0] Verifying DNS TXT record for:', domainRecord.displayName)
    const verificationResult = await verifyDomainOwnership({
      domainId,
      domainName: domainRecord.displayName,
      userId,
    })

    if (!verificationResult.success || !verificationResult.verified) {
      console.error('[v0] DNS verification failed:', verificationResult.error)
      return verificationResult
    }

    console.log('[v0] DNS verification successful! Updating domain status to available')

    // Update domain status to available only after DNS verification passes
    const now = new Date()
    await db
      .update(domainTable)
      .set({
        status: 'available',
        verificationStatus: 'verified_owner',
        updatedAt: now,
      })
      .where(eq(domainTable.id, domainId))

    console.log('[v0] Domain verified and made available on marketplace:', domainId)

    return {
      success: true,
      verified: true,
      message: 'Domain verified successfully and is now live on the marketplace!',
    }
  } catch (error) {
    console.error('[v0] Error confirming domain verification:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Full error details:', errorMsg)
    return {
      success: false,
      verified: false,
      error: `Failed to confirm verification: ${errorMsg}`,
    }
  }
}

/**
 * Get seller's submitted domains
 */
export async function getSellerDomains(userId: string) {
  try {
    const domains = await db
      .select()
      .from(domainTable)
      .where(eq(domainTable.ownerId, userId))

    // Get verification status for each domain
    const domainsWithStatus = await Promise.all(
      domains.map(async (domain) => {
        const status = await getVerificationStatus({
          domainId: domain.id,
          userId,
        })
        return {
          ...domain,
          verificationStatus: status.status,
          verificationCode: status.verificationCode,
          expiresAt: status.expiresAt,
        }
      })
    )

    return {
      success: true,
      domains: domainsWithStatus,
    }
  } catch (error) {
    console.error('[v0] Error fetching seller domains:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: `Failed to fetch seller domains: ${errorMsg}`,
    }
  }
}

/**
 * Edit a domain listing (seller can only edit pending domains)
 */
export async function editDomainListing({
  domainId,
  userId,
  buyPrice,
  leasePrice,
  category,
  description,
  isLeasing,
}: {
  domainId: string
  userId: string
  buyPrice: number
  leasePrice: number
  category: string
  description: string
  isLeasing: boolean
}) {
  try {
    // Verify ownership and check status
    const domain = await db
      .select()
      .from(domainTable)
      .where(eq(domainTable.id, domainId))
      .limit(1)

    if (domain.length === 0) {
      return {
        success: false,
        error: 'Domain not found',
      }
    }

    const domainRecord = domain[0]

    if (domainRecord.ownerId !== userId) {
      return {
        success: false,
        error: 'You do not own this domain',
      }
    }

    // Only allow editing if status is pending or if verification failed
    const editableStatuses = ['pending', 'unverified']
    if (!editableStatuses.includes(domainRecord.status)) {
      return {
        success: false,
        error: `Cannot edit domain with status "${domainRecord.status}". Only pending listings can be edited.`,
      }
    }

    const buyPriceInCents = Math.round(buyPrice * 100)
    const leasePriceInCents = Math.round(leasePrice * 100)

    await db
      .update(domainTable)
      .set({
        buyPrice: buyPriceInCents,
        leasePrice: leasePriceInCents,
        category,
        description,
        updatedAt: new Date(),
      })
      .where(eq(domainTable.id, domainId))

    console.log('[v0] Domain listing updated:', domainId)

    return {
      success: true,
      message: 'Domain listing updated successfully',
    }
  } catch (error) {
    console.error('[v0] Error updating domain listing:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: `Failed to update domain listing: ${errorMsg}`,
    }
  }
}

/**
 * Delete a domain listing (seller can only delete pending domains)
 */
export async function deleteDomainListing({
  domainId,
  userId,
}: {
  domainId: string
  userId: string
}) {
  try {
    // Verify ownership and check status
    const domain = await db
      .select()
      .from(domainTable)
      .where(eq(domainTable.id, domainId))
      .limit(1)

    if (domain.length === 0) {
      return {
        success: false,
        error: 'Domain not found',
      }
    }

    const domainRecord = domain[0]

    if (domainRecord.ownerId !== userId) {
      return {
        success: false,
        error: 'You do not own this domain',
      }
    }

    // Only allow deleting if status is pending or unverified
    const deletableStatuses = ['pending', 'unverified']
    if (!deletableStatuses.includes(domainRecord.status)) {
      return {
        success: false,
        error: `Cannot delete domain with status "${domainRecord.status}". Only pending listings can be deleted.`,
      }
    }

    // Delete the domain and its verification records
    await db
      .delete(domainTable)
      .where(eq(domainTable.id, domainId))

    console.log('[v0] Domain listing deleted:', domainId)

    return {
      success: true,
      message: 'Domain listing deleted successfully',
    }
  } catch (error) {
    console.error('[v0] Error deleting domain listing:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: `Failed to delete domain listing: ${errorMsg}`,
    }
  }
}
