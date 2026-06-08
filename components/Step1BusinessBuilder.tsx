'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Zap, ChevronRight, Loader2, Edit2, X, Check } from 'lucide-react'

interface Step1Props {
  launchName: string
  launchId: string
  onComplete: (businessData: any) => void
}

type Step1Stage = 'choice' | 'idea-input' | 'category-select' | 'ideas-display' | 'business-foundation' | 'completed'

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
  problemSolved: string
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
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<BusinessFoundation>>({})

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`step1-${launchId}`)
    if (savedData) {
      const data = JSON.parse(savedData)
      setBusinessFoundation(data.foundation)
      setStage(data.stage || 'choice')
    }
  }, [launchId])

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
        setEditValues(data.foundation)
        setStage('business-foundation')
      }
    } catch (error) {
      console.error('[v0] Failed to generate business foundation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveFoundation = async () => {
    // Apply any edits made before approval
    const finalFoundation = {
      ...businessFoundation,
      ...editValues,
    }
    setBusinessFoundation(finalFoundation)

    // Save to localStorage
    localStorage.setItem(`step1-${launchId}`, JSON.stringify({
      stage: 'completed',
      foundation: finalFoundation,
      approvedAt: new Date().toISOString(),
    }))

    // Save to Business Assets in database
    try {
      const assetContent = JSON.stringify({
        businessName: finalFoundation.businessName,
        recommendedDomain: finalFoundation.recommendedDomain,
        businessConcept: finalFoundation.description,
        targetCustomer: finalFoundation.whoYouServe,
        problemSolved: finalFoundation.problemSolved,
        revenueModel: finalFoundation.revenueModel,
        whatYouSell: finalFoundation.whatYouSell,
        simplePricing: finalFoundation.simplePricing,
        businessPlanSummary: finalFoundation.businessPlanSummary,
      })

      await fetch(`/api/launch/${launchId}/asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'foundation',
          title: 'Business Foundation',
          content: assetContent,
          isApproved: true,
        }),
      })

      console.log('[v0] Business foundation saved to assets')
    } catch (error) {
      console.error('[v0] Failed to save foundation to assets:', error)
    }

    setStage('completed')
    onComplete(finalFoundation)
  }

  const handleEditField = (field: keyof BusinessFoundation) => {
    setEditingField(field)
    setEditValues({
      ...editValues,
      [field]: businessFoundation?.[field] || '',
    })
  }

  const handleSaveEdit = (field: keyof BusinessFoundation) => {
    setBusinessFoundation(prev => ({
      ...prev!,
      [field]: editValues[field],
    }))
    setEditingField(null)
  }

  const handleRegenerate = () => {
    localStorage.removeItem(`step1-${launchId}`)
    setBusinessFoundation(null)
    setStage('choice')
  }

  if (stage === 'completed' && businessFoundation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-6">
          <div className="flex items-start gap-3 mb-4">
            <Check className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">Business Foundation Complete</h3>
              <p className="text-sm text-slate-400 mt-1">Your business foundation has been saved and is ready for the next steps.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => setStage('business-foundation')}
              className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/[0.05] transition text-sm font-medium"
            >
              View / Edit Foundation
            </button>
            <button
              onClick={() => alert('Continue to Step 2 - Coming next!')}
              className="px-4 py-2 rounded-lg bg-sky-400 text-[#0a1220] hover:bg-sky-300 transition text-sm font-medium"
            >
              Continue to Step 2
            </button>
          </div>
        </div>
      </motion.div>
    )
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
            <h3 className="text-xl font-semibold text-white mb-2">
              What type of business interests you?
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Select a category and we&apos;ll generate business ideas for you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selectedCategory === cat
                      ? 'border-sky-400 bg-sky-400/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-sky-400/50'
                  }`}
                >
                  <p className={`font-medium ${selectedCategory === cat ? 'text-sky-400' : 'text-white'}`}>
                    {cat}
                  </p>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateIdeas}
              disabled={!selectedCategory || loading}
              className="w-full rounded-lg bg-sky-400 px-6 py-2 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Generating Ideas...
                </>
              ) : (
                'Generate Ideas'
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Ideas Display Stage */}
      {stage === 'ideas-display' && generatedIdeas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => setStage('category-select')}
            className="text-sm text-slate-400 hover:text-white transition mb-4 flex items-center gap-1"
          >
            ← Back
          </button>

          <div>
            <h3 className="text-xl font-semibold text-white mb-6">
              Here are some business ideas for you
            </h3>

            <div className="space-y-3">
              {generatedIdeas.map((idea, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateBusinessFoundation(idea)}
                  disabled={loading}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-sky-400/50 hover:bg-white/[0.06] transition"
                >
                  <h4 className="font-semibold text-white mb-2">{idea.name}</h4>
                  <p className="text-sm text-slate-400">{idea.description}</p>
                </motion.button>
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
            <h3 className="text-2xl font-bold text-white mb-2">Your Business Foundation</h3>
            <p className="text-sm text-slate-400 mb-6">Review and edit your business foundation below. Click any field to make changes.</p>

            {/* Main Foundation Card */}
            <div className="rounded-lg border border-sky-400/20 bg-gradient-to-br from-sky-400/5 to-transparent p-8 space-y-8">
              {/* Business Basics Section */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Business Basics</p>
                  <div className="space-y-4">
                    {/* Business Name */}
                    <div className="group">
                      <p className="text-xs font-medium text-slate-400 mb-1">Business Name</p>
                      {editingField === 'businessName' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editValues.businessName || ''}
                            onChange={(e) => setEditValues({ ...editValues, businessName: e.target.value })}
                            className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit('businessName')}
                            className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          <p className="text-white font-medium">{businessFoundation.businessName}</p>
                          <button
                            onClick={() => handleEditField('businessName')}
                            className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Recommended Domain */}
                    <div className="group">
                      <p className="text-xs font-medium text-slate-400 mb-1">Recommended Domain</p>
                      {editingField === 'recommendedDomain' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editValues.recommendedDomain || ''}
                            onChange={(e) => setEditValues({ ...editValues, recommendedDomain: e.target.value })}
                            className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit('recommendedDomain')}
                            className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          <p className="text-white">{businessFoundation.recommendedDomain}</p>
                          <button
                            onClick={() => handleEditField('recommendedDomain')}
                            className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3 group">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Business Description</p>
                {editingField === 'description' ? (
                  <div className="flex gap-2">
                    <textarea
                      value={editValues.description || ''}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSaveEdit('description')}
                        className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <p className="text-white leading-relaxed text-sm flex-1">{businessFoundation.description}</p>
                    <button
                      onClick={() => handleEditField('description')}
                      className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Market Section */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Market</p>
                {/* What You Sell */}
                <div className="group">
                  <p className="text-xs font-medium text-slate-400 mb-2">What You Sell</p>
                  {editingField === 'whatYouSell' ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editValues.whatYouSell || ''}
                        onChange={(e) => setEditValues({ ...editValues, whatYouSell: e.target.value })}
                        className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleSaveEdit('whatYouSell')}
                          className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-white text-sm flex-1">{businessFoundation.whatYouSell}</p>
                      <button
                        onClick={() => handleEditField('whatYouSell')}
                        className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Who You Serve */}
                <div className="group">
                  <p className="text-xs font-medium text-slate-400 mb-2">Who You Serve</p>
                  {editingField === 'whoYouServe' ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editValues.whoYouServe || ''}
                        onChange={(e) => setEditValues({ ...editValues, whoYouServe: e.target.value })}
                        className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleSaveEdit('whoYouServe')}
                          className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-white text-sm flex-1">{businessFoundation.whoYouServe}</p>
                      <button
                        onClick={() => handleEditField('whoYouServe')}
                        className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Problem Solved */}
                <div className="group">
                  <p className="text-xs font-medium text-slate-400 mb-2">Problem Solved</p>
                  {editingField === 'problemSolved' ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editValues.problemSolved || ''}
                        onChange={(e) => setEditValues({ ...editValues, problemSolved: e.target.value })}
                        className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleSaveEdit('problemSolved')}
                          className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-white text-sm flex-1">{businessFoundation.problemSolved || 'Not specified'}</p>
                      <button
                        onClick={() => handleEditField('problemSolved')}
                        className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Section */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Revenue</p>
                {/* Revenue Model */}
                <div className="group">
                  <p className="text-xs font-medium text-slate-400 mb-2">Revenue Model</p>
                  {editingField === 'revenueModel' ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editValues.revenueModel || ''}
                        onChange={(e) => setEditValues({ ...editValues, revenueModel: e.target.value })}
                        className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleSaveEdit('revenueModel')}
                          className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-white text-sm flex-1">{businessFoundation.revenueModel}</p>
                      <button
                        onClick={() => handleEditField('revenueModel')}
                        className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Simple Pricing */}
                <div className="group">
                  <p className="text-xs font-medium text-slate-400 mb-2">Simple Pricing</p>
                  {editingField === 'simplePricing' ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editValues.simplePricing || ''}
                        onChange={(e) => setEditValues({ ...editValues, simplePricing: e.target.value })}
                        className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleSaveEdit('simplePricing')}
                          className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-white text-sm flex-1">{businessFoundation.simplePricing}</p>
                      <button
                        onClick={() => handleEditField('simplePricing')}
                        className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan Summary Section */}
              <div className="space-y-3 border-t border-white/10 pt-6 group">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Business Plan Summary</p>
                {editingField === 'businessPlanSummary' ? (
                  <div className="flex gap-2">
                    <textarea
                      value={editValues.businessPlanSummary || ''}
                      onChange={(e) => setEditValues({ ...editValues, businessPlanSummary: e.target.value })}
                      className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSaveEdit('businessPlanSummary')}
                        className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <p className="text-white text-sm leading-relaxed flex-1">{businessFoundation.businessPlanSummary}</p>
                    <button
                      onClick={() => handleEditField('businessPlanSummary')}
                      className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={handleRegenerate}
                className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/[0.05] transition text-sm font-medium"
              >
                Regenerate
              </button>
              <button
                onClick={() => setStage('choice')}
                className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/[0.05] transition text-sm font-medium"
              >
                Edit Original Idea
              </button>
              <button
                onClick={handleApproveFoundation}
                className="flex-1 px-6 py-3 rounded-lg bg-sky-400 text-[#0a1220] hover:bg-sky-300 transition text-sm font-medium"
              >
                Approve Foundation
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
