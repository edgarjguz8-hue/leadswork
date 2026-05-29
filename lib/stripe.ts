import 'server-only'

import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function initializeStripe(): Stripe {
  if (!stripeInstance) {
    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }

    stripeInstance = new Stripe(stripeKey)
  }

  return stripeInstance
}

export { initializeStripe }

// Lazy getter for backward compatibility
export const stripe = new Proxy(
  {},
  {
    get: (_, prop) => {
      const instance = initializeStripe()
      return Reflect.get(instance, prop)
    },
  }
) as Stripe
