'use client'

import React from 'react'
import { Check, Circle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Step {
  stepNumber: number
  title: string
  isCompleted: boolean
  progress: number
}

interface BusinessProgressOverviewProps {
  steps: Step[]
  overallProgress: number
}

export function BusinessProgressOverview({ steps, overallProgress }: BusinessProgressOverviewProps) {
  const getStatusLabel = (step: Step) => {
    if (step.isCompleted) return 'Complete'
    if (step.progress > 0) return 'In Progress'
    return 'Not Started'
  }

  const getStatusColor = (step: Step) => {
    if (step.isCompleted) return 'bg-emerald-400/20 border-emerald-400/50 text-emerald-400'
    if (step.progress > 0) return 'bg-sky-400/20 border-sky-400/50 text-sky-400'
    return 'bg-slate-400/20 border-slate-400/50 text-slate-400'
  }

  const stepNames = [
    'Business Foundation',
    'Brand & Website',
    'Systems & Operations',
    'Customers & Marketing',
    'Launch',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Business Build Progress</h2>
        <p className="text-sm text-slate-400">Track your progress across all steps of building your business.</p>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Overall Progress</span>
          <span className="text-sm font-semibold text-white">{overallProgress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-sky-400 to-sky-500"
          />
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.stepNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border p-4 transition ${getStatusColor(step)}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 mt-0.5">
                {step.isCompleted ? (
                  <div className="h-6 w-6 rounded-full bg-emerald-400 flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#0a1220]" />
                  </div>
                ) : (
                  <Circle className={`h-6 w-6 ${step.progress > 0 ? 'text-sky-400' : 'text-slate-400'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">Step {step.stepNumber}</p>
                <p className="text-xs text-current opacity-75 mt-1 leading-tight">
                  {stepNames[step.stepNumber - 1] || step.title}
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(step).replace('text-', 'border-').replace('bg-', 'border-')}`}>
              {getStatusLabel(step)}
            </div>

            {/* Progress Bar */}
            {step.progress > 0 && !step.isCompleted && (
              <div className="mt-3 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${step.progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-current"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
