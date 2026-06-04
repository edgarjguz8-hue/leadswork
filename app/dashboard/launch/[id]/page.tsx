'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import {
  ArrowLeft,
  LogOut,
  ChevronRight,
  Sparkles,
  Check,
  Lock,
  Trash2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AIToolsGrid } from '@/components/AIToolsGrid'
import { Step1BusinessBuilder } from '@/components/Step1BusinessBuilder'
import { BusinessAssistant } from '@/components/BusinessAssistant'

interface Step {
  id: string
  stepNumber: number
  title: string
  description: string
  isCompleted: boolean
  progress: number
  subtasks: Subtask[]
}

interface Subtask {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  aiAssistanceType?: string
  order: number
}

interface Launch {
  id: string
  name: string
  industry: string
  progress: number
  description: string
  steps: Step[]
}

// Map step numbers to section keys for AI tools
const stepToSection = {
  1: 'foundation' as const,
  2: 'market' as const,
  3: 'brand' as const,
  4: 'sales' as const,
  5: 'operations' as const,
}

export default function LaunchDashboard() {
  const router = useRouter()
  const params = useParams()
  const { data: session, isPending } = useSession()
  const [launch, setLaunch] = useState<Launch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1])
  const [aiAssistantActive, setAiAssistantActive] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [businessFoundation, setBusinessFoundation] = useState<any>(null)

  useEffect(() => {
    if (!session?.user) {
      router.push('/sign-in')
      return
    }

    if (params.id) {
      fetchLaunch()
    }
  }, [session, params.id])

  const fetchLaunch = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const launchId = params.id
      console.log('[v0] Fetching launch:', launchId)
      
      const response = await fetch(`/api/launch/${launchId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Launch fetched successfully:', data.id)
        setLaunch(data)
      } else {
        const errorData = await response.json()
        console.error('[v0] Failed to fetch launch:', response.status, errorData)
        setError(`Failed to load launch: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('[v0] Error fetching launch:', error)
      setError('Error loading launch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getNextTodo = () => {
    if (!launch) return null
    for (const step of launch.steps) {
      for (const subtask of step.subtasks) {
        if (!subtask.isCompleted) {
          return { ...subtask, stepTitle: step.title }
        }
      }
    }
    return null
  }

  const toggleStepExpansion = (stepNumber: number) => {
    setExpandedSteps(prev =>
      prev.includes(stepNumber)
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber]
    )
  }

  const completeSubtask = async (stepId: string, subtaskId: string) => {
    try {
      const response = await fetch(`/api/launch/${params.id}/subtask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, subtaskId, isCompleted: true }),
      })

      if (response.ok) {
        await fetchLaunch()
      }
    } catch (error) {
      console.error('Failed to complete subtask:', error)
    }
  }

  const handleDeleteLaunch = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/launch/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('[v0] Launch deleted successfully')
        router.push('/dashboard/launch')
      } else {
        console.error('[v0] Failed to delete launch:', response.status)
        alert('Failed to delete launch. Please try again.')
      }
    } catch (error) {
      console.error('[v0] Error deleting launch:', error)
      alert('Error deleting launch. Please try again.')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-center">
          <p className="text-slate-400">Loading your launch...</p>
        </div>
      </div>
    )
  }

  if (error || !launch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-white mb-2">Launch not found</p>
          <p className="text-slate-400 mb-6">{error || 'The launch could not be loaded.'}</p>
          <button
            onClick={() => router.push('/dashboard/launch')}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-2 text-sm font-medium text-[#0a1220] hover:bg-sky-300 transition"
          >
            Start New Launch
          </button>
        </div>
      </div>
    )
  }

  const nextTodo = getNextTodo()

  return (
    <div className="min-h-screen bg-[#0a1220]">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.02] backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">{launch.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
              title="Delete launch"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* New Dashboard Layout */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left Sidebar - Progress */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur h-full"
            >
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10">
                <Sparkles className="h-8 w-8 text-sky-400" />
              </div>

              {/* Name and Category */}
              <h3 className="text-xl font-semibold text-white mb-1">{launch.name}</h3>
              <p className="text-sm text-slate-400 mb-8 capitalize">{launch.industry}</p>

              {/* Progress Circle */}
              <div className="mb-8">
                <div className="relative h-48 w-48">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 160 160">
                    {/* Background circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 70 * (1 - launch.progress / 100),
                      }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-sky-400">{launch.progress}%</p>
                      <p className="text-xs text-slate-400 mt-1">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content - Steps and Checklist */}
          <div className="lg:col-span-3 space-y-8">
            {/* Current Step Card */}
            {launch.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-400/10">
                        <Sparkles className="h-6 w-6 text-sky-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-white">{launch.steps[1]?.title || 'Next Step'}</h2>
                        <p className="text-sm text-slate-400">Step {launch.steps[1]?.stepNumber || 1} of 5</p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (launch.steps[1] && !expandedSteps.includes(launch.steps[1].stepNumber)) {
                        toggleStepExpansion(launch.steps[1].stepNumber)
                      }
                    }}
                    className="rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 transition flex items-center gap-2"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Checklist */}
                <div className="mt-8 space-y-3">
                  {launch.steps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      {step.isCompleted ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400">
                          <Check className="h-4 w-4 text-[#0a1220]" />
                        </div>
                      ) : idx === 1 ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-400/10">
                          <div className="h-2 w-2 rounded-full bg-sky-400" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-slate-600 bg-transparent" />
                      )}
                      <span className={`text-sm font-medium ${step.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {step.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* AI Assistant Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setAiAssistantActive(true)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur text-left hover:border-purple-400/30 hover:bg-purple-400/5 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                <p className="text-sm text-slate-400 mt-2">Get answers and guidance for your business.</p>
              </motion.button>

              {/* Business Snapshot Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur text-left hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
                    <div className="flex gap-1">
                      <div className="h-3 w-1 rounded-full bg-cyan-400" />
                      <div className="h-5 w-1 rounded-full bg-cyan-400" />
                      <div className="h-4 w-1 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white">Business Snapshot</h3>
                <p className="text-sm text-slate-400 mt-2">Key details about your business at a glance.</p>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Steps Section - Expandable Details */}
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-semibold text-white">Step Details</h2>

          {launch.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden hover:border-sky-400/30 transition"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStepExpansion(step.stepNumber)}
                className="w-full p-6 text-left hover:bg-white/[0.06] transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-400/10">
                    {step.isCompleted ? (
                      <Check className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <p className="text-sm font-bold text-sky-400">{step.stepNumber}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${step.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-slate-600 transition ${
                    expandedSteps.includes(step.stepNumber) ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Subtasks */}
              {expandedSteps.includes(step.stepNumber) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 p-6 space-y-6"
                >
                  {/* Step 1: Business Builder */}
                  {step.stepNumber === 1 ? (
                    <Step1BusinessBuilder
                      launchName={launch.name}
                      launchId={launch.id}
                      onComplete={() => fetchLaunch()}
                    />
                  ) : (
                    <>
                      {/* AI Tools Section */}
                      <div>
                        <AIToolsGrid
                          section={stepToSection[step.stepNumber as keyof typeof stepToSection] || 'foundation'}
                          businessContext={`Business: ${launch.name}, Industry: ${launch.industry}, Description: ${launch.description}`}
                          title={`AI Tools for ${step.title}`}
                          showAsButtons={true}
                        />
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10" />

                      {/* Subtasks List */}
                      <div className="space-y-3">
                        {step.subtasks.map((subtask) => (
                          <motion.div
                            key={subtask.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-start gap-3 p-4 rounded-lg border ${
                              subtask.isCompleted
                                ? 'border-emerald-400/20 bg-emerald-400/5'
                                : 'border-white/10 bg-white/[0.02] hover:border-sky-400/20'
                            } transition group cursor-pointer`}
                            onClick={() => completeSubtask(step.id, subtask.id)}
                          >
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className={`flex h-6 w-6 items-center justify-center rounded border flex-shrink-0 mt-0.5 ${
                                subtask.isCompleted
                                  ? 'bg-emerald-400 border-emerald-400'
                                  : 'border-white/20 group-hover:border-sky-400'
                              } transition`}
                            >
                              {subtask.isCompleted && <Check className="h-4 w-4 text-[#0a1220]" />}
                            </motion.div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${subtask.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                                {subtask.title}
                              </p>
                              {subtask.aiAssistanceType && (
                                <p className="text-xs text-sky-400 mt-1">AI {subtask.aiAssistanceType} available</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Business Assistant Chat */}
        {aiAssistantActive && (
          <div className="mt-12">
            <BusinessAssistant
              launchId={String(params.id)}
              businessFoundation={businessFoundation}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-white/10 bg-[#0a1220] p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-lg font-semibold text-white mb-2">Delete Launch?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to delete "{launch.name}"? This action cannot be undone and will delete all progress and data associated with this launch.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/[0.05] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLaunch}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
