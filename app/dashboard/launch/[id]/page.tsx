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
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AIToolsGrid } from '@/components/AIToolsGrid'
import { BusinessFoundation } from '@/components/business-foundation'

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
  foundationData?: {
    businessName: string
    whatYouSell: string
    whoYouServe: string
    revenueModel: string
    recommendedPricing: string
    missionStatement: string
    visionStatement: string
    elevatorPitch: string
  }
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
  const [foundationApproved, setFoundationApproved] = useState(false)

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

  const handleApproveFoundation = async () => {
    try {
      setLoading(true)
      // Mark Step 1 as complete
      if (launch && launch.steps.length > 0) {
        const step1 = launch.steps[0]
        // In a real scenario, we'd call an API to mark the step as complete
        // For now, we'll just update the UI state
        setFoundationApproved(true)
        await fetchLaunch()
      }
    } catch (error) {
      console.error('Failed to approve foundation:', error)
    } finally {
      setLoading(false)
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
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* WHOOP-Style Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur"
        >
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Progress Circle */}
            <div className="flex flex-col items-center justify-center lg:items-start">
              <div className="relative h-40 w-40">
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
              <div className="mt-6 text-center lg:text-left">
                <p className="text-sm font-medium text-white">{launch.name}</p>
                <p className="text-xs text-slate-400 capitalize">{launch.industry}</p>
              </div>
            </div>

            {/* Next To-Do */}
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                Your Next To-Do
              </p>
              {nextTodo ? (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-sky-400/30 bg-sky-400/10 p-6"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-6 w-6 text-sky-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{nextTodo.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Step {launch.steps.find(s => s.subtasks.find(st => st.id === nextTodo.id))?.stepNumber}: {nextTodo.stepTitle}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            const step = launch.steps.find(s =>
                              s.subtasks.some(st => st.id === nextTodo.id)
                            )
                            if (step && !expandedSteps.includes(step.stepNumber)) {
                              toggleStepExpansion(step.stepNumber)
                            }
                          }}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-[#0a1220] hover:bg-sky-300 transition"
                        >
                          Get Started <ChevronRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Assistant Recommendation */}
                  {nextTodo.aiAssistanceType && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setAiAssistantActive(true)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-sky-400/30 hover:bg-white/[0.06] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-sky-400" />
                          <div>
                            <p className="text-sm font-medium text-white">AI Assistant</p>
                            <p className="text-xs text-slate-400">Get personalized guidance</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                      </div>
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-6">
                  <p className="text-white font-medium">🎉 All tasks completed!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Your business is fully launched and ready to scale.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Steps Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-6">Your Launch Steps</h2>

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

              {/* Step Content */}
              {expandedSteps.includes(step.stepNumber) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 p-6"
                >
                  {/* Step 1: Business Foundation */}
                  {step.stepNumber === 1 ? (
                    <BusinessFoundation
                      data={launch.foundationData}
                      isApproved={step.isCompleted}
                      isLoading={loading}
                      onApprove={handleApproveFoundation}
                      onRegenerate={() => {
                        // In a real app, this would call an API to regenerate
                        console.log('[v0] Regenerating foundation')
                      }}
                      onEditIdea={() => {
                        // In a real app, this would allow editing the business idea
                        console.log('[v0] Editing business idea')
                      }}
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
                      <div className="border-t border-white/10 my-6" />

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
      </div>
    </div>
  )
}
