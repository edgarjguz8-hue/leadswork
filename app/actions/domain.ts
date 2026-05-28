'use server'

import { db } from '@/lib/db'
import { userDomain, domain as domainTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { normalizeDomainName } from '@/lib/domain-utils'

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
 * Get all available domains for marketplace
 */
export async function getAvailableDomains() {
  try {
    const domains = await db
      .select()
      .from(domainTable)
      .where(eq(domainTable.status, 'available'))

    return {
      success: true,
      domains,
    }
  } catch (error) {
    console.error('Error fetching available domains:', error)
    return {
      success: false,
      error: 'Failed to fetch available domains',
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
