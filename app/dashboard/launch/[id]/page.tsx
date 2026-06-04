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
        {/* Top Section - Launch Summary */}
        <div className="grid gap-8 lg:grid-cols-4 mb-16">
          {/* Left - Project Info & Progress Circle */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm"
            >
              {/* Icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-500/30">
                <Sparkles className="h-7 w-7 text-sky-400" />
              </div>

              {/* Project Name */}
              <h3 className="text-lg font-semibold text-white mb-1">{launch?.name}</h3>
              <p className="text-xs text-slate-400 mb-8 capitalize">{launch?.industry}</p>

              {/* Progress Circle */}
              <div className="mb-8">
                <div className="relative h-48 w-48">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
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
                        strokeDashoffset: 2 * Math.PI * 70 * (1 - (launch?.progress || 0) / 100),
                      }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-sky-400">{launch?.progress}%</p>
                      <p className="text-xs text-slate-400 mt-1">Complete</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{launch?.steps.filter(s => s.isCompleted).length} of {launch?.steps.length} Steps Finished</p>
                <p className="text-xs text-slate-400 mt-1">You're on your way! 🚀</p>
              </div>
            </motion.div>
          </div>

          {/* Center - Current Step & Next Actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Business Plan Card */}
            {launch?.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/20">
                    <Sparkles className="h-6 w-6 text-sky-400" />
                  </div>
                  <span className="text-xs text-slate-400">Step {launch.steps[1]?.stepNumber || 1} of 5</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{launch.steps[1]?.title || 'Next Step'}</h3>
                <p className="text-sm text-slate-400 mb-6">{launch.steps[1]?.description || 'Build your roadmap to success'}</p>

                <div className="space-y-3 mb-6">
                  {launch.steps.slice(0, 3).map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      {step.isCompleted ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                          <Check className="h-4 w-4 text-slate-900" />
                        </div>
                      ) : idx === 1 ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-sky-400">
                          <div className="h-2 w-2 rounded-full bg-sky-400" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-slate-600" />
                      )}
                      <span className={`text-sm ${step.isCompleted ? 'text-slate-400 line-through' : idx === 1 ? 'text-sky-400 font-medium' : 'text-slate-300'}`}>
                        {step.title}
                      </span>
                      {step.isCompleted && <span className="ml-auto text-xs text-emerald-400">Done</span>}
                      {idx === 1 && <span className="ml-auto text-xs text-sky-400">Next</span>}
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 transition flex items-center justify-center gap-2"
                >
                  Continue Building <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Next Recommended Step */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">Next Recommended Step</h4>
                <span className="text-xs text-slate-400">Based on your progress</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700/30 bg-slate-800/20">
                <div>
                  <p className="text-sm font-medium text-white">{launch?.steps[2]?.title || 'Next Step'}</p>
                  <p className="text-xs text-slate-400 mt-1">Est. time: 15 min</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full mt-4 rounded-lg border border-emerald-500/30 px-6 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition"
              >
                Start This Step <ChevronRight className="h-4 w-4 inline ml-2" />
              </motion.button>
            </motion.div>
          </div>

          {/* Right - AI Assistant & Launch Roadmap */}
          <div className="lg:col-span-1 space-y-4">
            {/* AI Assistant Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setAiAssistantActive(true)}
              className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm text-left hover:border-purple-500/30 transition group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 mb-4">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">AI Assistant</h3>
              <p className="text-xs text-slate-400 mb-4">Get personalized guidance</p>
              <p className="text-xs italic text-slate-500">"What should I focus on next to grow my brand?"</p>
            </motion.button>

            {/* Launch Roadmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 mb-4">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Launch Roadmap</h3>
              <p className="text-xs text-slate-400 mb-6">Track all steps to launch</p>

              {/* Step Tracker */}
              <div className="flex items-center justify-between gap-2">
                {[1, 2, 3, 4, 5].map((step, idx) => {
                  const isCompleted = launch?.steps[idx]?.isCompleted
                  const isCurrent = idx === 1
                  return (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs transition ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                              ? 'bg-sky-500 text-white ring-2 ring-sky-400/50'
                              : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : step}
                      </div>
                      <span className={`text-xs font-medium ${isCurrent ? 'text-sky-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {['Idea', 'Plan', 'Brand', 'Setup', 'Launch'][idx]}
                      </span>
                    </div>
                  )
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full mt-6 rounded-lg border border-orange-500/30 px-4 py-2 text-xs font-medium text-orange-400 hover:bg-orange-500/10 transition"
              >
                View All Steps <ChevronRight className="h-3 w-3 inline ml-1" />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Center AI Chatbox Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm"
          >
            <BusinessAssistant
              launchId={String(params.id)}
              businessFoundation={businessFoundation}
            />
          </motion.div>
        </div>


      </div>
      {/* Main Content - Dashboard Container */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-950/80 p-8 shadow-lg"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
            {/* LEFT COLUMN - Progress & Roadmap */}
            <div className="flex flex-col">
              {/* Business Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-500/30">
                    <Sparkles className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{launch?.name}</h2>
                    <p className="text-xs text-slate-400 capitalize">{launch?.industry}</p>
                  </div>
                </div>
              </motion.div>

              {/* Circular Progress Ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative h-40 w-40">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 140 140">
                    {/* Background circle */}
                    <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="6" />
                    {/* Progress circle */}
                    <motion.circle
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 60 * (1 - (launch?.progress || 0) / 100),
                      }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-sky-400">{launch?.progress}%</p>
                    <p className="text-xs text-slate-400 mt-1">Complete</p>
                  </div>
                </div>
              </motion.div>

              {/* Progress Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <p className="text-sm font-semibold text-white">{launch?.steps.filter(s => s.isCompleted).length} of {launch?.steps.length} Steps Finished</p>
                <p className="text-xs text-slate-400 mt-1">You're on your way! 🚀</p>
              </motion.div>

              {/* Divider */}
              <div className="mb-8 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />

              {/* Launch Roadmap Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-6">Launch Roadmap</h3>
                <div className="space-y-4 mb-6">
                  {launch?.steps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                          step.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : idx === 1
                              ? 'bg-sky-500/30 text-sky-400 ring-1 ring-sky-400/50'
                              : 'bg-slate-700/30 text-slate-500'
                        }`}
                      >
                        {step.isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${step.isCompleted ? 'text-slate-400 line-through' : idx === 1 ? 'text-sky-300 font-medium' : 'text-slate-400'}`}>
                          Step {idx + 1}: {step.title}
                        </p>
                      </div>
                      <span className={`text-xs font-medium ${step.isCompleted ? 'text-emerald-400' : idx === 1 ? 'text-sky-400' : 'text-slate-500'}`}>
                        {step.isCompleted ? 'Done' : idx === 1 ? 'Current' : 'Upcoming'}
                      </span>
                    </motion.div>
                  ))}
                </div>

              </motion.div>
            </div>

            {/* RIGHT COLUMN - Actions & Current Step */}
            <div className="flex flex-col">
              {/* Your Next Action Label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Next Action</p>
              </motion.div>

              {/* Main Card - Business Plan */}
              {launch?.steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-6"
                >
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold text-white mb-1">{launch.steps[1]?.title || 'Next Step'}</h3>
                    <p className="text-sm text-slate-400">{launch.steps[1]?.description || 'Build your roadmap to success'}</p>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3 mb-6">
                    {launch.steps.slice(0, 5).map((step, idx) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0">
                          {step.isCompleted ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/50">
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                          ) : idx === 1 ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-500/50">
                              <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-slate-600/50 bg-slate-700/30" />
                          )}
                        </div>
                        <span className={`flex-1 text-sm ${step.isCompleted ? 'text-slate-400 line-through' : idx === 1 ? 'text-white font-medium' : 'text-slate-300'}`}>
                          {step.title}
                        </span>
                        <span className={`text-xs font-medium ${step.isCompleted ? 'text-emerald-400' : idx === 1 ? 'text-sky-400' : 'text-slate-500'}`}>
                          {step.isCompleted ? 'Done' : idx === 1 ? 'Current' : 'Upcoming'}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-600 transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                  >
                    Continue Building
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* Two Cards Row */}
              <div className="grid gap-4 mb-6 md:grid-cols-2">
                {/* AI Assistant Card */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setAiAssistantActive(true)}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 text-left hover:border-purple-500/30 hover:bg-slate-800/60 transition group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 mb-4 group-hover:bg-purple-500/30 transition">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">AI Assistant</h4>
                  <p className="text-sm text-slate-400">Ask questions about pricing, marketing, operations, branding, or business strategy.</p>
                </motion.button>

                {/* Business Snapshot Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 hover:border-teal-500/30 hover:bg-slate-800/60 transition"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 border border-teal-500/30 mb-4">
                    <Target className="h-5 w-5 text-teal-400" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-4">Business Snapshot</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Industry</p>
                      <p className="text-sm text-slate-300 mt-1">{launch?.industry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Current Stage</p>
                      <p className="text-sm text-slate-300 mt-1">Planning</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Launch Goal</p>
                      <p className="text-sm text-slate-300 mt-1">July 2026</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Pro Tip Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg border border-slate-700/50 bg-gradient-to-r from-sky-900/20 to-slate-900/20 px-4 py-3 flex items-center justify-between"
              >
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-sky-400">Pro Tip:</span> Complete your business plan to unlock AI insights, investor-ready documents, and more.
                </p>
                <button className="text-sm font-medium text-sky-400 hover:text-sky-300 transition whitespace-nowrap ml-4">
                  Learn More
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>


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
