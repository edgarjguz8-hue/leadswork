'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { savePurchasedDomain } from '@/app/actions/domain'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPurchase = async () => {
      try {
        const domain = searchParams.get('domain')
        const type = searchParams.get('type')
        const sessionId = searchParams.get('session')

        if (!domain || !type || !sessionId) {
          setError('Missing payment information')
          setStatus('error')
          return
        }

        if (!session?.user) {
          setError('Not logged in')
          setStatus('error')
          return
        }

        // Save domain to user account
        const result = await savePurchasedDomain({
          userId: session.user.id,
          domainName: domain,
          type: type as 'buy' | 'lease',
          stripeSessionId: sessionId,
        })

        if (result.success) {
          setStatus('success')
        } else {
          setError(result.error || 'Failed to save domain')
          setStatus('error')
        }
      } catch (err) {
        setError('An error occurred')
        setStatus('error')
      }
    }

    processPurchase()
  }, [searchParams, session])

  const domain = searchParams.get('domain')
  const type = searchParams.get('type')

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-sky-400" />
          <p className="text-slate-400">Processing your purchase...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220] px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-semibold">Payment Error</h1>
          <p className="mt-2 text-slate-400">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 rounded-lg bg-sky-400 px-6 py-3 font-semibold text-[#0a1220] transition hover:bg-sky-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1220] px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-400/10">
          <CheckCircle className="h-8 w-8 text-sky-400" />
        </div>

        <h1 className="text-2xl font-semibold">Purchase Confirmed!</h1>

        <div className="mt-6 space-y-4 text-left rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <p className="text-sm text-slate-500">Domain</p>
            <p className="mt-1 font-semibold">{domain}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Type</p>
            <p className="mt-1 font-semibold capitalize">
              {type === 'buy' ? 'Purchased' : 'Leased'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-1 text-sm text-emerald-400">Active in your account</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Your domain is now available in your account. You can manage it from your dashboard.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-sky-400 px-6 py-3 font-semibold text-[#0a1220] transition hover:bg-sky-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
