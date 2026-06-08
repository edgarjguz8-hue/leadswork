'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, X, Edit2, Eye, Save, RefreshCw } from 'lucide-react'

interface WebsiteSection {
  headline: string
  subheadline: string
  aboutTitle: string
  aboutContent: string
  servicesTitle: string
  servicesIntro: string
  contactTitle: string
  contactEmail: string
  contactPhone: string
  ctaHeadline: string
  ctaText: string
  ctaButtonText: string
}

interface Step4WebsiteBuilderProps {
  launchId: string
  launchName: string
  onComplete: (website: WebsiteSection) => void
}

export function Step4WebsiteBuilder({
  launchId,
  launchName,
  onComplete,
}: Step4WebsiteBuilderProps) {
  const [stage, setStage] = useState<'idle' | 'generating' | 'reviewing' | 'preview' | 'completed'>('idle')
  const [website, setWebsite] = useState<WebsiteSection>({
    headline: '',
    subheadline: '',
    aboutTitle: '',
    aboutContent: '',
    servicesTitle: '',
    servicesIntro: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    ctaHeadline: '',
    ctaText: '',
    ctaButtonText: '',
  })
  const [editingField, setEditingField] = useState<keyof WebsiteSection | null>(null)
  const [editValue, setEditValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`step4-${launchId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.website) {
          setWebsite(parsed.website)
          setStage('reviewing')
        }
      } catch (error) {
        console.error('[v0] Error loading saved website data:', error)
      }
    }
  }, [launchId])

  const handleGenerateWebsite = async () => {
    try {
      setStage('generating')
      setErrorMessage(null)

      const response = await fetch('/api/launch/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchName, launchId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate website')
      }

      const data = await response.json()
      if (data.website) {
        setWebsite(data.website)
        setStage('reviewing')
        localStorage.setItem(`step4-${launchId}`, JSON.stringify({
          stage: 'reviewing',
          website: data.website,
        }))
      }
    } catch (error) {
      console.error('[v0] Error generating website:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate website')
      setStage('idle')
    }
  }

  const handleEditField = (field: keyof WebsiteSection) => {
    setEditingField(field)
    setEditValue(website[field])
  }

  const handleSaveEdit = () => {
    if (editingField) {
      setWebsite({ ...website, [editingField]: editValue })
      localStorage.setItem(`step4-${launchId}`, JSON.stringify({
        stage: 'reviewing',
        website: { ...website, [editingField]: editValue },
      }))
      setEditingField(null)
    }
  }

  const handleApproveWebsite = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/launch/${launchId}/asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'website',
          title: 'Website',
          content: JSON.stringify(website),
          isApproved: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save website to assets')
      }

      localStorage.setItem(`step4-${launchId}`, JSON.stringify({
        stage: 'completed',
        website,
        approvedAt: new Date().toISOString(),
      }))

      setStage('completed')
      onComplete(website)
    } catch (error) {
      console.error('[v0] Error approving website:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save website')
    } finally {
      setSaving(false)
    }
  }

  if (stage === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-6"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20">
            <Sparkles className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Generate Website</h3>
            <p className="text-xs text-slate-400">Create a landing page from your approved foundation and brand</p>
          </div>
        </div>
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <p className="text-xs text-red-400">{errorMessage}</p>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateWebsite}
          className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition"
        >
          Generate Website
        </motion.button>
      </motion.div>
    )
  }

  if (stage === 'generating') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-3 rounded-lg border border-sky-500/20 bg-sky-500/5 p-8"
      >
        <div className="h-5 w-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-sky-400">Generating your website...</p>
      </motion.div>
    )
  }

  if (stage === 'preview') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-8 space-y-6">
          <div className="space-y-4 text-center border-b border-slate-700/50 pb-8">
            <h1 className="text-4xl font-bold text-white">{website.headline}</h1>
            <p className="text-xl text-slate-300">{website.subheadline}</p>
          </div>
          <div className="space-y-3 border-b border-slate-700/50 pb-8">
            <h2 className="text-2xl font-semibold text-white">{website.aboutTitle}</h2>
            <p className="text-slate-300">{website.aboutContent}</p>
          </div>
          <div className="space-y-3 border-b border-slate-700/50 pb-8">
            <h2 className="text-2xl font-semibold text-white">{website.servicesTitle}</h2>
            <p className="text-slate-300">{website.servicesIntro}</p>
          </div>
          <div className="space-y-3 border-b border-slate-700/50 pb-8">
            <h2 className="text-2xl font-semibold text-white">{website.contactTitle}</h2>
            <div className="space-y-2 text-slate-300">
              <p>Email: {website.contactEmail}</p>
              <p>Phone: {website.contactPhone}</p>
            </div>
          </div>
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-white">{website.ctaHeadline}</h2>
            <p className="text-slate-300">{website.ctaText}</p>
            <button className="rounded-lg bg-sky-500 px-6 py-2 font-semibold text-white hover:bg-sky-600 transition">
              {website.ctaButtonText}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setStage('reviewing')}
            className="flex-1 rounded-lg border border-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.05] transition flex items-center justify-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleApproveWebsite}
            disabled={saving}
            className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Website
          </motion.button>
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
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Hero Section */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Hero Section</h3>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Headline</p>
            {editingField === 'headline' ? (
              <div className="flex gap-2">
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none" rows={2} autoFocus />
                <div className="flex flex-col gap-2">
                  <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingField(null)} className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="text-white text-sm">{website.headline}</p>
                <button onClick={() => handleEditField('headline')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Subheadline</p>
            {editingField === 'subheadline' ? (
              <div className="flex gap-2">
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none" rows={2} autoFocus />
                <div className="flex flex-col gap-2">
                  <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingField(null)} className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="text-slate-300 text-sm">{website.subheadline}</p>
                <button onClick={() => handleEditField('subheadline')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">About Section</h3>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Title</p>
            {editingField === 'aboutTitle' ? (
              <div className="flex gap-2">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400" autoFocus />
                <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">{website.aboutTitle}</p>
                <button onClick={() => handleEditField('aboutTitle')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Content</p>
            {editingField === 'aboutContent' ? (
              <div className="flex gap-2">
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none" rows={3} autoFocus />
                <div className="flex flex-col gap-2">
                  <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingField(null)} className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="text-slate-300 text-sm">{website.aboutContent}</p>
                <button onClick={() => handleEditField('aboutContent')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Services Section</h3>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Title</p>
            {editingField === 'servicesTitle' ? (
              <div className="flex gap-2">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400" autoFocus />
                <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">{website.servicesTitle}</p>
                <button onClick={() => handleEditField('servicesTitle')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Introduction</p>
            {editingField === 'servicesIntro' ? (
              <div className="flex gap-2">
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none" rows={2} autoFocus />
                <div className="flex flex-col gap-2">
                  <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingField(null)} className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="text-slate-300 text-sm">{website.servicesIntro}</p>
                <button onClick={() => handleEditField('servicesIntro')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Contact Section</h3>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Title</p>
            {editingField === 'contactTitle' ? (
              <div className="flex gap-2">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400" autoFocus />
                <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">{website.contactTitle}</p>
                <button onClick={() => handleEditField('contactTitle')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Email</p>
            {editingField === 'contactEmail' ? (
              <div className="flex gap-2">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400" autoFocus />
                <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-sm">{website.contactEmail}</p>
                <button onClick={() => handleEditField('contactEmail')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Phone</p>
            {editingField === 'contactPhone' ? (
              <div className="flex gap-2">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400" autoFocus />
                <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-sm">{website.contactPhone}</p>
                <button onClick={() => handleEditField('contactPhone')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Call-to-Action Section</h3>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Headline</p>
            {editingField === 'ctaHeadline' ? (
              <div className="flex gap-2">
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none" rows={2} autoFocus />
                <div className="flex flex-col gap-2">
                  <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingField(null)} className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="text-white text-sm">{website.ctaHeadline}</p>
                <button onClick={() => handleEditField('ctaHeadline')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Description</p>
            {editingField === 'ctaText' ? (
              <div className="flex gap-2">
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none" rows={3} autoFocus />
                <div className="flex flex-col gap-2">
                  <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingField(null)} className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="text-slate-300 text-sm">{website.ctaText}</p>
                <button onClick={() => handleEditField('ctaText')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition flex-shrink-0"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          <div className="group">
            <p className="text-xs font-medium text-slate-400 mb-2">Button Text</p>
            {editingField === 'ctaButtonText' ? (
              <div className="flex gap-2">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400" autoFocus />
                <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"><Check className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">{website.ctaButtonText}</p>
                <button onClick={() => handleEditField('ctaButtonText')} className="p-2 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] transition"><Edit2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStage('idle')} className="flex-1 rounded-lg border border-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.05] transition flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4" />Regenerate
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStage('preview')} className="flex-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-400 hover:bg-sky-500/20 transition flex items-center justify-center gap-2">
          <Eye className="h-4 w-4" />Preview
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} onClick={handleApproveWebsite} disabled={saving} className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="h-4 w-4" />Save Website
        </motion.button>
      </div>
    </motion.div>
  )
}
