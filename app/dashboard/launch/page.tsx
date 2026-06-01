'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import {
  ArrowLeft,
  LogOut,
  Check,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"

const launchSteps = [
  {
    number: "01",
    title: "Define Your Idea",
    description: "Clarify your business concept, target market, and value proposition.",
  },
  {
    number: "02",
    title: "Set Up Brand & Website",
    description: "Create a professional brand identity and online presence.",
  },
  {
    number: "03",
    title: "Build Systems",
    description: "Establish operational systems, workflows, and tools.",
  },
  {
    number: "04",
    title: "Find Customers",
    description: "Execute marketing strategies and reach your ideal customers.",
  },
  {
    number: "05",
    title: "Launch & Scale",
    description: "Go live with confidence and grow with ongoing support.",
  },
]

export default function LaunchDashboard() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!session?.user) {
    router.push("/sign-in")
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a1220]">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.02] backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back Home</span>
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            Launch System
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Business Launch
          </h1>
        </div>

        {/* Dashboard */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Progress & Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Completion Percentage */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                  Project Completion
                </p>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-4xl font-bold text-sky-400">45%</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-sky-400 transition-all duration-500"
                        style={{ width: "45%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                  What's Next
                </p>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:border-sky-400/30 transition">
                  <p className="text-sm font-medium text-white">Set Up Brand & Website</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Create your brand identity and establish your online presence
                  </p>
                </div>
              </div>

              {/* Business Overview */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                  Business Overview
                </p>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Business Type</p>
                    <p className="text-sm font-medium text-white">Tech Startup</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Industry</p>
                    <p className="text-sm font-medium text-white">SaaS</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-medium text-white">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Steps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="space-y-3">
                {launchSteps.map((step, index) => (
                  <motion.button
                    key={step.number}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedStep(selectedStep === index ? null : index)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-sky-400/30 hover:bg-white/[0.06] transition group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10 flex-shrink-0 mt-0.5 group-hover:bg-sky-400/20 transition">
                        <p className="text-xs font-bold text-sky-400">{step.number}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{step.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-slate-600 flex-shrink-0 transition ${selectedStep === index ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Expandable bullet points */}
                    {selectedStep === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pl-11 border-t border-white/10 pt-4 space-y-2"
                      >
                        {[
                          'Complete initial setup',
                          'Define scope and timeline',
                          'Set up tracking',
                          'Review requirements',
                          'Schedule next meeting',
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-2 text-sm text-slate-400"
                          >
                            <Check className="h-4 w-4 text-sky-400 flex-shrink-0" />
                            <span>{item}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
