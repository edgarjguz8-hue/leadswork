'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react'

interface WizardResponses {
  problem: string
  skills: string
  targetCustomer: string
  solution: string
}

interface IdeaGenerationWizardProps {
  onComplete: (idea: string, responses: WizardResponses) => void
  isLoading?: boolean
}

const stages = [
  {
    id: 'problem',
    title: 'What problem or opportunity excites you?',
    description: 'Think about a challenge you see in the world or an opportunity you want to pursue.',
    placeholder: 'e.g., "Keeping properties clean is time-consuming for busy homeowners"',
  },
  {
    id: 'skills',
    title: 'What skills or expertise do you have?',
    description: 'What are you naturally good at or knowledgeable about?',
    placeholder: 'e.g., "I\'m great with attention to detail and have cleaning experience"',
  },
  {
    id: 'targetCustomer',
    title: 'Who would you help with this?',
    description: 'Describe your ideal customer. Who would benefit most from solving this problem?',
    placeholder: 'e.g., "Busy homeowners and small business owners who need maintenance"',
  },
  {
    id: 'solution',
    title: 'What would you offer them?',
    description: 'How would you solve their problem using your skills?',
    placeholder: 'e.g., "Professional pressure washing and property maintenance services"',
  },
]

export function IdeaGenerationWizard({ onComplete, isLoading = false }: IdeaGenerationWizardProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [responses, setResponses] = useState<WizardResponses>({
    problem: '',
    skills: '',
    targetCustomer: '',
    solution: '',
  })
  const [generatedIdea, setGeneratedIdea] = useState<string | null>(null)

  const stage = stages[currentStage]
  const stageKey = stage.id as keyof WizardResponses

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1)
    } else {
      // Generate idea from responses
      generateIdea()
    }
  }

  const handleBack = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const generateIdea = () => {
    // Synthesize business idea from wizard responses
    const idea = `A business that helps ${responses.targetCustomer} by offering ${responses.solution.toLowerCase()}. Using my skills in ${responses.skills.toLowerCase()}, I'll solve their challenge: ${responses.problem.toLowerCase()}`
    setGeneratedIdea(idea)
  }

  const handleApproveIdea = () => {
    if (generatedIdea) {
      onComplete(generatedIdea, responses)
    }
  }

  const handleEditIdea = () => {
    setGeneratedIdea(null)
    setCurrentStage(0)
    setResponses({
      problem: '',
      skills: '',
      targetCustomer: '',
      solution: '',
    })
  }

  if (generatedIdea) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto"
      >
        {/* Generated Idea Review */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Business Idea</h2>
            <p className="text-slate-400">Review your synthesized business idea below</p>
          </div>

          <div className="rounded-lg border border-sky-400/30 bg-sky-400/10 p-6">
            <p className="text-lg text-white leading-relaxed">{generatedIdea}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <h3 className="font-semibold text-white">Your Answers</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400">Problem/Opportunity:</p>
                <p className="text-white mt-1">{responses.problem}</p>
              </div>
              <div>
                <p className="text-slate-400">Your Skills:</p>
                <p className="text-white mt-1">{responses.skills}</p>
              </div>
              <div>
                <p className="text-slate-400">Target Customer:</p>
                <p className="text-white mt-1">{responses.targetCustomer}</p>
              </div>
              <div>
                <p className="text-slate-400">Solution You'd Offer:</p>
                <p className="text-white mt-1">{responses.solution}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleEditIdea}
              className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
            >
              Edit Answers
            </button>
            <button
              onClick={handleApproveIdea}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              Approve & Continue
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Discover Your Business Idea</h1>
        <p className="text-slate-400">
          Answer a few questions to help define your business concept. LeadsWork will synthesize your responses into a clear business idea.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          {stages.map((s, idx) => (
            <div
              key={s.id}
              className={`h-2 flex-1 rounded-full transition ${
                idx <= currentStage ? 'bg-sky-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Step {currentStage + 1} of {stages.length}
        </p>
      </div>

      {/* Questions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{stage.title}</h2>
            <p className="text-slate-400">{stage.description}</p>
          </div>

          <textarea
            value={responses[stageKey]}
            onChange={(e) =>
              setResponses(prev => ({
                ...prev,
                [stageKey]: e.target.value,
              }))
            }
            placeholder={stage.placeholder}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none transition resize-none"
          />

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              disabled={currentStage === 0}
              className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!responses[stageKey].trim() || isLoading}
              className="flex-1 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {currentStage === stages.length - 1 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Idea
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
