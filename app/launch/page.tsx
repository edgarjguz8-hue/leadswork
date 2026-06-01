'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { Rocket, CheckCircle, Zap, Users, TrendingUp, ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LaunchPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const features = [
    {
      icon: CheckCircle,
      title: 'Build the Business',
      description: 'Complete business setup with domain, email, legal structure, and business phone.',
    },
    {
      icon: Zap,
      title: 'Brand & Website',
      description: 'Design your brand identity, create your homepage, and build customer contact forms.',
    },
    {
      icon: Users,
      title: 'Customer Systems',
      description: 'Set up CRM, payment processing, customer intake, and scheduling all in one place.',
    },
    {
      icon: TrendingUp,
      title: 'Find Customers',
      description: 'Execute marketing strategies, local outreach, lead generation, and referral programs.',
    },
    {
      icon: Rocket,
      title: 'Go Live',
      description: 'Final launch checklist, get your first customers, and launch with confidence.',
    },
    {
      icon: Users,
      title: 'Grow Your Business',
      description: 'Build partnerships, execute growth plans, and scale your business sustainably.',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Answer a Few Questions',
      description: 'Tell us about your business idea and what you want to build.',
    },
    {
      number: '2',
      title: 'Get Your Roadmap',
      description: 'We create a personalized launch plan with all the steps you need.',
    },
    {
      number: '3',
      title: 'Complete Each Section',
      description: 'Work through business setup, branding, systems, and customer acquisition.',
    },
    {
      number: '4',
      title: 'Launch Your Business',
      description: 'Go live, acquire your first customers, and start growing.',
    },
  ]

  const handleGetStarted = () => {
    if (session?.user) {
      router.push('/dashboard/launch')
    } else {
      router.push('/sign-up')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1220] via-[#0f1729] to-[#0a1220]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a1220]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            LEADS<span className="text-sky-400">WORK</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
              Back to Home
            </Link>
            {session?.user ? (
              <Link
                href="/dashboard/launch"
                className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-[#0a1220] hover:bg-sky-300 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-[#0a1220] hover:bg-sky-300 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2">
              <Rocket className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-semibold text-sky-300">Launch Your Business</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              From Idea to Operating
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Business in 7 Days
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              We guide you through every step of building and launching your business. From domain and branding to customer systems and growth—everything you need in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-8 py-4 font-semibold text-[#0a1220] hover:bg-sky-300 transition text-lg"
              >
                <Play className="h-5 w-5" />
                Start Your Launch
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white hover:bg-white/10 transition text-lg"
              >
                <ArrowRight className="h-5 w-5" />
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">A simple, step-by-step process to launch your business</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/20 text-sky-400">
                    <span className="text-lg font-bold">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-sky-400/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Launch</h2>
            <p className="text-xl text-slate-400">All the tools and guidance built into one launch system</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur hover:bg-white/[0.06] hover:border-sky-400/30 transition"
                >
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-sky-400/20 p-3 group-hover:bg-sky-400/30 transition">
                    <Icon className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Why Use LeadsWork Launch?</h2>
              <ul className="space-y-4">
                {[
                  'Complete business setup in one place',
                  'Step-by-step guidance for each phase',
                  'No confusing tools or complicated processes',
                  'Customer acquisition strategies included',
                  'Real-time progress tracking',
                  'Connect with other business owners',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-sky-400 flex-shrink-0 mt-1" />
                    <span className="text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/20 to-blue-500/10 p-8 backdrop-blur"
            >
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-sky-400 mb-2">7 Days</div>
                  <p className="text-slate-400">Average time to launch with our system</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-sky-400 mb-2">5 Phases</div>
                  <p className="text-slate-400">Complete coverage from idea to growth</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-sky-400 mb-2">100%</div>
                  <p className="text-slate-400">All-in-one system—no external tools needed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="mx-auto max-w-3xl text-center rounded-2xl border border-sky-400/20 bg-sky-400/5 p-12 backdrop-blur">
          <h2 className="text-4xl font-bold mb-4">Ready to Launch Your Business?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of entrepreneurs building their business with LeadsWork.
          </p>
          <button
            onClick={handleGetStarted}
            className="rounded-lg bg-sky-400 px-8 py-4 font-semibold text-[#0a1220] hover:bg-sky-300 transition text-lg"
          >
            Start Your 7-Day Launch →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12 mt-20">
        <div className="mx-auto max-w-7xl text-center text-slate-400">
          <p>© 2024 LeadsWork. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
