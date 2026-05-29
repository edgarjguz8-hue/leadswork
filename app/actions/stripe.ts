'use server'

import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { domain as domainTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

interface DomainCheckoutParams {
  domainId: string
  priceInCents: number
  type: 'buy' | 'lease'
}

export async function createDomainCheckoutSession({ domainId, priceInCents, type }: DomainCheckoutParams) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || !session.user) {
    throw new Error('User not authenticated')
  }

  // Verify domain exists and is available
  const domainRecord = await db
    .select()
    .from(domainTable)
    .where(eq(domainTable.id, domainId))
    .limit(1)

  if (domainRecord.length === 0) {
    throw new Error('Domain not found')
  }

  const domain = domainRecord[0]

  if (domain.status !== 'available') {
    throw new Error(`Domain is no longer available (status: ${domain.status})`)
  }

  const description = type === 'buy' 
    ? `Full ownership of ${domain.displayName}` 
    : `Monthly lease for ${domain.displayName}`

  // Calculate processing fee (2.9% + $0.30)
  const processingFee = Math.round(priceInCents * 0.029 + 30)
  const totalInCents = priceInCents + processingFee

  // Create a PaymentIntent for custom payment form
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalInCents,
    currency: 'usd',
    description: description,
    metadata: {
      domainId,
      domainName: domain.displayName,
      type,
      userId: session.user.id,
    },
  })

  return { 
    clientSecret: paymentIntent.client_secret,
    url: `/checkout?domain=${encodeURIComponent(domainId)}&price=${priceInCents}&type=${type}&secret=${paymentIntent.client_secret}`
  }
}
