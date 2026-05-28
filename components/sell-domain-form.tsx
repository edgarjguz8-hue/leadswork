'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import OwnershipVerification from '@/components/ownership-verification'
import {
  checkExternalDomainStatus,
  requestDomainVerification,
  verifyDomainOwnershipAction,
  getDomainVerificationStatus,
} from '@/app/actions/domain'
import { normalizeDomainName, isValidDomainName, getDomainValidationError } from '@/lib/domain-utils'
import { AlertCircle, Check, Loader } from 'lucide-react'

export default function SellDomainForm({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const { data: session } = useSession()

  const [domainInput, setDomainInput] = useState('')
  const [price, setPrice] = useState('')
  const [leasePrice, setLeasePrice] = useState('')
  const [openToLeasing, setOpenToLeasing] = useState(false)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [externalCheckLoading, setExternalCheckLoading] = useState(false)
  const [externalStatus, setExternalStatus] = useState<{
    isAvailable: boolean
    externallyRegistered: boolean
    message: string
  } | null>(null)

  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [verificationExpires, setVerificationExpires] = useState<Date | null>(null)

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

  // Validate domain on input change
  const handleDomainChange = async (value: string) => {
    setDomainInput(value)
    setExternalStatus(null)
    setShowVerification(false)

    if (!value) {
      setError(null)
      return
    }

    // Validate format
    const validationError = getDomainValidationError(value)
    if (validationError) {
      setError(validationError)
      return
    }

    // Check external availability
    setExternalCheckLoading(true)
    setError(null)

    try {
      const result = await checkExternalDomainStatus(value)

      if (result.success) {
        setExternalStatus({
          isAvailable: result.isAvailable,
          externallyRegistered: result.externallyRegistered,
          message: result.message,
        })

        if (!result.isAvailable && result.externallyRegistered) {
          setError(result.message)
        }
      } else {
        setError(result.error || 'Failed to check domain availability')
      }
    } catch (err) {
      console.error('[v0] Error checking domain:', err)
      setError('Failed to verify domain')
    } finally {
      setExternalCheckLoading(false)
    }
  }

  // Request verification for externally registered domain
  const handleRequestVerification = async () => {
    if (!session?.user || !externalStatus?.externallyRegistered) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create a temporary domain ID based on normalized name for verification
      const normalized = normalizeDomainName(domainInput)
      const domainId = `temp_${normalized}_${Date.now()}`

      const result = await requestDomainVerification({
        domainId,
        userId: session.user.id,
      })

      if (result.success && result.verificationCode) {
        setVerificationCode(result.verificationCode)
        // Calculate expiry (7 days from now, or use provided expiry)
        const expiry = result.existingVerification?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        setVerificationExpires(expiry)
        setShowVerification(true)
      } else {
        setError(result.error || 'Failed to request verification')
      }
    } catch (err) {
      console.error('[v0] Error requesting verification:', err)
      setError('Failed to request verification')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOwnership = async () => {
    if (!session?.user || !verificationCode || !externalStatus?.externallyRegistered) {
      return
    }

    const normalized = normalizeDomainName(domainInput)
    const domainId = `temp_${normalized}_${Date.now()}`

    try {
      const result = await verifyDomainOwnershipAction({
        domainId,
        domainName: domainInput,
        userId: session.user.id,
      })

      return result
    } catch (err) {
      console.error('[v0] Error verifying:', err)
      return {
        success: false,
        verified: false,
        error: 'Verification failed',
      }
    }
  }

  const handleSubmitListing = async () => {
    if (!session?.user) {
      router.push('/sign-in')
      return
    }

    // Validate all fields
    if (!domainInput) {
      setError('Domain name is required')
      return
    }

    if (!price) {
      setError('Asking price is required')
      return
    }

    if (openToLeasing && !leasePrice) {
      setError('Lease price is required')
      return
    }

    if (!category) {
      setError('Category is required')
      return
    }

    if (!description) {
      setError('Description is required')
      return
    }

    // Check if domain is externally registered and requires verification
    if (externalStatus?.externallyRegistered) {
      setError('You must verify ownership of this domain before listing it on LeadsWork.')
      handleRequestVerification()
      return
    }

    setLoading(true)
    setError(null)

    try {
      // TODO: Call server action to create domain listing
      // For now, show success message
      setSuccess('Domain listing submitted! (Feature coming soon)')
      setTimeout(() => {
        onBack()
      }, 2000)
    } catch (err) {
      console.error('[v0] Error submitting listing:', err)
      setError('Failed to submit listing')
    } finally {
      setLoading(false)
    }
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

      <section className="mx-auto max-w-xl px-6 py-12">
        <div className="space-y-5">
          {/* Domain Input with External Check */}
          <div>
            <label className="mb-2 block text-sm font-medium">Domain name</label>
            <div className="relative">
              <input
                value={domainInput}
                onChange={(e) => handleDomainChange(e.target.value)}
                placeholder="yourdomain.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50 disabled:opacity-50"
                disabled={externalCheckLoading}
              />
              {externalCheckLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              )}
              {externalStatus && !externalCheckLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {externalStatus.isAvailable ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
              )}
            </div>

            {/* External Status Message */}
            {externalStatus && (
              <div
                className={`mt-2 p-3 rounded-lg text-sm flex items-start gap-2 ${
                  externalStatus.isAvailable
                    ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400'
                    : 'bg-amber-400/10 border border-amber-400/20 text-amber-400'
                }`}
              >
                {externalStatus.isAvailable ? (
                  <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{externalStatus.message}</span>
              </div>
            )}

            {/* Verification Button for Registered Domains */}
            {externalStatus?.externallyRegistered && !showVerification && (
              <button
                onClick={handleRequestVerification}
                disabled={loading}
                className="mt-3 w-full rounded-lg bg-emerald-400/10 border border-emerald-400/30 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-400/20 disabled:opacity-50"
              >
                {loading ? 'Requesting verification...' : 'Verify Ownership'}
              </button>
            )}
          </div>

          {/* Verification Modal */}
          {showVerification && verificationCode && verificationExpires && (
            <OwnershipVerification
              domainName={domainInput}
              verificationCode={verificationCode}
              expiresAt={verificationExpires}
              onVerify={handleVerifyOwnership}
              onClose={() => setShowVerification(false)}
            />
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}

          {/* Price Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">Asking price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="$10,000"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
            />
          </div>

          {/* Lease Option */}
          <div>
            <label className="mb-2 block text-sm font-medium">Open to leasing?</label>
            <div className="flex gap-3">
              <button
                onClick={() => setOpenToLeasing(true)}
                className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${
                  openToLeasing
                    ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-white hover:border-emerald-400/30'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setOpenToLeasing(false)}
                className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${
                  !openToLeasing
                    ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-white hover:border-emerald-400/30'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Lease Price */}
          {openToLeasing && (
            <div>
              <label className="mb-2 block text-sm font-medium">Monthly lease price</label>
              <input
                value={leasePrice}
                onChange={(e) => setLeasePrice(e.target.value)}
                placeholder="$500/mo"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none focus:border-emerald-400/50"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the potential of this domain..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitListing}
            disabled={loading || externalCheckLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3.5 text-sm font-semibold text-[#0a1220] transition hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              'Submit Listing'
            )}
          </button>
        </div>
      </section>
    </>
  )
}
