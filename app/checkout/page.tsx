'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '@/components/payment-form'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<{
    domainName: string
    priceInCents: number
    type: 'buy' | 'lease'
  } | null>(null)

  useEffect(() => {
    const domain = searchParams.get('domain')
    const price = searchParams.get('price')
    const type = searchParams.get('type') as 'buy' | 'lease'
    const secret = searchParams.get('secret')

    if (domain && price && type && secret) {
      setOrderData({
        domainName: domain,
        priceInCents: parseInt(price),
        type,
      })
      setClientSecret(secret)
    }
  }, [searchParams])

  if (!orderData || !clientSecret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-center">
          <p className="text-slate-400">Loading payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1220] px-6 py-12">
      <div className="mx-auto max-w-md">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#0ea5e9',
                colorText: '#f1f5f9',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                spacingUnit: '4px',
              },
            },
          }}
        >
          <PaymentForm orderData={orderData} />
        </Elements>
      </div>
    </div>
  )
}
