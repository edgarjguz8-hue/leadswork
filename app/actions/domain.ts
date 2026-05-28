'use server'

import { db } from '@/lib/db'
import { userDomain } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function savePurchasedDomain({
  userId,
  domainName,
  type,
  stripeSessionId,
}: {
  userId: string
  domainName: string
  type: 'buy' | 'lease'
  stripeSessionId: string
}) {
  try {
    // Check if domain already purchased by this user
    const existing = await db
      .select()
      .from(userDomain)
      .where(eq(userDomain.domainName, domainName))

    if (existing.length > 0) {
      return {
        success: false,
        error: 'Domain already owned by someone',
      }
    }

    // Save the domain to user account
    const id = randomUUID()
    await db.insert(userDomain).values({
      id,
      userId,
      domainName,
      type,
      priceInCents: 0, // Will be set from order data if needed
      stripeSessionId,
      purchasedAt: new Date(),
      expiresAt: type === 'lease' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      success: true,
      domainId: id,
    }
  } catch (error) {
    console.error('Error saving domain:', error)
    return {
      success: false,
      error: 'Failed to save domain',
    }
  }
}

export async function getUserDomains(userId: string) {
  try {
    const domains = await db
      .select()
      .from(userDomain)
      .where(eq(userDomain.userId, userId))

    return {
      success: true,
      domains,
    }
  } catch (error) {
    console.error('Error fetching domains:', error)
    return {
      success: false,
      error: 'Failed to fetch domains',
    }
  }
}
