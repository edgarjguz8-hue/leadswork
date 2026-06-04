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
  Target,
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
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{launch.name}</h1>
            <span className="text-sm text-muted-foreground capitalize">{launch.industry}</span>
          </div>
          <p className="text-sm text-muted-foreground">{launch.description}</p>
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Overall Progress</h2>
              <span className="text-2xl font-bold text-sky-400">{launch.progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${launch.progress}%` }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="h-full bg-sky-400 rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {launch.steps.filter(s => s.isCompleted).length} of {launch.steps.length} steps completed
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          {/* Current Step - Main Content */}
          <div className="lg:col-span-2">
            {launch.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-card p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      {launch.steps[1]?.title || 'Next Step'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Step {launch.steps[1]?.stepNumber || 1} of 5
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (launch.steps[1] && !expandedSteps.includes(launch.steps[1].stepNumber)) {
                        toggleStepExpansion(launch.steps[1].stepNumber)
                      }
                    }}
                    className="rounded-md bg-sky-400 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-sky-500 transition flex items-center gap-2"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Progress for Current Step */}
                {launch.steps[1] && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Step Progress</span>
                      <span className="text-xs font-medium text-sky-400">{launch.steps[1].progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${launch.steps[1].progress}%` }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        className="h-full bg-sky-400 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Step Description */}
                {launch.steps[1]?.description && (
                  <p className="text-sm text-muted-foreground mb-6">{launch.steps[1].description}</p>
                )}

                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">All Steps</h3>
                  <div className="space-y-2">
                    {launch.steps.map((step) => (
                      <motion.button
                        key={step.id}
                        whileHover={{ x: 4 }}
                        onClick={() => toggleStepExpansion(step.stepNumber)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-secondary transition group"
                      >
                        <div className="flex-shrink-0">
                          {step.isCompleted ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                              <Check className="h-3 w-3 text-background" />
                            </div>
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-secondary">
                              <span className="text-xs font-semibold text-muted-foreground">{step.stepNumber}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${step.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {step.title}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* AI Assistant Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setAiAssistantActive(true)}
              className="w-full rounded-lg border border-border bg-card p-6 text-left hover:border-sky-400/30 hover:bg-sky-400/5 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 mb-4">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Get guidance and answers for your business.</p>
            </motion.button>

            {/* Business Snapshot Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="w-full rounded-lg border border-border bg-card p-6 text-left hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500/20 mb-4">
                <Target className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Business Snapshot</h3>
              <p className="text-xs text-muted-foreground">View key metrics and details.</p>
            </motion.button>
          </div>
        </div>

        {/* Steps Details Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground mb-4">Step Details</h3>

          {launch.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-lg border border-border bg-card overflow-hidden hover:border-sky-400/30 transition"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStepExpansion(step.stepNumber)}
                className="w-full p-4 text-left hover:bg-secondary/50 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                    {step.isCompleted ? (
                      <Check className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <span className="text-xs font-bold text-sky-400">{step.stepNumber}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <h4 className={`text-sm font-semibold ${step.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-muted-foreground transition ${
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
                  className="border-t border-border p-4 space-y-3 bg-secondary/30"
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

                      {/* Subtasks List */}
                      <div className="space-y-2">
                        {step.subtasks.map((subtask) => (
                          <motion.button
                            key={subtask.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => completeSubtask(step.id, subtask.id)}
                            className={`w-full flex items-start gap-3 p-3 rounded-md border transition ${
                              subtask.isCompleted
                                ? 'border-emerald-500/20 bg-emerald-500/5 text-muted-foreground'
                                : 'border-border bg-background hover:bg-secondary/50'
                            }`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {subtask.isCompleted ? (
                                <div className="flex h-5 w-5 items-center justify-center rounded border border-emerald-500 bg-emerald-500">
                                  <Check className="h-3 w-3 text-background" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded border border-border bg-secondary" />
                              )}
                            </div>
                            <div className="text-left flex-1">
                              <p className={`text-sm font-medium ${subtask.isCompleted ? 'line-through' : ''}`}>
                                {subtask.title}
                              </p>
                              {subtask.aiAssistanceType && (
                                <p className="text-xs text-sky-400 mt-1">AI {subtask.aiAssistanceType}</p>
                              )}
                            </div>
                          </motion.button>
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

      {/* Business Assistant Chat */}
      {aiAssistantActive && (
        <div className="mt-12">
          <BusinessAssistant
            launchId={String(params.id)}
            businessFoundation={businessFoundation}
          />
        </div>
      )}

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
