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
import { Step2BrandBuilder } from '@/components/Step2BrandBuilder'
import { Step3ServiceBuilder } from '@/components/Step3ServiceBuilder'
import { Step4WebsiteBuilder } from '@/components/Step4WebsiteBuilder'
import { Step5LaunchStrategy } from '@/components/Step5LaunchStrategy'
import { BusinessAssistant } from '@/components/BusinessAssistant'
import { BusinessAssets } from '@/components/BusinessAssets'

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
  status: string
  isApproved: boolean
  steps: Step[]
  assets?: Array<{
    id: string
    type: string
    title: string
    content?: string
    isApproved: boolean
    lastUpdatedAt: string
  }>
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
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [assetsLoading, setAssetsLoading] = useState(false)

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
      
      const launchId = params.id as string
      console.log('[v0] Fetching launch:', launchId)
      
      // Try to fetch from database
      const response = await fetch(`/api/launch/${launchId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Launch fetched from database:', data.id)
        setLaunch(data)
        
        // Fetch assets for this launch
        fetchAssets(launchId)
        setLoading(false)
        return
      } else {
        console.warn('[v0] Failed to fetch from database:', response.status)
      }
    } catch (error) {
      console.warn('[v0] Error fetching from database:', error)
    }

    // Fallback to localStorage
    try {
      const launchId = params.id as string
      const localLaunch = localStorage.getItem(`launch-${launchId}`)
      
      if (localLaunch) {
        const data = JSON.parse(localLaunch)
        console.log('[v0] Launch loaded from localStorage:', data.id)
        setLaunch(data)
        setLoading(false)
        return
      }
    } catch (error) {
      console.warn('[v0] Error loading from localStorage:', error)
    }

    // If neither database nor localStorage have the launch, show error with option to create new
    console.error('[v0] Launch not found in database or localStorage')
    setError('Launch not found')
    setLoading(false)
  }

  const fetchAssets = async (launchId: string) => {
    try {
      setAssetsLoading(true)
      const response = await fetch(`/api/launch/${launchId}/asset`)
      
      if (response.ok) {
        const assets = await response.json()
        console.log('[v0] Assets fetched:', assets.length)
        setLaunch(prev => prev ? { ...prev, assets } : null)
      } else {
        console.error('[v0] Failed to fetch assets')
      }
    } catch (error) {
      console.error('[v0] Error fetching assets:', error)
    } finally {
      setAssetsLoading(false)
    }
  }

  const saveLaunch = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/launch/${params.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save' }),
      })

      if (response.ok) {
        setSaveMessage('Progress saved successfully!')
        setTimeout(() => setSaveMessage(null), 2000)
      } else {
        console.error('[v0] Failed to save launch')
        setSaveMessage('Failed to save progress')
      }
    } catch (error) {
      console.error('[v0] Error saving launch:', error)
      setSaveMessage('Error saving progress')
    } finally {
      setSaving(false)
    }
  }

  const approveLaunch = async () => {
    try {
      setApproving(true)
      const response = await fetch(`/api/launch/${params.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (response.ok) {
        setSaveMessage('Launch approved!')
        setTimeout(() => setSaveMessage(null), 2000)
        await fetchLaunch()
      } else {
        console.error('[v0] Failed to approve launch')
        setSaveMessage('Failed to approve launch')
      }
    } catch (error) {
      console.error('[v0] Error approving launch:', error)
      setSaveMessage('Error approving launch')
    } finally {
      setApproving(false)
    }
  }

  const completeLaunch = async () => {
    try {
      setCompleting(true)
      const response = await fetch(`/api/launch/${params.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      if (response.ok) {
        setSaveMessage('Launch marked as complete and launched!')
        setTimeout(() => setSaveMessage(null), 2000)
        await fetchLaunch()
      } else {
        console.error('[v0] Failed to complete launch')
        setSaveMessage('Failed to complete launch')
      }
    } catch (error) {
      console.error('[v0] Error completing launch:', error)
      setSaveMessage('Error completing launch')
    } finally {
      setCompleting(false)
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
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <motion.div className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-foreground truncate">{launch.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{launch.industry || 'Business Launch'}</p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-md ${
                    saveMessage.includes('successfully') || saveMessage.includes('approved')
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {saveMessage}
                </motion.div>
              )}
              <button
                onClick={saveLaunch}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </button>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center min-h-[600px]"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="h-12 w-12 rounded-full border-2 border-border border-t-accent mx-auto mb-4"
              />
              <p className="text-sm text-muted-foreground">Loading your launch...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center"
          >
            <p className="text-sm text-destructive font-medium mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start New Launch
            </button>
          </motion.div>
        )}

        {launch && (
          <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-xs font-medium text-muted-foreground mb-2">PROGRESS</p>
                <p className="text-3xl font-bold text-foreground">{launch.progress}%</p>
                <p className="text-xs text-muted-foreground mt-2">{launch.steps.filter(s => s.isCompleted).length}/{launch.steps.length} steps</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-xs font-medium text-muted-foreground mb-2">STATUS</p>
                <p className="text-lg font-semibold text-foreground capitalize">{launch.status}</p>
                <p className="text-xs text-muted-foreground mt-2">{launch.isApproved ? 'Approved' : 'In Progress'}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-xs font-medium text-muted-foreground mb-2">NEXT STEP</p>
                <p className="text-lg font-semibold text-foreground">{launch.steps.find(s => !s.isCompleted)?.title || 'Complete'}</p>
                <p className="text-xs text-muted-foreground mt-2">Keep building</p>
              </motion.div>
            </div>

            {/* Steps Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="border border-border rounded-lg bg-card overflow-hidden"
            >
              <div className="border-b border-border bg-muted/30 px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Launch Steps</h2>
              </div>

              <div className="divide-y divide-border">
                {launch.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => toggleStepExpansion(step.stepNumber)}
                      className="w-full px-6 py-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                          step.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : index < 2
                              ? 'bg-accent/20 text-accent border border-accent/30'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {step.isCompleted ? <Check className="h-5 w-5" /> : step.stepNumber}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-sm font-semibold transition-colors ${
                            step.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}>
                            {step.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                          expandedSteps.includes(step.stepNumber) ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {expandedSteps.includes(step.stepNumber) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border px-6 py-4 bg-muted/20"
                      >
                        {/* Step Content Rendering */}
                        {step.stepNumber === 1 ? (
                          <Step1BusinessBuilder
                            launchName={launch?.name || ''}
                            launchId={launch?.id || ''}
                            onComplete={() => fetchLaunch()}
                          />
                        ) : step.stepNumber === 2 ? (
                          <Step2BrandBuilder
                            launchName={launch?.name || ''}
                            launchId={launch?.id || ''}
                            onComplete={() => fetchLaunch()}
                          />
                        ) : step.stepNumber === 3 ? (
                          <Step3ServiceBuilder
                            launchName={launch?.name || ''}
                            launchId={launch?.id || ''}
                            onComplete={() => fetchLaunch()}
                          />
                        ) : step.stepNumber === 4 ? (
                          <Step4WebsiteBuilder
                            launchName={launch?.name || ''}
                            launchId={launch?.id || ''}
                            onComplete={() => fetchLaunch()}
                          />
                        ) : step.stepNumber === 5 ? (
                          <Step5LaunchStrategy
                            launchName={launch?.name || ''}
                            launchId={launch?.id || ''}
                            onComplete={() => fetchLaunch()}
                          />
                        ) : null}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-border bg-card p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Launch?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLaunch}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
