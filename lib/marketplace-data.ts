'use server'

import { getAvailableDomains } from '@/app/actions/domain'

export async function getAvailableDomainsForMarketplace() {
  const result = await getAvailableDomains()
  
  if (!result.success || !result.domains) {
    return []
  }

  // Transform DB domains to the format the client expects
  return result.domains.map(domain => ({
    id: domain.id,
    name: domain.displayName,
    price: `$${(domain.buyPrice / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    lease: `$${(domain.leasePrice / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo`,
    category: domain.category,
    idea: domain.description,
    score: domain.score,
    buyPriceInCents: domain.buyPrice,
    leasePriceInCents: domain.leasePrice,
  }))
}
