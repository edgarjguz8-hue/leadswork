'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import OwnershipVerification from '@/components/ownership-verification'
import {
  submitDomainListing,
  confirmDomainVerification,
} from '@/app/actions/domain'
import { normalizeDomainName, getDomainValidationError } from '@/lib/domain-utils'
import { AlertCircle, Check, Loader2, CheckCircle2 } from 'lucide-react'

export default function SellDomainForm({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()

  const [domainInput, setDomainInput] = useState('')
  const [price, setPrice] = useState('')
  const [leasePrice, setLeasePrice] = useState('')
  const [openToLeasing, setOpenToLeasing] = useState(false)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [createdDomainId, setCreatedDomainId] = useState<string | null>(null)
  const [verifyingDNS, setVerifyingDNS] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)

  const categories = [
    'Technology',
    'E-commerce',
    'Health & Fitness',
    'Finance',
    'Real Estate',
    'Travel',
    'Food & Beverage',
    'Local Business',
    'SaaS',
    'AI & Machine Learning',
  ]

  // Check auth on mount
  if (!sessionPending && !session?.user) {
    router.push('/sign-in')
    return null
  }

  const handleSubmitListing = async () => {
    if (!session?.user) {
      setError('You must be logged in to submit a listing')
      return
    }

    // Validate all fields
    if (!domainInput.trim()) {
      setError('Domain name is required')
      return
    }

    if (!price.trim()) {
      setError('Asking price is required')
      return
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Asking price must be a valid positive number')
      return
    }

    if (openToLeasing) {
      if (!leasePrice.trim()) {
        setError('Lease price is required')
        return
      }
      const leasePriceNum = parseFloat(leasePrice)
      if (isNaN(leasePriceNum) || leasePriceNum <= 0) {
        setError('Lease price must be a valid positive number')
        return
      }
    }

    if (!category.trim()) {
      setError('Category is required')
      return
    }

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    // Validate domain format
    const validationError = getDomainValidationError(domainInput)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const normalized = normalizeDomainName(domainInput)
      const result = await submitDomainListing({
        userId: session.user.id,
        domainName: normalized,
        buyPrice: priceNum,
        leasePrice: openToLeasing ? parseFloat(leasePrice) : 0,
        category,
        description,
        isLeasing: openToLeasing,
      })

      if (result.success && result.domainId && result.verificationCode) {
        setCreatedDomainId(result.domainId)
        setVerificationCode(result.verificationCode)
        setShowVerification(true)
      } else {
        setError(result.error || 'Failed to submit domain listing')
      }
    } catch (err) {
      console.error('[v0] Error submitting listing:', err)
      setError('An error occurred while submitting your listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDNS = async () => {
    if (!session?.user || !createdDomainId) {
      setError('Session lost. Please try again.')
      return
    }

    setVerifyingDNS(true)
    setError(null)

    try {
      const result = await confirmDomainVerification({
        domainId: createdDomainId,
        userId: session.user.id,
      })

      if (result.success && result.verified) {
        setVerificationSuccess(true)
        setSuccess('Your domain has been verified and posted successfully!')
        
        setTimeout(() => {
          router.push('/dashboard?tab=selling')
        }, 2000)
      } else {
        setError(result.error || 'We could not verify ownership yet. Please make sure the TXT record was added correctly. DNS updates can take a few minutes.')
      }
    } catch (err) {
      console.error('[v0] Error verifying DNS:', err)
      setError('Failed to verify DNS records. Please try again.')
    } finally {
      setVerifyingDNS(false)
    }
  }

  if (sessionPending) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    )
  }

  return (
    <>
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <button
            onClick={onBack}
            className="mb-6 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to domains
          </button>
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Sell Domains
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              List your domain
            </h1>
            <p className="mt-2 text-slate-400">
              Reach buyers looking for premium domain names
            </p>
          </div>
        </div>
      </section>

      {/* Verification Success */}
      {verificationSuccess && success && (
        <div className="border-b border-emerald-400/30 bg-emerald-400/10 px-6 py-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-xl px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {!showVerification ? (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Domain name *</label>
              <input
                type="text"
                placeholder="yourdomain.com or https://www.yourdomain.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
              />
              <p className="mt-1 text-xs text-slate-500">
                We&apos;ll normalize to: {domainInput ? normalizeDomainName(domainInput) : '(e.g., yourdomain.com)'}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Asking price ($) *</label>
              <input
                type="number"
                placeholder="10000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
                min="1"
                step="0.01"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">Open to leasing?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setOpenToLeasing(false)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${
                    !openToLeasing
                      ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-emerald-400/30'
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => setOpenToLeasing(true)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${
                    openToLeasing
                      ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-emerald-400/30'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {openToLeasing && (
              <div>
                <label className="mb-2 block text-sm font-medium">Monthly lease price ($) *</label>
                <input
                  type="number"
                  placeholder="500"
                  value={leasePrice}
                  onChange={(e) => setLeasePrice(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
                  min="1"
                  step="0.01"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-emerald-400/50"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Description *</label>
              <textarea
                rows={4}
                placeholder="Describe the potential of this domain, target market, use cases..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
              />
            </div>

            <button
              onClick={handleSubmitListing}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-400 py-3.5 text-sm font-semibold text-[#0a1220] transition hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Submit Listing</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <OwnershipVerification
            domainName={domainInput}
            verificationCode={verificationCode || ''}
            expiresAt={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
            onVerify={handleVerifyDNS}
            onClose={() => setShowVerification(false)}
            isVerifying={verifyingDNS}
          />
        )}
      </section>
    </>
  )
}
