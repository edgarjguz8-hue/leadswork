'use server'

import { stripe } from '@/lib/stripe'

interface DomainCheckoutParams {
  domainName: string
  priceInCents: number
  type: 'buy' | 'lease'
}

export async function createPaymentIntent({ domainName, priceInCents, type }: DomainCheckoutParams) {
  try {
    const description = type === 'buy' 
      ? `Full ownership of ${domainName}` 
      : `Monthly lease for ${domainName}`

    // Calculate processing fee (2.9% + $0.30)
    const processingFee = Math.round(priceInCents * 0.029 + 30)
    const totalInCents = priceInCents + processingFee

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalInCents,
      currency: 'usd',
      description: description,
      metadata: {
        domain: domainName,
        type: type,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return {
      success: false,
      error: 'Failed to create payment intent',
    }
  }
}
