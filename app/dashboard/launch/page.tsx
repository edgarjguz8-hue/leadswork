'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { ArrowLeft, LogOut, ChevronDown, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const launchSteps = [
  {
    id: 1,
    title: "Define Your Idea",
    description: "Clarify your business concept",
    subsections: [
      { id: 1, name: "Business name & concept", completed: true },
      { id: 2, name: "Target market research", completed: true },
      { id: 3, name: "Value proposition", completed: false },
      { id: 4, name: "Initial planning document", completed: false },
    ],
  },
  {
    id: 2,
    title: "Set Up Brand & Website",
    description: "Create your online presence",
    subsections: [
      { id: 1, name: "Logo design", completed: true },
      { id: 2, name: "Brand colors & guidelines", completed: true },
      { id: 3, name: "Website homepage", completed: false },
      { id: 4, name: "Contact form setup", completed: false },
      { id: 5, name: "Domain connected", completed: false },
    ],
  },
  {
    id: 3,
    title: "Build Systems",
    description: "Set up operational systems",
    subsections: [
      { id: 1, name: "CRM selection", completed: false },
      { id: 2, name: "Payment processing", completed: false },
      { id: 3, name: "Scheduling system", completed: false },
      { id: 4, name: "Email setup", completed: false },
      { id: 5, name: "Workflow automation", completed: false },
      { id: 6, name: "Documentation templates", completed: false },
    ],
  },
  {
    id: 4,
    title: "Find Customers",
    description: "Execute marketing strategies",
    subsections: [
      { id: 1, name: "Google Business Profile", completed: false },
      { id: 2, name: "Marketing plan", completed: false },
      { id: 3, name: "Social media setup", completed: false },
      { id: 4, name: "First outreach", completed: false },
    ],
  },
  {
    id: 5,
    title: "Launch & Scale",
    description: "Go live and grow",
    subsections: [
      { id: 1, name: "Launch checklist", completed: false },
      { id: 2, name: "First customer onboarded", completed: false },
      { id: 3, name: "Initial feedback collection", completed: false },
      { id: 4, name: "Growth strategy", completed: false },
    ],
  },
]

export default function LaunchDashboard() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!session?.user) {
    router.push("/sign-in")
    return null
  }

  // Calculate overall progress
  const totalSubsections = launchSteps.reduce((sum, step) => sum + step.subsections.length, 0)
  const completedSubsections = launchSteps.reduce(
    (sum, step) => sum + step.subsections.filter(s => s.completed).length,
    0
  )
  const overallProgress = Math.round((completedSubsections / totalSubsections) * 100)

  // Find next incomplete task
  const nextIncompleteTask = launchSteps
    .flatMap(step => step.subsections.map(sub => ({ ...sub, stepTitle: step.title })))
    .find(task => !task.completed)

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1220]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f1729] sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header Card - WHOOP Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Large Progress Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgb(56, 189, 248)"
                    strokeWidth="8"
                    strokeDasharray={`${(overallProgress / 100) * 440} 440`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-4xl font-bold text-sky-400">{overallProgress}%</p>
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Overall Progress
              </p>
            </div>

            {/* Right: Project Info & Next Task */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                  Project Details
                </p>
                <h2 className="text-2xl font-bold text-white">TechFlow Consulting</h2>
                <p className="text-sm text-slate-400 mt-1">Technology / SaaS Startup</p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                  Your Next To-Do
                </p>
                {nextIncompleteTask ? (
                  <>
                    <p className="text-sm font-semibold text-white">{nextIncompleteTask.name}</p>
                    <p className="text-xs text-slate-400 mt-1">in {nextIncompleteTask.stepTitle}</p>
                  </>
                ) : (
                  <p className="text-sm text-emerald-400 font-semibold">🎉 All tasks completed!</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Steps Sections */}
        <div className="space-y-4">
          {launchSteps.map((step, index) => {
            const stepProgress = Math.round(
              (step.subsections.filter(s => s.completed).length / step.subsections.length) * 100
            )
            const isExpanded = expandedSteps.includes(step.id)

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden hover:border-sky-400/30 transition"
              >
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.06] transition"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/10">
                      <span className="text-sm font-bold text-sky-400">{step.id}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-sky-400">{stepProgress}%</p>
                      <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-sky-400 transition-all duration-300"
                          style={{ width: `${stepProgress}%` }}
                        />
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-600 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Step Subsections */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/10 bg-white/[0.02]"
                    >
                      <div className="px-6 py-4 space-y-3">
                        {step.subsections.map((subsection, subIndex) => (
                          <motion.div
                            key={subsection.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subIndex * 0.05 }}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                              subsection.completed
                                ? "border-emerald-400/30 bg-emerald-400/5"
                                : "border-white/10 bg-white/[0.03] hover:border-sky-400/20"
                            }`}
                          >
                            <div
                              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                                subsection.completed
                                  ? "border-emerald-400 bg-emerald-400/20"
                                  : "border-white/20 bg-white/5"
                              }`}
                            >
                              {subsection.completed && (
                                <Check className="h-3 w-3 text-emerald-400" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                subsection.completed
                                  ? "text-slate-400 line-through"
                                  : "text-white"
                              }`}
                            >
                              {subsection.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
