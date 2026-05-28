'use server'

import { stripe } from '@/lib/stripe'

interface DomainCheckoutParams {
  domainName: string
  priceInCents: number
  type: 'buy' | 'lease'
}

export async function createDomainCheckoutSession({ domainName, priceInCents, type }: DomainCheckoutParams) {
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
    },
  })

  return { 
    clientSecret: paymentIntent.client_secret,
    url: `/checkout?domain=${encodeURIComponent(domainName)}&price=${priceInCents}&type=${type}&secret=${paymentIntent.client_secret}`
  }
}
