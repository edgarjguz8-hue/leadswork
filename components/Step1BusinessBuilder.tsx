'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Zap, ChevronRight, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'

interface Step1Props {
  launchName: string
  launchId: string
  onComplete: (businessData: any) => void
}

type Step1Stage = 'choice' | 'idea-input' | 'category-select' | 'ideas-display' | 'business-foundation'

interface BusinessIdea {
  name: string
  description: string
  targetAudience: string
  revenueModel: string
}

interface BusinessFoundation {
  businessName: string
  recommendedDomain: string
  description: string
  whatYouSell: string
  whoYouServe: string
  revenueModel: string
  simplePricing: string
  businessPlanSummary: string
}

const categories = [
  'Service business',
  'Online business',
  'Local business',
  'Product business',
  'Professional business',
  'Not sure',
]

export function Step1BusinessBuilder({ launchName, launchId, onComplete }: Step1Props) {
  const [stage, setStage] = useState<Step1Stage>('choice')
  const [ideaText, setIdeaText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [generatedIdeas, setGeneratedIdeas] = useState<BusinessIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [businessFoundation, setBusinessFoundation] = useState<BusinessFoundation | null>(null)
  const [savingData, setSavingData] = useState(false)

  const generateIdeas = async () => {
    if (!selectedCategory) return

    setLoading(true)
    try {
      const response = await fetch('/api/launch/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          launchName,
        }),
      })

      const data = await response.json()
      if (data.ideas) {
        setGeneratedIdeas(data.ideas)
        setStage('ideas-display')
      }
    } catch (error) {
      console.error('[v0] Failed to generate ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateBusinessFoundation = async (idea?: BusinessIdea) => {
    setLoading(true)
    try {
      const ideaInput = idea
        ? `Business: ${idea.name} - ${idea.description}`
        : ideaText

      const response = await fetch('/api/launch/generate-foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaDescription: ideaInput,
          launchId,
        }),
      })

      const data = await response.json()
      if (data.foundation) {
        setBusinessFoundation(data.foundation)
        setStage('business-foundation')
      }
    } catch (error) {
      console.error('[v0] Failed to generate business foundation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndContinue = async () => {
    if (!businessFoundation) return

    setSavingData(true)
    try {
      const response = await fetch('/api/launch/update-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launchId,
          businessData: {
            businessName: businessFoundation.businessName,
            description: businessFoundation.description,
            businessType: selectedCategory,
            whatYouSell: businessFoundation.whatYouSell,
            whoYouServe: businessFoundation.whoYouServe,
            revenueModel: businessFoundation.revenueModel,
          },
        }),
      })

      if (response.ok) {
        console.log('[v0] Step 1 data saved successfully')
        onComplete(businessFoundation)
      } else {
        console.error('[v0] Failed to save Step 1 data:', response.status)
      }
    } catch (error) {
      console.error('[v0] Error saving Step 1 data:', error)
    } finally {
      setSavingData(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Choice Stage */}
      {stage === 'choice' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              What kind of business do you want to create?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Already have an idea */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStage('idea-input')}
              className="relative group overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-8 text-left hover:border-sky-400/50 hover:bg-white/[0.06] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <Lightbulb className="h-8 w-8 text-sky-400 flex-shrink-0" />
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-sky-400 transition" />
                </div>
                <h4 className="text-lg font-semibold text-white">I already have an idea</h4>
                <p className="text-sm text-slate-400 mt-1">I know what I want to build</p>
              </div>
            </motion.button>

            {/* Option 2: Need ideas */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStage('category-select')}
              className="relative group overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-8 text-left hover:border-sky-400/50 hover:bg-white/[0.06] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <Zap className="h-8 w-8 text-sky-400 flex-shrink-0" />
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-sky-400 transition" />
                </div>
                <h4 className="text-lg font-semibold text-white">Help me create an idea</h4>
                <p className="text-sm text-slate-400 mt-1">I need ideas and inspiration</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Idea Input Stage */}
      {stage === 'idea-input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => setStage('choice')}
            className="text-sm text-slate-400 hover:text-white transition mb-4 flex items-center gap-1"
          >
            ← Back
          </button>

          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Describe your idea in one sentence.
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Give us a brief overview of your business concept.
            </p>

            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Ex: An AI-powered personal trainer app that creates custom workout plans based on user preferences..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400/50 focus:bg-white/[0.06] focus:outline-none transition resize-none"
              rows={4}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateBusinessFoundation()}
              disabled={!ideaText.trim() || loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-2 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Build My Idea
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Category Select Stage */}
      {stage === 'category-select' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => setStage('choice')}
            className="text-sm text-slate-400 hover:text-white transition mb-4 flex items-center gap-1"
          >
            ← Back
          </button>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              What type of business interests you?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg border px-4 py-3 text-left font-medium transition ${
                    selectedCategory === category
                      ? 'border-sky-400 bg-sky-400/10 text-sky-400'
                      : 'border-white/10 bg-white/[0.03] text-white hover:border-sky-400/50'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateIdeas}
              disabled={!selectedCategory || loading}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-2 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  Generate Ideas
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Ideas Display Stage */}
      {stage === 'ideas-display' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => {
              setSelectedCategory(null)
              setGeneratedIdeas([])
              setStage('category-select')
            }}
            className="text-sm text-slate-400 hover:text-white transition mb-4 flex items-center gap-1"
          >
            ← Back
          </button>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Here are 3 business ideas based on {selectedCategory}
            </h3>

            <div className="space-y-4">
              {generatedIdeas.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-6 hover:border-sky-400/30 hover:bg-white/[0.06] transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{idea.name}</h4>
                      <p className="text-sm text-slate-400 mt-1">{idea.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide">Serves</p>
                      <p className="text-white">{idea.targetAudience}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide">Revenue Model</p>
                      <p className="text-white">{idea.revenueModel}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generateBusinessFoundation(idea)}
                    disabled={loading}
                    className="w-full rounded-lg border border-sky-400 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-400 hover:bg-sky-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'Generating...' : 'Use This Idea'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Business Foundation Stage */}
      {stage === 'business-foundation' && businessFoundation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Your Business Foundation</h3>

            <div className="space-y-4">
              {[
                { label: 'Business Name', value: businessFoundation.businessName },
                { label: 'Recommended Domain', value: businessFoundation.recommendedDomain },
                { label: 'Description', value: businessFoundation.description },
                { label: 'What You Sell', value: businessFoundation.whatYouSell },
                { label: 'Who You Serve', value: businessFoundation.whoYouServe },
                { label: 'Revenue Model', value: businessFoundation.revenueModel },
                { label: 'Simple Pricing', value: businessFoundation.simplePricing },
                { label: 'Business Plan Summary', value: businessFoundation.businessPlanSummary },
              ].map((item, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    {item.label}
                  </p>
                  <p className="text-white leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAndContinue}
              disabled={savingData}
              className="mt-8 w-full rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {savingData ? 'Saving...' : 'Continue to Next Step'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
