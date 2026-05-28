'use server'

import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

interface DomainCheckoutParams {
  domainName: string
  priceInCents: number
  type: 'buy' | 'lease'
}

export async function createDomainCheckoutSession({ domainName, priceInCents, type }: DomainCheckoutParams) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session || !session.user) {
    throw new Error('User not authenticated')
  }

  const description = type === 'buy' 
    ? `Full ownership of ${domainName}` 
    : `Monthly lease for ${domainName}`

  // Calculate processing fee (2.9% + $0.30)
  const processingFee = Math.round(priceInCents * 0.029 + 30)
  const totalInCents = priceInCents + processingFee

  // Create a PaymentIntent for custom payment form
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalInCents,
    currency: 'usd',
    description: description,
    metadata: {
      domainName,
      type,
      userId: session.user.id,
    },
  })

  return { 
    clientSecret: paymentIntent.client_secret,
    url: `/checkout?domain=${encodeURIComponent(domainName)}&price=${priceInCents}&type=${type}&secret=${paymentIntent.client_secret}`
  }
}
