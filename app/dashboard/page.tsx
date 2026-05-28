'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { getUserDomains } from '@/app/actions/domain'
import { LogOut, User, Domain, Calendar, Badge, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface UserDomain {
  id: string
  domainName: string
  type: 'buy' | 'lease'
  priceInCents: number
  purchasedAt: string
  expiresAt: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [domains, setDomains] = useState<UserDomain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push('/sign-in')
        return
      }

      const fetchDomains = async () => {
        const result = await getUserDomains(session.user.id)
        if (result.success) {
          setDomains(result.domains || [])
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
              <Domain className="h-5 w-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">My Domains</h2>
          </div>

          {domains.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur">
              <Domain className="mx-auto mb-4 h-12 w-12 text-slate-600" />
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
