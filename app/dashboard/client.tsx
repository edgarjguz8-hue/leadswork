'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { getSellerDomains } from '@/app/actions/domain'
import DomainListingDetail from '@/components/domain-listing-detail'
import { LogOut, Globe, Loader2, ArrowLeft, Check, Clock, AlertCircle, Plus, Rocket, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
}

interface BusinessLaunch {
  id: string
  name: string
  description?: string
  businessType?: string
  progress: number
  status: string
  createdAt: string
  updatedAt: string
}

export default function DashboardClient() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [sellerDomains, setSellerDomains] = useState<SellerDomain[]>([])
  const [businessLaunches, setBusinessLaunches] = useState<BusinessLaunch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState<SellerDomain | null>(null)

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push('/sign-in')
        return
      }

      const fetchDomains = async () => {
        const result = await getSellerDomains(session.user.id)
        if (result.success) {
          setSellerDomains(result.domains || [])
        }
        
        // Add mock business launches for demonstration
        setBusinessLaunches([
          {
            id: '1',
            name: 'TechFlow Consulting',
            description: 'Building a tech consulting startup from scratch',
            businessType: 'Service',
            progress: 40,
            status: 'in_progress',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Local Fitness Studio',
            description: 'Launching a fitness studio in downtown area',
            businessType: 'Fitness',
            progress: 60,
            status: 'in_progress',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        
        setLoading(false)
      }

      fetchDomains()
    }
  }, [session, isPending, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleRefreshDomains = async () => {
    if (!session?.user) return
    const result = await getSellerDomains(session.user.id)
    if (result.success) {
      setSellerDomains(result.domains || [])
      setSelectedDomain(null)
    }
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

  return (
    <div className="min-h-screen bg-[#0a1220]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f1729] sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sky-400 hover:text-sky-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">My Listings</h1>
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
        {/* Welcome Section with Navigation */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Welcome, {session.user.name}</h2>
          <p className="mt-2 text-slate-400">{session.user.email}</p>
          
          {/* Navigation Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => window.location.hash = '#domain-listings'}
              className="flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-2.5 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300"
            >
              <Globe className="h-4 w-4" />
              Domain Listings
            </button>
            <Link
              href="/dashboard/launch"
              className="flex items-center gap-2 rounded-lg border border-sky-400 bg-sky-400/10 px-6 py-2.5 text-sm font-medium text-sky-400 transition hover:bg-sky-400/20"
            >
              <Rocket className="h-4 w-4" />
              Launch Platform
            </Link>
          </div>
        </section>

        {/* Listings Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10">
                <Globe className="h-5 w-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Domain Listings ({sellerDomains.length})</h2>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" />
              List New Domain
            </Link>
          </div>

          {sellerDomains.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur">
              <Globe className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <p className="text-slate-400">You haven't listed any domains yet.</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-lg bg-sky-400 px-6 py-2 font-semibold text-[#0a1220] transition hover:bg-sky-300"
              >
                Start Selling Your Domains
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {sellerDomains.map((domain) => (
                <div
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain)}
                  className="group cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:bg-white/[0.06] hover:border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Domain Name and Status */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">{domain.displayName}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
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
                          <span>
                            {domain.verificationStatus === 'verified_owner'
                              ? 'Live'
                              : domain.verificationStatus === 'pending_verification'
                              ? 'Pending'
                              : 'Unverified'}
                          </span>
                        </span>
                      </div>

                      {/* Description */}
                      {domain.description && (
                        <p className="mt-2 text-sm text-slate-400 line-clamp-2">{domain.description}</p>
                      )}

                      {/* Pricing and Details */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Buy Price
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            ${(domain.buyPrice / 100).toLocaleString('en-US')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Lease Price
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            ${(domain.leasePrice / 100).toLocaleString('en-US')}/mo
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Category
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">{domain.category}</p>
                        </div>
                      </div>

                      {/* DNS Code Badge */}
                      {domain.verificationStatus === 'pending_verification' && domain.verificationCode && (
                        <div className="mt-4 rounded-lg bg-orange-400/5 border border-orange-400/20 p-3">
                          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400/70">
                            DNS Verification Code
                          </p>
                          <p className="mt-1 font-mono text-sm text-orange-400 break-all">
                            {domain.verificationCode}
                          </p>
                          <p className="mt-2 text-xs text-orange-400/60">
                            Click to view full details and verification instructions
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Badge - Right Side */}
                    <div className="ml-4 flex-shrink-0 text-right">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Status
                      </p>
                      <p className="mt-1 capitalize text-sm font-medium text-white">{domain.status}</p>
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition">
                        <p className="text-xs text-sky-400 font-semibold">Click to edit →</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Business Launches Section */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10">
                <Rocket className="h-5 w-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Business Launches ({businessLaunches.length})</h2>
            </div>
            <Link
              href="/dashboard/launch"
              className="flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-[#0a1220] transition hover:bg-sky-300"
            >
              <Plus className="h-4 w-4" />
              New Launch
            </Link>
          </div>

          {businessLaunches.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur">
              <Rocket className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <p className="text-slate-400">You haven't started any business launches yet.</p>
              <Link
                href="/dashboard/launch"
                className="mt-4 inline-block rounded-lg bg-sky-400 px-6 py-2 font-semibold text-[#0a1220] transition hover:bg-sky-300"
              >
                Start Your First Launch
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {businessLaunches.map((launch, index) => (
                <motion.div
                  key={launch.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/dashboard/launch?id=${launch.id}`)}
                  className="group cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:bg-white/[0.06] hover:border-sky-400/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/10">
                      <Rocket className="h-5 w-5 text-sky-400" />
                    </div>
                    <span className={`text-xs font-medium rounded-full px-2 py-1 ${
                      launch.status === 'in_progress' ? 'bg-sky-400/20 text-sky-300' :
                      launch.status === 'launched' ? 'bg-emerald-400/20 text-emerald-300' :
                      'bg-slate-400/20 text-slate-300'
                    }`}>
                      {launch.status === 'in_progress' ? 'In Progress' : 
                       launch.status === 'launched' ? 'Launched' : 'Paused'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white">{launch.name}</h3>
                  {launch.description && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{launch.description}</p>
                  )}
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Progress</span>
                      <span className="text-sm font-semibold text-sky-400">{launch.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-sky-400 transition-all duration-500"
                        style={{ width: `${launch.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
                    <span className="text-xs text-slate-400">View details</span>
                    <ChevronRight className="h-4 w-4 text-sky-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Domain Detail Modal */}
      {selectedDomain && (
        <DomainListingDetail
          domain={selectedDomain}
          userId={session.user.id}
          onClose={() => setSelectedDomain(null)}
          onUpdate={handleRefreshDomains}
        />
      )}
    </div>
  )
}
