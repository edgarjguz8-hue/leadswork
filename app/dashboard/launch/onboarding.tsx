'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ArrowLeft } from 'lucide-react'
import { BusinessFoundation } from '@/components/business-foundation'

interface BusinessFoundationData {
  businessName: string
  whatYouSell: string
  whoYouServe: string
  revenueModel: string
  recommendedPricing: string
  missionStatement: string
  visionStatement: string
  elevatorPitch: string
}

interface OnboardingData {
  businessIdea: string
  foundation?: BusinessFoundationData
  businessType?: string
  industry?: string
  description?: string
  targetMarket?: string
  businessGoal?: string
}

export function LaunchOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    businessIdea: '',
  })
  const [generatedFoundation, setGeneratedFoundation] = useState<BusinessFoundationData | null>(null)
  const [foundationApproved, setFoundationApproved] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  // Generate foundation from business idea
  const generateFoundation = () => {
    const idea = data.businessIdea.trim()
    if (!idea) return

    // Extract key words for context
    const words = idea.toLowerCase().split(' ')
    
    // Simple mock generation based on business idea
    const foundation: BusinessFoundationData = {
      businessName: idea.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'My Business',
      whatYouSell: `Professional ${idea.toLowerCase()} services designed to solve real problems for customers`,
      whoYouServe: 'Small to medium-sized businesses and individual customers looking for quality solutions',
      revenueModel: 'Service-based revenue with potential for recurring contracts and upsells',
      recommendedPricing: '$100-$500 per service depending on scope and market conditions',
      missionStatement: `We help customers succeed by providing exceptional ${idea.toLowerCase()} services.`,
      visionStatement: `To become the trusted leader in ${idea.toLowerCase()} within our market.`,
      elevatorPitch: `We provide high-quality ${idea.toLowerCase()} that helps customers achieve their goals efficiently and affordably.`,
    }

    setGeneratedFoundation(foundation)
  }

  const handleApproveFoundation = async () => {
    if (!generatedFoundation) return

    setLoading(true)
    try {
      // Create launch with foundation data
      const launchData = {
        businessName: generatedFoundation.businessName,
        businessType: 'service',
        industry: 'General Services',
        description: generatedFoundation.whatYouSell,
        targetMarket: generatedFoundation.whoYouServe,
        businessGoal: generatedFoundation.elevatorPitch,
        foundationData: generatedFoundation,
      }

      console.log('[v0] Submitting launch with foundation:', launchData)
      
      const response = await fetch('/api/launch/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[v0] Launch created successfully:', result)
        router.push(`/dashboard/launch/${result.launchId}`)
      } else {
        const errorText = await response.text()
        console.error('[v0] Onboarding API error:', response.status, errorText)
        alert(`Error: ${errorText || 'Failed to create launch'}`)
      }
    } catch (error) {
      console.error('[v0] Onboarding submission error:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateFoundation = () => {
    // In a real app, this would call an AI API
    // For now, we'll just regenerate with slight variations
    generateFoundation()
  }

  const handleEditIdea = () => {
    setGeneratedFoundation(null)
  }

  return (
    <div className="min-h-screen bg-[#0a1220] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-sky-400" />
            <h1 className="text-4xl font-bold text-white">Start Your Business Launch</h1>
          </div>
          <p className="text-slate-400">
            {generatedFoundation 
              ? 'Review your business foundation'
              : 'Step 1 of 5 - Tell us your business idea'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sky-400"
            initial={{ width: 0 }}
            animate={{ width: `${generatedFoundation ? 20 : 10}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Form Content */}
        {!generatedFoundation ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  What business would you like to build?
                </label>
                <p className="text-sm text-slate-400 mb-4">
                  Describe your business idea in one sentence. For example: &quot;I want to start a pressure washing company.&quot;
                </p>
                <textarea
                  name="businessIdea"
                  value={data.businessIdea}
                  onChange={handleInputChange}
                  placeholder="I want to start a..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none transition resize-none"
                />
              </div>

              <div className="rounded-lg border border-sky-400/30 bg-sky-400/10 p-4">
                <p className="text-sm text-sky-300">
                  ✨ Once you submit, we&apos;ll automatically generate your complete business foundation including name, mission, vision, pricing, and more.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (data.businessIdea.trim()) {
                    generateFoundation()
                  }
                }}
                disabled={!data.businessIdea.trim() || loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Build My Business {loading && <Sparkles className="h-4 w-4 animate-spin" />}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="foundation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <BusinessFoundation
              data={generatedFoundation}
              isApproved={foundationApproved}
              isLoading={loading}
              onApprove={() => {
                setFoundationApproved(true)
                handleApproveFoundation()
              }}
              onRegenerate={handleRegenerateFoundation}
              onEditIdea={handleEditIdea}
            />

            {/* Back Button */}
            <button
              onClick={() => setGeneratedFoundation(null)}
              className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:border-sky-400/30 transition mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Edit Idea
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
