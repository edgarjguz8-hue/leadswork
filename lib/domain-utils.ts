/**
 * Domain normalization utility for consistent duplicate detection
 */
export function normalizeDomainName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

/**
 * Validate if a domain name is valid
 */
export function isValidDomainName(name: string): boolean {
  const normalized = normalizeDomainName(name)
  
  if (!normalized || normalized.length < 3) {
    return false
  }
  
  // Basic domain name validation
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/
  return domainRegex.test(normalized)
}

/**
 * Get a human-friendly error message for domain validation
 */
export function getDomainValidationError(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Domain name is required'
  }
  
  if (name.trim().length < 3) {
    return 'Domain name must be at least 3 characters'
  }
  
  if (!isValidDomainName(name)) {
    return 'Invalid domain name format'
  }
  
  return null
}
