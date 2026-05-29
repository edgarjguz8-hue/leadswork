'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { getUserDomains, getSellerDomains } from '@/app/actions/domain'
import { LogOut, User, Globe, Calendar, Badge, Loader2, ArrowLeft, Check, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface UserDomain {
  id: string
  domainName: string
  type: 'buy' | 'lease'
  priceInCents: number
  purchasedAt: string
  expiresAt: string | null
}

interface SellerDomain {
  id: string
  displayName: string
  buyPrice: number
  leasePrice: number
  category: string
  description: string
  status: string
  verificationStatus: string
  verificationCode?: string
  expiresAt?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [domains, setDomains] = useState<UserDomain[]>([])
  const [sellerDomains, setSellerDomains] = useState<SellerDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'purchased' | 'selling'>('purchased')

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push('/sign-in')
        return
      }

      const fetchDomains = async () => {
        const purchasedResult = await getUserDomains(session.user.id)
        if (purchasedResult.success) {
          setDomains(purchasedResult.domains || [])
        }

        const sellingResult = await getSellerDomains(session.user.id)
        if (sellingResult.success) {
          setSellerDomains(sellingResult.domains || [])
        }

        setLoading(false)
      }

      fetchDomains()
    }
  }, [session, isPending, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  return (
    <div className="min-h-screen bg-[#0a1220]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f1729] sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sky-400 hover:text-sky-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Account Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Account Info Section */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/10">
              <User className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{session.user.name}</h2>
              <p className="text-sm text-slate-400">{session.user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Total Domains
              </p>
              <p className="mt-2 text-2xl font-bold text-white">{domains.length}</p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Owned Domains
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {domains.filter((d) => d.type === 'buy').length}
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Leased Domains
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {domains.filter((d) => d.type === 'lease').length}
              </p>
            </div>
          </div>
        </section>

        {/* Domains Section */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10">
              <Globe className="h-5 w-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">My Domains</h2>
          </div>

          {/* Tab Switcher */}
          <div className="mb-6 flex gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveTab('purchased')}
              className={`pb-3 px-4 text-sm font-medium transition ${
                activeTab === 'purchased'
                  ? 'border-b-2 border-sky-400 text-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Purchased ({domains.length})
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`pb-3 px-4 text-sm font-medium transition ${
                activeTab === 'selling'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Selling ({sellerDomains.length})
            </button>
          </div>

          {/* Purchased Domains Tab */}
          {activeTab === 'purchased' && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur">
              <Globe className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <p className="text-slate-400">You don't have any domains yet.</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-lg bg-sky-400 px-6 py-2 font-semibold text-[#0a1220] transition hover:bg-sky-300"
              >
                Browse Domains
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{domain.domainName}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Badge className="h-4 w-4 text-sky-400" />
                          <span className="capitalize">
                            {domain.type === 'buy' ? 'Owned' : 'Leased'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4 text-emerald-400" />
                          <span>Purchased: {formatDate(domain.purchasedAt)}</span>
                        </div>

                        {domain.type === 'lease' && domain.expiresAt && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="h-4 w-4 text-orange-400" />
                            <span>Expires: {formatDate(domain.expiresAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Price Paid
                      </p>
                      <p className="mt-1 text-xl font-bold text-white">
                        {formatPrice(domain.priceInCents)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          )}

          {/* Selling Domains Tab */}
          {activeTab === 'selling' && (
            <>
              {sellerDomains.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur">
                  <Globe className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                  <p className="text-slate-400">You haven't submitted any domains yet.</p>
                  <Link
                    href="/"
                    className="mt-4 inline-block rounded-lg bg-emerald-400 px-6 py-2 font-semibold text-[#0a1220] transition hover:bg-emerald-300"
                  >
                    Submit Your First Domain
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sellerDomains.map((domain) => (
                    <div
                      key={domain.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">{domain.displayName}</h3>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                domain.verificationStatus === 'verified_owner'
                                  ? 'bg-emerald-400/10 text-emerald-400'
                                  : domain.verificationStatus === 'pending_verification'
                                  ? 'bg-orange-400/10 text-orange-400'
                                  : 'bg-slate-400/10 text-slate-400'
                              }`}
                            >
                              {domain.verificationStatus === 'verified_owner' && (
                                <Check className="h-3 w-3" />
                              )}
                              {domain.verificationStatus === 'pending_verification' && (
                                <Clock className="h-3 w-3" />
                              )}
                              {domain.verificationStatus === 'unverified' && (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              <span className="capitalize">
                                {domain.verificationStatus === 'verified_owner'
                                  ? 'Verified & Live'
                                  : domain.verificationStatus === 'pending_verification'
                                  ? 'Awaiting Verification'
                                  : 'Unverified'}
                              </span>
                            </span>
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-slate-500">Buy Price</p>
                              <p className="text-sm font-semibold text-white">
                                ${(domain.buyPrice / 100).toLocaleString('en-US')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Lease Price (Monthly)</p>
                              <p className="text-sm font-semibold text-white">
                                ${(domain.leasePrice / 100).toLocaleString('en-US')}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full bg-slate-400/10 px-2.5 py-1 text-xs text-slate-300">
                              {domain.category}
                            </span>
                            {domain.verificationStatus === 'pending_verification' && (
                              <span className="inline-flex rounded-full bg-orange-400/10 px-2.5 py-1 text-xs text-orange-300">
                                DNS Code: {domain.verificationCode?.slice(-8) || 'N/A'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Status
                          </p>
                          <p className="mt-1 capitalize text-sm font-medium text-white">
                            {domain.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Back to Browse */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-3 font-semibold text-[#0a1220] transition hover:bg-sky-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Domain Marketplace
          </Link>
        </div>
      </main>
    </div>
  )
}
