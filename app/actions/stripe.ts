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

  if (type === 'lease') {
    // For subscriptions/leases
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: domainName,
              description: description,
            },
            unit_amount: totalInCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/checkout/success?domain=${encodeURIComponent(domainName)}&type=lease`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/?canceled=true`,
    })

    return { url: session.url }
  } else {
    // For one-time purchases
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: domainName,
              description: description,
            },
            unit_amount: totalInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/checkout/success?domain=${encodeURIComponent(domainName)}&type=buy`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/?canceled=true`,
    })

    return { url: session.url }
  }
}
