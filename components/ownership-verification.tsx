'use client'

import { useState } from 'react'
import { X, Copy, Check, AlertCircle, Loader } from 'lucide-react'

interface OwnershipVerificationProps {
  domainName: string
  verificationCode: string
  expiresAt: Date
  onVerify: () => Promise<{ success: boolean; verified: boolean; error?: string }>
  onClose: () => void
}

export default function OwnershipVerification({
  domainName,
  verificationCode,
  expiresAt,
  onVerify,
  onClose,
}: OwnershipVerificationProps) {
  const [copied, setCopied] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleVerify = async () => {
    setVerifying(true)
    setError(null)

    try {
      const result = await onVerify()

      if (result.verified) {
        setVerified(true)
      } else {
        setError(result.error || 'Verification failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0f1729] border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Verify Ownership
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">{domainName}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={verifying}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {verified ? (
            // Success state
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-emerald-400">
                    Domain ownership verified successfully!
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400">
                You can now list <span className="font-semibold text-white">{domainName}</span> for
                sale or lease on LeadsWork.
              </p>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-emerald-400 py-3 text-sm font-semibold text-[#0a1220] transition hover:bg-emerald-300"
              >
                Continue to Listing
              </button>
            </div>
          ) : (
            // Verification instructions
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Step 1: Add TXT Record</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Add this TXT record to your domain&apos;s DNS settings to verify you own{' '}
                  <span className="font-semibold text-white">{domainName}</span>:
                </p>

                <div className="rounded-lg bg-white/[0.03] border border-white/10 p-4 mb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 mb-2">TXT Record Name</p>
                      <p className="text-sm font-mono text-white break-all">@</p>

                      <p className="text-xs font-medium text-slate-500 mt-4 mb-2">TXT Record Value</p>
                      <p className="text-sm font-mono text-white break-all">{verificationCode}</p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="mt-6 rounded-lg bg-white/5 hover:bg-white/10 p-2 text-slate-400 hover:text-white transition flex-shrink-0"
                      title="Copy verification code"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  <p className="mb-2">
                    <span className="font-medium text-slate-400">Expires:</span>{' '}
                    {new Date(expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-semibold text-white mb-3">Step 2: Verify Ownership</h3>
                <p className="text-sm text-slate-400 mb-4">
                  After adding the TXT record to your DNS settings, click the button below to verify
                  your ownership.
                </p>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-semibold text-[#0a1220] transition hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Ownership</span>
                  )}
                </button>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-400 mb-2">How DNS verification works:</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>• Log into your domain registrar (GoDaddy, Namecheap, etc.)</li>
                    <li>• Find the DNS settings for {domainName}</li>
                    <li>• Add a new TXT record with the value shown above</li>
                    <li>• DNS changes can take up to 48 hours to propagate</li>
                    <li>• Once verified, you can list your domain on LeadsWork</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
