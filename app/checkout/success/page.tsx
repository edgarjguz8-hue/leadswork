'use client'

import { useSearchParams } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const domain = searchParams.get('domain')
  const type = searchParams.get('type')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1220] px-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10">
          <Check className="h-10 w-10 text-emerald-400" />
        </div>

        {/* Message */}
        <h1 className="mt-6 text-3xl font-bold text-white">
          {type === 'buy' ? 'Purchase Complete!' : 'Lease Started!'}
        </h1>
        
        <p className="mt-3 text-slate-400">
          {type === 'buy' 
            ? `You now own ${domain}. We'll send transfer instructions to your email shortly.`
            : `Your lease for ${domain} is now active. You can start using it immediately.`
          }
        </p>

        {domain && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Your Domain</p>
            <p className="mt-2 text-2xl font-bold text-white">{domain}</p>
          </div>
        )}

        {/* Action */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-8 py-3.5 text-sm font-semibold text-[#0a1220] transition hover:bg-sky-300"
        >
          Back to Home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
