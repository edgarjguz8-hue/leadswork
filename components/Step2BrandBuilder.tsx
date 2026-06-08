'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, Edit2, Lock } from 'lucide-react'

interface BrandFoundation {
  missionStatement: string
  visionStatement: string
  tagline: string
  brandPersonality: string
  brandPositioning: string
}

interface Step2BrandBuilderProps {
  launchId: string
  launchName: string
  onComplete: (foundation: BrandFoundation) => void
}

export function Step2BrandBuilder({
  launchId,
  launchName,
  onComplete,
}: Step2BrandBuilderProps) {
  const [stage, setStage] = useState<'idle' | 'generating' | 'reviewing' | 'completed'>('idle')
  const [brandFoundation, setBrandFoundation] = useState<BrandFoundation>({
    missionStatement: '',
    visionStatement: '',
    tagline: '',
    brandPersonality: '',
    brandPositioning: '',
  })
  const [editValues, setEditValues] = useState<Partial<BrandFoundation>>({})
  const [editingField, setEditingField] = useState<keyof BrandFoundation | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`step2-${launchId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.foundation) {
          setBrandFoundation(parsed.foundation)
          setStage('reviewing')
        }
      } catch (error) {
        console.error('[v0] Error loading saved brand data:', error)
      }
    }
  }, [launchId])

  const handleGenerateBrand = async () => {
    try {
      setStage('generating')
      setErrorMessage(null)

      const response = await fetch('/api/launch/generate-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launchName,
          launchId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate brand foundation')
      }

      const data = await response.json()
      console.log('[v0] Brand foundation generated:', data)

      if (data.foundation) {
        setBrandFoundation(data.foundation)
        setStage('reviewing')
        // Save to localStorage
        localStorage.setItem(`step2-${launchId}`, JSON.stringify({
          stage: 'reviewing',
          foundation: data.foundation,
        }))
      }
    } catch (error) {
      console.error('[v0] Error generating brand:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate brand foundation')
      setStage('idle')
    }
  }

  const handleEditField = (field: keyof BrandFoundation) => {
    setEditingField(field)
    setEditValues({ [field]: brandFoundation[field] })
  }

  const handleSaveEdit = (field: keyof BrandFoundation) => {
    const newValue = editValues[field]
    if (newValue !== undefined) {
      setBrandFoundation(prev => ({
        ...prev,
        [field]: newValue,
      }))
    }
    setEditingField(null)
    setEditValues({})
  }

  const handleApproveBrand = async () => {
    try {
      // Apply any edits made before approval
      const finalBrand = {
        ...brandFoundation,
        ...editValues,
      }
      setBrandFoundation(finalBrand)

      // Save to localStorage
      localStorage.setItem(`step2-${launchId}`, JSON.stringify({
        stage: 'completed',
        foundation: finalBrand,
        approvedAt: new Date().toISOString(),
      }))

      // Save to Business Assets in database
      try {
        const assetContent = JSON.stringify({
          missionStatement: finalBrand.missionStatement,
          visionStatement: finalBrand.visionStatement,
          tagline: finalBrand.tagline,
          brandPersonality: finalBrand.brandPersonality,
          brandPositioning: finalBrand.brandPositioning,
        })

        await fetch(`/api/launch/${launchId}/asset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'brand',
            title: 'Brand Foundation',
            content: assetContent,
            isApproved: true,
          }),
        })

        console.log('[v0] Brand foundation saved to assets')
        
        // Mark Step 2 as complete
        try {
          const stepResponse = await fetch(`/api/launch/${launchId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepNumber: 2,
              isCompleted: true,
            }),
          })
          if (stepResponse.ok) {
            console.log('[v0] Step 2 marked as complete')
          }
        } catch (stepError) {
          console.error('[v0] Failed to mark step as complete:', stepError)
        }
      } catch (error) {
        console.error('[v0] Failed to save brand to assets:', error)
      }

      setStage('completed')
      onComplete(finalBrand)
    } catch (error) {
      console.error('[v0] Error approving brand:', error)
      setErrorMessage('Failed to approve brand foundation')
    }
  }

  if (stage === 'generating') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 mb-4"
          >
            <Sparkles className="h-6 w-6 text-sky-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">Generating Brand Foundation</h3>
          <p className="text-sm text-slate-400">Creating mission, vision, tagline, personality, and positioning for your brand...</p>
        </motion.div>
      </div>
    )
  }

  if (stage === 'completed') {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/30">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">Brand foundation approved!</p>
              <p className="text-xs text-emerald-300">Saved to Business Assets</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (stage === 'reviewing') {
    return (
      <div className="space-y-6">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-4"
          >
            <p className="text-sm text-red-400">{errorMessage}</p>
          </motion.div>
        )}

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-slate-700/30 bg-slate-800/20 p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Brand Strategy</h3>
            <div className="space-y-6">
              {/* Mission Statement */}
              <div className="group">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Mission Statement</p>
                {editingField === 'missionStatement' ? (
                  <div className="flex gap-2">
                    <textarea
                      value={editValues.missionStatement || ''}
                      onChange={(e) => setEditValues({ ...editValues, missionStatement: e.target.value })}
                      className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSaveEdit('missionStatement')}
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
                    <p className="text-white text-sm flex-1">{brandFoundation.missionStatement || 'Not specified'}</p>
                    <button
                      onClick={() => handleEditField('missionStatement')}
                      className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Vision Statement */}
              <div className="group">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Vision Statement</p>
                {editingField === 'visionStatement' ? (
                  <div className="flex gap-2">
                    <textarea
                      value={editValues.visionStatement || ''}
                      onChange={(e) => setEditValues({ ...editValues, visionStatement: e.target.value })}
                      className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSaveEdit('visionStatement')}
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
                    <p className="text-white text-sm flex-1">{brandFoundation.visionStatement || 'Not specified'}</p>
                    <button
                      onClick={() => handleEditField('visionStatement')}
                      className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tagline */}
              <div className="group">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Tagline</p>
                {editingField === 'tagline' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editValues.tagline || ''}
                      onChange={(e) => setEditValues({ ...editValues, tagline: e.target.value })}
                      className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit('tagline')}
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
                    <p className="text-white text-sm italic flex-1">{brandFoundation.tagline || 'Not specified'}</p>
                    <button
                      onClick={() => handleEditField('tagline')}
                      className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Brand Personality */}
              <div className="group">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Brand Personality</p>
                {editingField === 'brandPersonality' ? (
                  <div className="flex gap-2">
                    <textarea
                      value={editValues.brandPersonality || ''}
                      onChange={(e) => setEditValues({ ...editValues, brandPersonality: e.target.value })}
                      className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSaveEdit('brandPersonality')}
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
                    <p className="text-white text-sm flex-1">{brandFoundation.brandPersonality || 'Not specified'}</p>
                    <button
                      onClick={() => handleEditField('brandPersonality')}
                      className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Brand Positioning */}
              <div className="group">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Brand Positioning</p>
                {editingField === 'brandPositioning' ? (
                  <div className="flex gap-2">
                    <textarea
                      value={editValues.brandPositioning || ''}
                      onChange={(e) => setEditValues({ ...editValues, brandPositioning: e.target.value })}
                      className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSaveEdit('brandPositioning')}
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
                    <p className="text-white text-sm flex-1">{brandFoundation.brandPositioning || 'Not specified'}</p>
                    <button
                      onClick={() => handleEditField('brandPositioning')}
                      className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-700/30">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApproveBrand}
              className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              Approve Brand
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateBrand}
              className="flex-1 rounded-lg border border-slate-600/50 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700/30 hover:border-slate-500/50 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Regenerate
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Initial state - idle
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-slate-700/30 bg-slate-800/20 p-6"
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Brand Foundation</h3>
          <p className="text-sm text-slate-400">Create your mission, vision, tagline, personality, and positioning</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateBrand}
          className="w-full rounded-lg bg-sky-500 px-6 py-4 text-base font-semibold text-white hover:bg-sky-600 transition flex items-center justify-center gap-3"
        >
          <Sparkles className="h-5 w-5" />
          Generate Brand Foundation
        </motion.button>
      </motion.div>
    </div>
  )
}
