'use server'

import { db } from '@/lib/db'
import { domainAvailabilityCache } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { normalizeDomainName } from './domain-utils'

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check domain availability using RDAP protocol
 * Returns whether the domain is available for registration
 */
export async function checkRDAPAvailability(domainName: string): Promise<{
  isAvailable: boolean
  externallyRegistered: boolean
  error?: string
}> {
  try {
    const normalized = normalizeDomainName(domainName)
    
    // Extract TLD for RDAP bootstrap lookup
    const parts = normalized.split('.')
    if (parts.length < 2) {
      return {
        isAvailable: false,
        externallyRegistered: false,
        error: 'Invalid domain format',
      }
    }

    const tld = parts[parts.length - 1]

    // Try RDAP lookup
    try {
      const rdapUrl = `https://rdap.org/domain/${normalized}`
      const response = await fetch(rdapUrl, {
        headers: { 'Accept': 'application/rdap+json' },
        signal: AbortSignal.timeout(5000),
      })

      if (response.status === 200) {
        // Domain exists in RDAP registry
        return {
          isAvailable: false,
          externallyRegistered: true,
        }
      } else if (response.status === 404) {
        // Domain does not exist
        return {
          isAvailable: true,
          externallyRegistered: false,
        }
      }
    } catch (rdapError) {
      console.error('[v0] RDAP lookup failed:', rdapError)
      // Fall through to whois check
    }

    // Fallback: Check via WHOIS (simple TCP lookup)
    try {
      const whoisResult = await checkWhoisAvailability(normalized)
      return whoisResult
    } catch (whoisError) {
      console.error('[v0] WHOIS lookup failed:', whoisError)
      // If both fail, assume unavailable for safety
      return {
        isAvailable: false,
        externallyRegistered: true,
        error: 'Could not verify availability',
      }
    }
  } catch (error) {
    console.error('[v0] Domain availability check error:', error)
    return {
      isAvailable: false,
      externallyRegistered: false,
      error: 'Failed to check domain availability',
    }
  }
}

/**
 * Simple WHOIS availability check via DNS lookup
 */
async function checkWhoisAvailability(
  domainName: string
): Promise<{ isAvailable: boolean; externallyRegistered: boolean }> {
  try {
    const parts = domainName.split('.')
    const domain = parts.slice(-2).join('.')

    // Use DNS resolution as a simple availability indicator
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`, {
      signal: AbortSignal.timeout(3000),
    })

    if (response.ok) {
      const data = (await response.json()) as { Status: number }
      // Status 0 = NOERROR (domain exists), 3 = NXDOMAIN (not found)
      if (data.Status === 0) {
        return {
          isAvailable: false,
          externallyRegistered: true,
        }
      }
    }

    return {
      isAvailable: true,
      externallyRegistered: false,
    }
  } catch (error) {
    console.error('[v0] WHOIS check failed:', error)
    throw error
  }
}

/**
 * Get domain availability with caching
 */
export async function getDomainAvailability(domainName: string): Promise<{
  isAvailable: boolean
  externallyRegistered: boolean
  cached: boolean
  error?: string
}> {
  try {
    const normalized = normalizeDomainName(domainName)

    // Check cache first
    const cached = await db
      .select()
      .from(domainAvailabilityCache)
      .where(eq(domainAvailabilityCache.normalizedName, normalized))
      .limit(1)

    if (cached.length > 0) {
      const cacheEntry = cached[0]
      const now = new Date()

      if (cacheEntry.expiresAt > now) {
        console.log('[v0] Using cached domain availability:', normalized)
        return {
          isAvailable: cacheEntry.isAvailable,
          externallyRegistered: cacheEntry.externallyRegistered,
          cached: true,
        }
      } else {
        // Cache expired, delete it
        await db
          .delete(domainAvailabilityCache)
          .where(eq(domainAvailabilityCache.normalizedName, normalized))
      }
    }

    // Perform fresh check
    const result = await checkRDAPAvailability(domainName)

    if (!result.error) {
      // Cache the result
      const cacheId = `cache_${normalized}_${Date.now()}`
      await db.insert(domainAvailabilityCache).values({
        id: cacheId,
        normalizedName: normalized,
        isAvailable: result.isAvailable,
        externallyRegistered: result.externallyRegistered,
        lastChecked: new Date(),
        expiresAt: new Date(Date.now() + CACHE_DURATION),
        createdAt: new Date(),
      })
    }

    return {
      ...result,
      cached: false,
      error: result.error,
    }
  } catch (error) {
    console.error('[v0] Get domain availability error:', error)
    return {
      isAvailable: false,
      externallyRegistered: false,
      cached: false,
      error: 'Failed to check availability',
    }
  }
}
