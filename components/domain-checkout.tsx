'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Shield, CreditCard, Check } from 'lucide-react'
import { createPaymentIntent } from '@/app/actions/stripe'

interface DomainCheckoutProps {
  domainName: string
  priceInCents: number
  type: 'buy' | 'lease'
  onClose: () => void
}

export default function DomainCheckout({ 
  domainName, 
  priceInCents, 
  type,
  onClose 
}: DomainCheckoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate fees
  const domainPrice = priceInCents / 100
  const processingFeePercent = 0.029
  const processingFeeFlat = 0.30
  const processingFee = (domainPrice * processingFeePercent) + processingFeeFlat
  const total = domainPrice + processingFee

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await createPaymentIntent({ 
        domainName, 
        priceInCents, 
        type 
      })
      
      if (result.success && result.clientSecret) {
        // Redirect to checkout page with payment intent details
        const params = new URLSearchParams({
          domain: domainName,
          price: priceInCents.toString(),
          type: type,
          secret: result.clientSecret,
        })
        router.push(`/checkout?${params.toString()}`)
      } else {
        setError(result.error || 'Failed to start checkout')
        setLoading(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0f1729] border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
              {type === 'buy' ? 'Purchase Domain' : 'Lease Domain'}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">{domainName}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-5">
          <h3 className="text-sm font-semibold text-white mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                {type === 'buy' ? 'Domain Purchase' : 'Monthly Lease'}
              </span>
              <span className="text-white font-medium">
                ${domainPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {type === 'lease' && <span className="text-slate-500 font-normal">/mo</span>}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Processing Fee</span>
              <span className="text-white font-medium">
                ${processingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold text-lg">
                  ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {type === 'lease' && <span className="text-slate-400 text-sm font-normal">/mo</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="px-6 py-4 border-t border-white/10">
          <h3 className="text-sm font-semibold text-white mb-3">
            {type === 'buy' ? "What's Included" : 'Lease Benefits'}
          </h3>
          <div className="space-y-2">
            {type === 'buy' ? (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Full domain ownership</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Instant transfer to your registrar</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>No recurring fees</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Start using immediately</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Option to buy later</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Cancel anytime</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="px-6 py-3 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="h-4 w-4" />
            <span>Secure checkout powered by Stripe</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-3">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Checkout Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-400 py-4 text-sm font-semibold text-[#0a1220] transition hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
