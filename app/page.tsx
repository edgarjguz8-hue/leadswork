  "use client"

import React, { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import DomainCheckout from "@/components/domain-checkout"
import OwnershipVerification from "@/components/ownership-verification"
import SellDomainForm from "@/components/sell-domain-form"
import {
  Search,
  ArrowRight,
  Layers,
  Menu,
  X,
  Globe,
  Rocket,
  Users,
  Crown,
  Briefcase,
  Store,
  MessageCircle,
  Calendar,
  MapPin,
  Sparkles,
  Building2,
  UserPlus,
  Mail,
  Target,
  Zap,
  TrendingUp,
  LogOut,
  User,
  LayoutGrid,
} from "lucide-react"
import { motion } from "framer-motion"
import { getAvailableDomainsForMarketplace } from "@/lib/marketplace-data"
import {
  checkExternalDomainStatus,
  requestDomainVerification,
  verifyDomainOwnershipAction,
  getDomainVerificationStatus,
} from "@/app/actions/domain"

interface Domain {
  id: string
  name: string
  price: string
  lease: string
  category: string
  idea: string
  score: number
  buyPriceInCents: number
  leasePriceInCents: number
}

const categories = [
  "All",
  "Local Business",
  "Automotive",
  "Legal",
  "Health & Fitness",
  "Home Services",
  "Business Tools",
]

const moreCategories = [
  "Real Estate",
  "Finance",
  "Technology",
  "E-Commerce",
  "Education",
  "Entertainment",
  "Travel",
  "Food & Beverage",
  "Fashion",
  "Sports",
  "Healthcare",
  "Marketing",
]

const navItems = [
  { label: "Domain", page: "marketplace" },
  { label: "Launch", page: "launch" },
  { label: "Connect", page: "tools" },
  { label: "Memberships", page: "membership" },
]

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-300">
      {children}
    </span>
  )
}

function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children?: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sky-400">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
          {subtitle}
        </p>
        {children}
      </motion.div>
    </section>
  )
}

function DomainMarketplace() {
  const router = useRouter()
  const { data: session } = useSession()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [mode, setMode] = useState<"buy" | "lease" | "sell" | null>(null)
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const [checkoutDomain, setCheckoutDomain] = useState<{
    id: string
    name: string
    priceInCents: number
    type: 'buy' | 'lease'
  } | null>(null)

  // Load domains from database on mount
  useEffect(() => {
    async function loadDomains() {
      try {
        const loadedDomains = await getAvailableDomainsForMarketplace()
        setDomains(loadedDomains)
      } catch (error) {
        console.error('Failed to load domains:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDomains()
  }, [])

  // Helper to parse price string to cents
  const parsePriceToCents = (priceStr: string): number => {
    const cleaned = priceStr.replace(/[$,\/mo]/g, '')
    return Math.round(parseFloat(cleaned) * 100)
  }

  // Handler that checks auth before action
  const handleProtectedAction = (action: () => void) => {
    if (!session?.user) {
      router.push("/sign-in")
      return
    }
    action()
  }

  // Handler for buy/lease checkout
  const handleCheckout = (domain: Domain, type: 'buy' | 'lease') => {
    if (!session?.user) {
      router.push("/sign-in")
      return
    }
    const priceInCents = type === 'buy' ? domain.buyPriceInCents : domain.leasePriceInCents
    setCheckoutDomain({
      id: domain.id,
      name: domain.name,
      priceInCents,
      type
    })
  }

  const filteredDomains = useMemo(() => {
    return domains.filter((domain) => {
      // "All" category shows all domains regardless of their category
      const matchesCategory =
        category === "All" ? true : domain.category === category
      const matchesQuery =
        domain.name.toLowerCase().includes(query.toLowerCase()) ||
        domain.idea.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [query, category, domains])

  // Landing view - no mode selected yet
  if (!mode) {
    return (
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl text-center"
          >
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Find your domain
            </h1>
            <p className="mx-auto mt-4 max-w-md text-slate-400">
              Premium domains with real business potential
            </p>

            {/* Mode buttons */}
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => setMode("buy")}
                className="rounded-lg bg-sky-400 px-8 py-3.5 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300"
              >
                Buy Domains
              </button>
              <button
                onClick={() => setMode("lease")}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
              >
                Lease Domains
              </button>
              <button
                onClick={() => setMode("sell")}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
              >
                Sell Domains
              </button>
            </div>

            {/* Search bar */}
            <div className="mx-auto mt-10 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    if (e.target.value) setMode("buy")
                  }}
                  placeholder="Search domains or industries..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                />
              </div>
            </div>

            {/* Category filters */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setCategory(item)
                    setMode("buy")
                  }}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    category === item
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  showMoreCategories || moreCategories.includes(category)
                    ? "bg-white/10 text-white font-medium"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                More {showMoreCategories ? "−" : "+"}
              </button>
            </div>

            {/* Expanded categories */}
            {showMoreCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap justify-center gap-2"
              >
                {moreCategories.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setCategory(item)
                      setMode("buy")
                    }}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      category === item
                        ? "bg-white/10 text-white font-medium"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Featured Listings */}
        <section className="border-t border-white/10 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            {/* Premium Picks */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10">
                    <Crown className="h-4 w-4 text-sky-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Premium Picks</h2>
                </div>
                <button
                  onClick={() => setMode("buy")}
                  className="text-sm text-slate-400 transition hover:text-sky-400"
                >
                  View all →
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {domains
                  .filter((d) => d.score >= 92)
                  .slice(0, 3)
                  .map((domain) => (
                    <div
                      key={domain.name}
                      className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-sky-400/30"
                    >
                      <div className="flex items-start justify-between">
                        <Badge>{domain.category}</Badge>
                        <span className="rounded bg-sky-400/10 px-2 py-0.5 text-xs font-semibold text-sky-400">
                          {domain.score}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight">
                        {domain.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {domain.idea}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <div>
                          <p className="text-xs text-slate-500">Buy</p>
                          <p className="text-lg font-semibold">{domain.price}</p>
                        </div>
                        <button
                          onClick={() => setMode("buy")}
                          className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>

            {/* Budget Friendly */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-14"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Budget Friendly</h2>
                </div>
                <button
                  onClick={() => setMode("buy")}
                  className="text-sm text-slate-400 transition hover:text-sky-400"
                >
                  View all →
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {domains
                  .filter((d) => parseInt(d.price.replace(/[$,]/g, "")) < 15000)
                  .slice(0, 3)
                  .map((domain) => (
                    <div
                      key={domain.name}
                      className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30"
                    >
                      <div className="flex items-start justify-between">
                        <Badge>{domain.category}</Badge>
                        <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          {domain.score}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight">
                        {domain.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {domain.idea}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <div>
                          <p className="text-xs text-slate-500">Buy</p>
                          <p className="text-lg font-semibold">{domain.price}</p>
                        </div>
                        <button
                          onClick={() => setMode("buy")}
                          className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-[#0a1220] transition hover:bg-emerald-300"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>

            {/* Lease Options */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-14"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10">
                    <Layers className="h-4 w-4 text-sky-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Lease to Own</h2>
                </div>
                <button
                  onClick={() => setMode("lease")}
                  className="text-sm text-slate-400 transition hover:text-sky-400"
                >
                  View all →
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {domains.slice(0, 3).map((domain) => (
                  <div
                    key={domain.name}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-sky-400/30"
                  >
                    <div className="flex items-start justify-between">
                      <Badge>{domain.category}</Badge>
                      <span className="rounded bg-sky-400/10 px-2 py-0.5 text-xs font-semibold text-sky-400">
                        {domain.score}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight">
                      {domain.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                      {domain.idea}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <div>
                        <p className="text-xs text-slate-500">Lease</p>
                        <p className="text-lg font-semibold">{domain.lease}</p>
                      </div>
                      <button
                        onClick={() => setMode("lease")}
                        className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300"
                      >
                        Lease
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    )
  }

  // Buy mode - dedicated buy page
  if (mode === "buy") {
    return (
      <>
        {/* Buy Header */}
        <section className="border-b border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <button
              onClick={() => setMode(null)}
              className="mb-6 text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to domains
            </button>
            <div className="text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
                Buy Domains
              </p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Own it outright
              </h1>
              <p className="mt-2 text-slate-400">
                Full ownership, instant transfer, no recurring fees
              </p>
              <div className="relative mx-auto mt-6 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search domains..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category filters */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                    category === item
                      ? "bg-sky-400 text-[#0a1220] font-medium"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  showMoreCategories || moreCategories.includes(category)
                    ? "bg-sky-400 text-[#0a1220] font-medium"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                More {showMoreCategories ? "−" : "+"}
              </button>
            </div>
            {showMoreCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 flex flex-wrap justify-center gap-2"
              >
                {moreCategories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                      category === item
                        ? "bg-sky-400 text-[#0a1220] font-medium"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Buy Domain grid */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <p className="mb-6 text-sm text-slate-500">
            {filteredDomains.length} domain{filteredDomains.length !== 1 ? "s" : ""} available
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDomains.map((domain) => (
              <div
                key={domain.name}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-sky-400/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <Badge>{domain.category}</Badge>
                  <div className="rounded-lg bg-sky-400/10 px-2.5 py-1 text-xs font-bold text-sky-400">
                    {domain.score}
                  </div>
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {domain.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {domain.idea}
                </p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs text-slate-500">Purchase Price</p>
                  <p className="mt-1 text-2xl font-bold">{domain.price}</p>
                </div>

                <button 
                  onClick={() => handleCheckout(domain, 'buy')}
                  className="mt-5 w-full rounded-lg bg-white py-3 text-sm font-semibold text-[#0a1220] transition hover:bg-sky-100"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Checkout Modal */}
        {checkoutDomain && (
          <DomainCheckout
            domainId={checkoutDomain.id}
            domainName={checkoutDomain.name}
            priceInCents={checkoutDomain.priceInCents}
            type={checkoutDomain.type}
            onClose={() => setCheckoutDomain(null)}
          />
        )}
      </>
    )
  }

  // Lease mode - dedicated lease page
  if (mode === "lease") {
    return (
      <>
        {/* Lease Header */}
        <section className="border-b border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <button
              onClick={() => setMode(null)}
              className="mb-6 text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to domains
            </button>
            <div className="text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
                Lease Domains
              </p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Start using today
              </h1>
              <p className="mt-2 text-slate-400">
                Low monthly payments, option to buy later
              </p>
              <div className="relative mx-auto mt-6 w-full max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search domains..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category filters */}
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                    category === item
                      ? "bg-sky-400 text-[#0a1220] font-medium"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  showMoreCategories || moreCategories.includes(category)
                    ? "bg-sky-400 text-[#0a1220] font-medium"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                More {showMoreCategories ? "−" : "+"}
              </button>
            </div>
            {showMoreCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 flex flex-wrap justify-center gap-2"
              >
                {moreCategories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                      category === item
                        ? "bg-sky-400 text-[#0a1220] font-medium"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Lease Domain grid */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <p className="mb-6 text-sm text-slate-500">
            {filteredDomains.length} domain{filteredDomains.length !== 1 ? "s" : ""} available for lease
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDomains.map((domain) => (
              <div
                key={domain.name}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-sky-400/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <Badge>{domain.category}</Badge>
                  <div className="rounded-lg bg-sky-400/10 px-2.5 py-1 text-xs font-bold text-sky-400">
                    {domain.score}
                  </div>
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {domain.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {domain.idea}
                </p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs text-slate-500">Monthly Lease</p>
                  <p className="mt-1 text-2xl font-bold">{domain.lease}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Buy later for {domain.price}
                  </p>
                </div>

                <button 
                  onClick={() => handleCheckout(domain, 'lease')}
                  className="mt-5 w-full rounded-lg bg-sky-400 py-3 text-sm font-semibold text-[#0a1220] transition hover:bg-sky-300"
                >
                  Lease Domain
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Checkout Modal */}
        {checkoutDomain && (
          <DomainCheckout
            domainId={checkoutDomain.id}
            domainName={checkoutDomain.name}
            priceInCents={checkoutDomain.priceInCents}
            type={checkoutDomain.type}
            onClose={() => setCheckoutDomain(null)}
          />
        )}
      </>
    )
  }

  // Sell mode
  return (
    <SellDomainForm onBack={() => setMode(null)} />
  )
}

function LaunchServices() {
  const stages = [
    "IDEA",
    "BRAND",
    "FORM",
    "BUILD",
    "MARKET",
    "CONNECT",
    "OPERATE",
    "SCALE",
  ]

  return (
    <>
      <PageHero
        eyebrow="Launch"
        title="From idea to operating business."
        subtitle="A step-by-step launch system designed to help entrepreneurs build and grow with structure, guidance, and momentum."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Badge>Step-by-Step Launch</Badge>
          <Badge>Progress Tracking</Badge>
          <Badge>Business Builder</Badge>
        </div>

        <div className="mt-10">
          <button className="inline-flex items-center rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </PageHero>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {stages.map((item, index) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center transition hover:border-sky-400/30"
            >
              <p className="text-xs font-medium text-sky-400">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {item}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">
              The Launch System
            </p>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Everything needed to launch a business — organized into one system.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              LeadsWork helps entrepreneurs move from idea to launch with a
              clear roadmap, startup guidance, tools, partnerships, and growth
              support.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
            <h3 className="text-2xl font-semibold tracking-tight">
              Most entrepreneurs fail because they get lost in the process.
            </h3>
            <p className="mt-4 leading-relaxed text-slate-400">
              LeadsWork provides structure, direction, and momentum so
              entrepreneurs always know what to do next.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function ConnectNetwork() {
  const [activeTab, setActiveTab] = useState("directory")

  const userTypes = [
    {
      icon: Briefcase,
      title: "Service Providers",
      description: "Web designers, marketers, accountants, lawyers, consultants",
      count: "2,400+",
    },
    {
      icon: Store,
      title: "Local Businesses",
      description: "Restaurants, retail, fitness, salons, contractors",
      count: "5,100+",
    },
    {
      icon: Users,
      title: "Entrepreneurs",
      description: "Founders, operators, freelancers, creators",
      count: "8,200+",
    },
  ]

  const connectionMethods = [
    {
      icon: Mail,
      title: "Direct Contact",
      description: "View email, phone, and website directly on profiles",
    },
    {
      icon: MessageCircle,
      title: "In-Platform Messaging",
      description: "Send messages through LeadsWork without sharing personal info",
    },
    {
      icon: Calendar,
      title: "Book Appointments",
      description: "Schedule calls or meetings directly from any profile",
    },
  ]

  const featuredProviders = [
    { name: "Sarah Chen", role: "Brand Strategist", location: "Austin, TX", rating: 4.9 },
    { name: "Marcus Johnson", role: "Web Developer", location: "Miami, FL", rating: 5.0 },
    { name: "Elena Rodriguez", role: "Marketing Consultant", location: "Denver, CO", rating: 4.8 },
    { name: "David Kim", role: "Business Attorney", location: "Seattle, WA", rating: 4.9 },
  ]

  const upcomingEvents = [
    { title: "Startup Networking Mixer", date: "Jun 15", location: "Austin, TX", attendees: 45 },
    { title: "Small Business Growth Summit", date: "Jun 22", location: "Virtual", attendees: 120 },
    { title: "Local Entrepreneur Meetup", date: "Jun 28", location: "Miami, FL", attendees: 32 },
  ]

  return (
    <>
      <PageHero
        eyebrow="Connect"
        title="Build relationships that grow your business."
        subtitle="Find customers, meet fellow entrepreneurs, partner with service providers, and grow your network locally or nationally."
      />

      {/* User Types */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {userTypes.map((type) => {
            const Icon = type.icon
            return (
              <div
                key={type.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/10">
                    <Icon className="h-5 w-5 text-sky-400" />
                  </div>
                  <span className="text-sm font-medium text-sky-400">{type.count}</span>
                </div>
                <h3 className="mt-4 font-semibold">{type.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{type.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Tabs */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex gap-1 overflow-x-auto py-4">
            {[
              { id: "directory", label: "Directory", icon: Building2 },
              { id: "matching", label: "Smart Matching", icon: Sparkles },
              { id: "events", label: "Events", icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-sky-400 text-[#0a1220]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        {activeTab === "directory" && (
          <div>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Browse Directory</h2>
                <p className="mt-1 text-slate-400">Find providers, businesses, and entrepreneurs by category or location</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  placeholder="Search by name, service, or city"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredProviders.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-sky-400/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/10 text-sky-400 font-semibold">
                      {provider.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      <p className="text-sm text-slate-400">{provider.role}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {provider.location}
                      </div>
                    </div>
                  </div>
                  <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5">
                    View
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-lg border border-white/10 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5">
              View All Directory Listings
            </button>
          </div>
        )}

        {activeTab === "matching" && (
          <div>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10">
                <Sparkles className="h-7 w-7 text-sky-400" />
              </div>
              <h2 className="text-2xl font-semibold">Smart Matching</h2>
              <p className="mx-auto mt-2 max-w-md text-slate-400">
                Tell us what you need and we will recommend the right people to connect with based on your goals.
              </p>
            </div>
            <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">I am looking for...</label>
                  <select className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-400/50">
                    <option value="">Select a category</option>
                    <option value="service">Service Provider</option>
                    <option value="partner">Business Partner</option>
                    <option value="mentor">Mentor or Advisor</option>
                    <option value="customer">Potential Customers</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Industry or niche</label>
                  <input
                    placeholder="e.g., Real estate, SaaS, E-commerce"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Location preference</label>
                  <input
                    placeholder="City, state, or 'Remote'"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                  />
                </div>
                <button className="w-full rounded-lg bg-sky-400 py-3 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300">
                  Find Matches
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Upcoming Events</h2>
                <p className="mt-1 text-slate-400">Network with entrepreneurs at virtual and local events</p>
              </div>
              <button className="rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300">
                Host an Event
              </button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-sky-400/10 text-sky-400">
                      <span className="text-lg font-bold">{event.date.split(" ")[0]}</span>
                      <span className="text-xs">{event.date.split(" ")[1]}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserPlus className="h-3 w-3" />
                          {event.attendees} attending
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5">
                    RSVP
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How Connection Works */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-semibold">How to Connect</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {connectionMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <div key={method.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400/10">
                    <Icon className="h-5 w-5 text-sky-400" />
                  </div>
                  <div className="mb-2 text-xs font-medium text-sky-400">Step {index + 1}</div>
                  <h3 className="font-semibold">{method.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{method.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-8 text-center">
          <h2 className="text-2xl font-semibold">Ready to grow your network?</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-400">
            Create your profile and start connecting with entrepreneurs, providers, and customers today.
          </p>
          <button className="mt-6 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300">
            Create Your Profile
          </button>
        </div>
      </section>
    </>
  )
}

function Membership() {
  return (
    <>
      <PageHero
        eyebrow="Memberships"
        title="A membership built for entrepreneurs."
        subtitle="Access launch systems, business resources, partner perks, and growth tools from one platform."
      />

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Starter", "$19/mo", "Basic launch tools and resources"],
            ["Builder", "$49/mo", "Full access to partner network"],
            ["Pro", "$149/mo", "Priority support and consulting"],
          ].map(([plan, price, desc]) => (
            <div
              key={plan}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h3 className="text-lg font-semibold">{plan}</h3>
              <p className="mt-1 text-3xl font-semibold text-sky-400">
                {price}
              </p>
              <p className="mt-2 text-sm text-slate-400">{desc}</p>
              <button className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-medium text-[#0a1220] transition hover:bg-sky-100">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function HomePage({ setPage }: { setPage: (page: string) => void }) {
  const products = [
    {
      name: "Domain Marketplace",
      description: "Buy, sell, and lease premium domains with real business potential.",
      page: "marketplace",
      icon: Globe,
    },
    {
      name: "Launch Platform",
      description: "A step-by-step system to take your idea from concept to operating business.",
      page: "launch",
      icon: Rocket,
    },
    {
      name: "Connect Network",
      description: "Build relationships with customers, partners, and local businesses.",
      page: "tools",
      icon: Users,
    },
    {
      name: "Memberships",
      description: "Access resources, partner perks, and growth tools with a membership.",
      page: "membership",
      icon: Crown,
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500">
            <Layers className="h-8 w-8 text-[#0a1220]" />
          </div>
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
            LeadsWork
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-slate-400">
            The platform for entrepreneurs to launch, grow, and connect.
          </p>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product, index) => {
              const Icon = product.icon
              return (
                <motion.button
                  key={product.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setPage(product.page)}
                  className="group flex flex-col items-start rounded-2xl border border-white/10 bg-[#0a1220] p-6 text-left transition-all hover:border-sky-400/40 hover:bg-white/[0.03]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400 transition-colors group-hover:bg-sky-400/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold tracking-tight">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-sky-400 opacity-0 transition-opacity group-hover:opacity-100">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why LeadsWork */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
              Why LeadsWork
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to grow
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              We built LeadsWork to give entrepreneurs a clear path forward. No fluff, no confusion - just the tools and guidance to turn your ideas into real businesses.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Target className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="mt-5 font-semibold">Built for Action</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Stop researching, start doing. Our platform gives you step-by-step systems so you always know what to do next.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Zap className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="mt-5 font-semibold">Move Faster</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Premium domains, launch guides, and partner networks - all in one place. Less searching, more building.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <TrendingUp className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="mt-5 font-semibold">Grow With Support</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                You are not doing this alone. Connect with other entrepreneurs, find partners, and access resources that scale with you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Help You Grow */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
              Your Journey
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              From idea to business
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-[#0a1220] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-lg font-bold text-[#0a1220]">
                1
              </div>
              <h3 className="mt-5 text-lg font-semibold">Find Your Name</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Browse our marketplace for premium domains that match your vision. Buy outright or lease to get started.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-2xl border border-white/10 bg-[#0a1220] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-lg font-bold text-[#0a1220]">
                2
              </div>
              <h3 className="mt-5 text-lg font-semibold">Launch Your Business</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Follow our guided launch system. We walk you through every step from branding to your first customer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative rounded-2xl border border-white/10 bg-[#0a1220] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-lg font-bold text-[#0a1220]">
                3
              </div>
              <h3 className="mt-5 text-lg font-semibold">Grow Your Network</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Connect with customers, partners, and other entrepreneurs. Build relationships that fuel long-term growth.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => setPage("marketplace")}
              className="rounded-xl bg-sky-400 px-8 py-3.5 text-sm font-semibold text-[#0a1220] transition hover:bg-sky-300"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer About */}
      <section className="mt-auto border-t border-white/10 px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm leading-relaxed text-slate-500">
            LeadsWork connects entrepreneurs to the tools, resources, and people they need.
            We help you find, understand, and move forward with clarity.
          </p>
        </div>
      </section>
    </div>
  )
}

export default function LeadsWorkWebsite() {
  const [page, setPage] = useState("home")
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }
  
  const renderPage = () => {
    if (page === "marketplace") return <DomainMarketplace />
    if (page === "launch") return <LaunchServices />
    if (page === "tools") return <ConnectNetwork />
    if (page === "membership") return <Membership />
    return <HomePage setPage={setPage} />
  }

  return (
    <div className="min-h-screen bg-[#0a1220] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a1220]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => setPage("home")}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400 text-[#0a1220]">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              LeadsWork
            </span>
          </button>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`rounded-md px-3 py-2 transition ${
                  page === item.page
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {session?.user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm text-slate-400">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
              >
                <LayoutGrid className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => router.push("/sign-in")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/sign-up")}
                className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-[#0a1220] transition hover:bg-sky-300"
              >
                Get Started
              </button>
            </div>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 px-6 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    setPage(item.page)
                    setMenuOpen(false)
                  }}
                  className={`rounded-md px-3 py-2.5 text-left text-sm transition ${
                    page === item.page
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-3 border-t border-white/10 pt-3">
                {session?.user ? (
                  <>
                    <p className="px-3 py-2 text-sm text-slate-400">
                      {session.user.name || session.user.email}
                    </p>
                    <button
                      onClick={() => {
                        router.push("/dashboard")
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-slate-400 transition hover:text-white"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-slate-400 transition hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        router.push("/sign-in")
                        setMenuOpen(false)
                      }}
                      className="w-full rounded-md px-3 py-2.5 text-left text-sm text-slate-400 transition hover:text-white"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        router.push("/sign-up")
                        setMenuOpen(false)
                      }}
                      className="mt-2 w-full rounded-lg bg-sky-400 px-3 py-2.5 text-center text-sm font-medium text-[#0a1220] transition hover:bg-sky-300"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{renderPage()}</main>
    </div>
  )
}
