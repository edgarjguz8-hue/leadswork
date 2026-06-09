'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, X, Edit2, Eye, Save, RefreshCw, CheckCircle2 } from 'lucide-react'

interface LaunchStrategy {
  checklist: {
    task: string
    status: 'pending' | 'in_progress' | 'completed'
    dueDate: string
  }[]
  marketingPlan: string
  firstCustomerRoadmap: string
  thirtyDayPlan: string
}

interface Step5LaunchStrategyProps {
  launchId: string
  launchName: string
  onComplete: (strategy: LaunchStrategy) => void
}

export function Step5LaunchStrategy({
  launchId,
  launchName,
  onComplete,
}: Step5LaunchStrategyProps) {
  const [stage, setStage] = useState<'idle' | 'generating' | 'reviewing' | 'preview' | 'completed'>('idle')
  const [strategy, setStrategy] = useState<LaunchStrategy>({
    checklist: [],
    marketingPlan: '',
    firstCustomerRoadmap: '',
    thirtyDayPlan: '',
  })
  const [editingField, setEditingField] = useState<keyof Omit<LaunchStrategy, 'checklist'> | null>(null)
  const [editValue, setEditValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [completionStatus, setCompletionStatus] = useState({
    checklist: 0,
    marketingPlan: false,
    firstCustomerRoadmap: false,
    thirtyDayPlan: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem(`step5-${launchId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.strategy) {
          setStrategy(parsed.strategy)
          calculateCompletionStatus(parsed.strategy)
          setStage('reviewing')
        }
      } catch (error) {
        console.error('[v0] Error loading saved strategy data:', error)
      }
    }
  }, [launchId])

  const calculateCompletionStatus = (strat: LaunchStrategy) => {
    const checklistCompletion = strat.checklist.length > 0 
      ? Math.round((strat.checklist.filter(t => t.status === 'completed').length / strat.checklist.length) * 100)
      : 0
    
    setCompletionStatus({
      checklist: checklistCompletion,
      marketingPlan: strat.marketingPlan.length > 50,
      firstCustomerRoadmap: strat.firstCustomerRoadmap.length > 50,
      thirtyDayPlan: strat.thirtyDayPlan.length > 50,
    })
  }

  const handleGenerateStrategy = async () => {
    try {
      setStage('generating')
      setErrorMessage(null)

      const response = await fetch('/api/launch/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchName, launchId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate strategy')
      }

      const data = await response.json()
      setStrategy(data.strategy)
      calculateCompletionStatus(data.strategy)

      localStorage.setItem(`step5-${launchId}`, JSON.stringify({
        stage: 'reviewing',
        strategy: data.strategy,
      }))

      setStage('reviewing')
    } catch (error) {
      console.error('[v0] Error generating strategy:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate strategy')
      setStage('idle')
    }
  }

  const handleEditField = (field: keyof Omit<LaunchStrategy, 'checklist'>) => {
    setEditingField(field)
    setEditValue(strategy[field])
  }

  const handleSaveFieldEdit = () => {
    if (editingField) {
      const updated = { ...strategy, [editingField]: editValue }
      setStrategy(updated)
      calculateCompletionStatus(updated)
      localStorage.setItem(`step5-${launchId}`, JSON.stringify({
        stage: 'reviewing',
        strategy: updated,
      }))
      setEditingField(null)
    }
  }

  const handleToggleChecklistItem = (index: number) => {
    const newChecklist = [...strategy.checklist]
    const currentStatus = newChecklist[index].status
    newChecklist[index].status = currentStatus === 'completed' ? 'pending' : 'completed'
    
    const updated = { ...strategy, checklist: newChecklist }
    setStrategy(updated)
    calculateCompletionStatus(updated)
    
    localStorage.setItem(`step5-${launchId}`, JSON.stringify({
      stage: 'reviewing',
      strategy: updated,
    }))
  }

  const handleApproveStrategy = async () => {
    try {
      setSaving(true)

      const response = await fetch(`/api/launch/${launchId}/asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'launch_strategy',
          title: 'Launch Strategy',
          content: JSON.stringify(strategy),
          isApproved: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save strategy to assets')
      }

      localStorage.setItem(`step5-${launchId}`, JSON.stringify({
        stage: 'completed',
        strategy,
        approvedAt: new Date().toISOString(),
      }))

      // Mark Step 5 as complete
      try {
        const stepResponse = await fetch(`/api/launch/${launchId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stepNumber: 5,
            isCompleted: true,
          }),
        })
        if (stepResponse.ok) {
          console.log('[v0] Step 5 marked as complete')
        }
      } catch (stepError) {
        console.error('[v0] Failed to mark step as complete:', stepError)
      }

      setStage('completed')
      onComplete(strategy)
    } catch (error) {
      console.error('[v0] Error approving strategy:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save strategy')
    } finally {
      setSaving(false)
    }
  }

  if (stage === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {errorMessage && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        )}
        <p className="text-sm text-slate-400">
          Generate a comprehensive launch strategy including checklist, marketing plan, customer roadmap, and 30-day action plan.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleGenerateStrategy}
          className="w-full rounded-lg bg-sky-500 px-4 py-3 font-semibold text-white hover:bg-sky-600 transition flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate Strategy
        </motion.button>
      </motion.div>
    )
  }

  if (stage === 'generating') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20">
            <Sparkles className="h-6 w-6 text-sky-400 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-300">Generating launch strategy...</p>
        </div>
      </motion.div>
    )
  }

  if (stage === 'completed') {
    const completionPercentage = Math.round(
      (Object.values(completionStatus).filter(v => typeof v === 'boolean' ? v : v > 0).length / 4) * 100
    )

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-400">Launch Strategy Approved</p>
            <p className="text-xs text-emerald-300">Strategy saved to Business Assets</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 space-y-4">
          <h3 className="font-semibold text-slate-300">Completion Status: {completionPercentage}%</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Launch Checklist</span>
              <span className={completionStatus.checklist > 0 ? 'text-emerald-400' : 'text-slate-500'}>{completionStatus.checklist}%</span>
            </div>
            <div className="w-full bg-slate-700/30 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${completionStatus.checklist}%` }} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/20">
              <CheckCircle2 className={`h-4 w-4 ${completionStatus.marketingPlan ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-slate-400">Marketing Plan</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/20">
              <CheckCircle2 className={`h-4 w-4 ${completionStatus.firstCustomerRoadmap ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-slate-400">Customer Roadmap</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/20">
              <CheckCircle2 className={`h-4 w-4 ${completionStatus.thirtyDayPlan ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-slate-400">30-Day Plan</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {errorMessage && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-300">Launch Checklist</h3>
          <span className="text-xs text-slate-500">{strategy.checklist.filter(t => t.status === 'completed').length}/{strategy.checklist.length}</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {strategy.checklist.map((item, index) => (
            <button
              key={index}
              onClick={() => handleToggleChecklistItem(index)}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 hover:bg-slate-700/30 transition text-left"
            >
              <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border flex items-center justify-center ${
                item.status === 'completed' 
                  ? 'border-emerald-500 bg-emerald-500' 
                  : 'border-slate-600/50 bg-slate-700/30'
              }`}>
                {item.status === 'completed' && <Check className="h-3 w-3 text-slate-900" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${item.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>{item.task}</p>
                <p className="text-xs text-slate-500">{item.dueDate}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'marketingPlan' as const, label: 'Marketing Plan' },
          { key: 'firstCustomerRoadmap' as const, label: 'First Customer Roadmap' },
          { key: 'thirtyDayPlan' as const, label: '30-Day Action Plan' },
        ].map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-300">{label}</p>
              <button
                onClick={() => handleEditField(key)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/[0.05] transition"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>

            {editingField === key ? (
              <div className="space-y-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full h-32 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveFieldEdit}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition text-sm flex items-center justify-center gap-2"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 transition text-sm flex items-center justify-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300 whitespace-pre-wrap line-clamp-4">{strategy[key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setStage('idle')}
          className="flex-1 rounded-lg border border-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.05] transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleApproveStrategy}
          disabled={saving}
          className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          Approve Strategy
        </motion.button>
      </div>
    </motion.div>
  )
}
