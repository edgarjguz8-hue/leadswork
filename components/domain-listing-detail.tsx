'use client'

import { useState } from 'react'
import { X, Copy, Check, Trash2, Edit2, ExternalLink, Loader2 } from 'lucide-react'
import { editDomainListing, deleteDomainListing } from '@/app/actions/domain'

interface DomainListingDetailProps {
  domain: {
    id: string
    displayName: string
    buyPrice: number
    leasePrice: number
    category: string
    description: string
    status: string
    verificationStatus: string
    verificationCode?: string
  }
  userId: string
  onClose: () => void
  onUpdate: () => void
}

export default function DomainListingDetail({
  domain,
  userId,
  onClose,
  onUpdate,
}: DomainListingDetailProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({
    buyPrice: (domain.buyPrice / 100).toString(),
    leasePrice: (domain.leasePrice / 100).toString(),
    category: domain.category,
    description: domain.description,
  })

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

  const copyToClipboard = () => {
    if (domain.verificationCode) {
      navigator.clipboard.writeText(domain.verificationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await editDomainListing({
        domainId: domain.id,
        userId,
        buyPrice: parseFloat(editForm.buyPrice),
        leasePrice: parseFloat(editForm.leasePrice),
        category: editForm.category,
        description: editForm.description,
        isLeasing: domain.leasePrice > 0,
      })

      if (result.success) {
        setIsEditing(false)
        onUpdate()
      } else {
        setError(result.error || 'Failed to save changes')
      }
    } catch (err) {
      setError('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this domain listing? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteDomainListing({
        domainId: domain.id,
        userId,
      })

      if (result.success) {
        onClose()
        onUpdate()
      } else {
        setError(result.error || 'Failed to delete listing')
      }
    } catch (err) {
      setError('An error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const isPending = domain.status === 'pending'
  const isVerified = domain.verificationStatus === 'verified_owner'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1729] p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{domain.displayName}</h2>
            <p className="mt-1 text-sm text-slate-400">Domain Listing Details</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 transition hover:bg-white/5"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!isEditing ? (
          <>
            {/* Display Mode */}
            <div className="space-y-6">
              {/* Status */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                      isPending
                        ? 'bg-orange-400/10 text-orange-400'
                        : isVerified
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'bg-slate-400/10 text-slate-400'
                    }`}
                  >
                    {isPending ? 'Pending Verification' : isVerified ? 'Verified & Live' : 'Unverified'}
                  </span>
                </div>
              </div>

              {/* DNS Verification Code (only show if pending) */}
              {isPending && domain.verificationCode && (
                <div className="rounded-lg border border-orange-400/30 bg-orange-400/10 p-4">
                  <p className="text-xs font-semibold uppercase text-orange-400">DNS TXT Record Code</p>
                  <p className="mt-2 text-sm text-orange-300">Add this as a TXT record to your domain:</p>
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 p-3">
                    <code className="flex-1 overflow-auto text-xs text-white font-mono">
                      {domain.verificationCode}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 rounded-lg border border-white/10 p-2 transition hover:bg-white/10"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Buy Price</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    ${(domain.buyPrice / 100).toLocaleString('en-US')}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Lease Price (Monthly)</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    ${(domain.leasePrice / 100).toLocaleString('en-US')}
                  </p>
                </div>
              </div>

              {/* Category & Description */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Category</p>
                  <p className="mt-1.5 text-sm text-white">{domain.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Description</p>
                  <p className="mt-1.5 text-sm text-slate-300 whitespace-pre-wrap">{domain.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-sky-400 bg-sky-400/10 px-4 py-2.5 text-sm font-medium text-sky-400 transition hover:bg-sky-400/20"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Listing
                </button>
                {isPending && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-400/50 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-400/20 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Buy Price ($)</label>
                <input
                  type="number"
                  value={editForm.buyPrice}
                  onChange={(e) => setEditForm({ ...editForm, buyPrice: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-slate-500 outline-none focus:border-sky-400/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Lease Price (Monthly, $)</label>
                <input
                  type="number"
                  value={editForm.leasePrice}
                  onChange={(e) => setEditForm({ ...editForm, leasePrice: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-slate-500 outline-none focus:border-sky-400/50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-sky-400/50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-slate-500 outline-none focus:border-sky-400/50"
                />
              </div>

              {/* Edit Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      buyPrice: (domain.buyPrice / 100).toString(),
                      leasePrice: (domain.leasePrice / 100).toString(),
                      category: domain.category,
                      description: domain.description,
                    })
                  }}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-semibold text-[#0a1220] transition hover:bg-sky-300 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
