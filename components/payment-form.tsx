'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

interface PaymentFormProps {
  orderData: {
    domainName: string
    priceInCents: number
    type: 'buy' | 'lease'
  }
}

export default function PaymentForm({ orderData }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Payment system not loaded')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()

      if (submitError) {
        setError(submitError.message || 'Payment failed')
        setIsLoading(false)
        return
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?domain=${orderData.domainName}&type=${orderData.type}`,
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed')
        setIsLoading(false)
      } else if (paymentIntent) {
        console.log('[v0] Payment succeeded:', paymentIntent.status)
        if (paymentIntent.status === 'succeeded') {
          router.push(`/checkout/success?domain=${orderData.domainName}&type=${orderData.type}&session=${paymentIntent.id}`)
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other authentication required
          setError('Payment requires additional authentication')
          setIsLoading(false)
        } else if (paymentIntent.status === 'requires_payment_method') {
          setError('Payment method was declined. Please try another card.')
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError('An error occurred during payment')
      setIsLoading(false)
    }
  }

  const priceInDollars = (orderData.priceInCents / 100).toFixed(2)
  const processingFee = (orderData.priceInCents * 0.029 + 30) / 100
  const total = parseFloat(priceInDollars) + processingFee

  return (
    <div className="space-y-8">
      {/* Order Summary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Domain</span>
            <span className="font-medium">{orderData.domainName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Type</span>
            <span className="font-medium capitalize">{orderData.type === 'buy' ? 'Purchase' : 'Monthly Lease'}</span>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span>${priceInDollars}</span>
            </div>

            <div className="mt-2 flex justify-between">
              <span className="text-slate-400">Processing Fee</span>
              <span>${processingFee.toFixed(2)}</span>
            </div>

            <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-sky-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-6 text-lg font-semibold">Payment Details</h3>
          <PaymentElement />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full rounded-xl bg-sky-400 px-6 py-3.5 font-semibold text-[#0a1220] transition disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : (
            `Complete Purchase - $${total.toFixed(2)}`
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Your payment is secure and encrypted
        </p>
      </form>
    </div>
  )
}
