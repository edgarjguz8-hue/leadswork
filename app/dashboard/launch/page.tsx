'use client'

import React, { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import {
  ArrowLeft,
  LogOut,
  Rocket,
  Monitor,
  Wrench,
  Target,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Layers,
  Plus,
} from "lucide-react"
import { motion } from "framer-motion"

const launchSteps = [
  {
    id: 1,
    title: "Build the Business",
    description: "Name, domain, legal setup, email, and phone.",
    status: "Completed",
    icon: BriefcaseBusiness,
    items: [
      "Business name",
      "Business type",
      "Domain selected",
      "Business email",
      "Business phone",
    ],
  },
  {
    id: 2,
    title: "Set Up the Brand & Website",
    description: "Logo, colors, business description, and website.",
    status: "In Progress",
    icon: Monitor,
    items: [
      "Logo",
      "Brand colors",
      "Business description",
      "Website homepage",
      "Contact form",
    ],
  },
  {
    id: 3,
    title: "Set Up the Systems",
    description: "CRM, payments, scheduling, and customer intake.",
    status: "Not Started",
    icon: Wrench,
    items: [
      "Customer intake form",
      "Simple CRM",
      "Scheduling system",
      "Payment setup",
      "Operations checklist",
    ],
  },
  {
    id: 4,
    title: "Find Customers",
    description: "Marketing, local outreach, leads, and connections.",
    status: "Not Started",
    icon: Target,
    items: [
      "Google Business Profile",
      "Lead generation plan",
      "Local outreach plan",
      "Referral strategy",
      "Browse connections",
    ],
  },
  {
    id: 5,
    title: "Launch & Grow",
    description: "Go live, get first customers, and keep growing.",
    status: "Not Started",
    icon: Rocket,
    items: [
      "Final launch checklist",
      "First customer plan",
      "Go live",
      "Partnerships",
      "Growth plan",
    ],
  },
]

export default function LaunchDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = useSession()
  const [completedSteps, setCompletedSteps] = useState<number[]>([1])
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [launchData, setLaunchData] = useState({
    id: searchParams.get('id') || 'new-launch',
    name: 'My Business Launch',
    description: 'Building my business from idea to operation',
  })

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

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const toggleStepComplete = (stepId: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    )
  }

  const completedCount = completedSteps.length
  const totalSteps = launchSteps.length
  const progressPercent = (completedCount / totalSteps) * 100

  return (
    <div className="min-h-screen bg-[#0a1220] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a1220]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400 text-[#0a1220]">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              LeadsWork
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
            Launch System
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Build Your Business
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
            Follow our guided system to launch your business from idea to operation in 7 days.
          </p>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Progress</h2>
            <span className="text-sm font-medium text-sky-400">
              {completedCount} of {totalSteps} completed
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-sky-400"
            />
          </div>
        </motion.div>

        {/* Launch Steps Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {launchSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const StepIcon = step.icon

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-sky-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition ${
                        isCompleted
                          ? "bg-sky-400/20 text-sky-400"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        {isCompleted && (
                          <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-xs font-medium text-sky-300">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`h-5 w-5 flex-shrink-0 transition ${
                      selectedStep === step.id ? "rotate-90" : ""
                    } text-slate-500`}
                  />
                </div>

                {/* Expanded Section */}
                {selectedStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 border-t border-white/10 pt-6"
                  >
                    <div className="space-y-3">
                      {step.items.map((item, itemIndex) => (
                        <label
                          key={itemIndex}
                          className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-sky-400 accent-sky-400"
                            defaultChecked={false}
                          />
                          <span className="text-sm text-slate-300">{item}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStepComplete(step.id)
                      }}
                      className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-medium transition ${
                        isCompleted
                          ? "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                          : "border border-sky-400/30 bg-sky-400/10 text-sky-300 hover:bg-sky-400/20"
                      }`}
                    >
                      {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-12 grid gap-4 md:grid-cols-3"
        >
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Steps Completed
            </p>
            <p className="mt-2 text-2xl font-semibold">{completedCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Days Active
            </p>
            <p className="mt-2 text-2xl font-semibold">3</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Next Milestone
            </p>
            <p className="mt-2 text-lg font-semibold text-sky-400">50%</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
