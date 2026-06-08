'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

interface OnboardingData {
  businessName: string
  businessType: string
  industry: string
  description: string
  targetMarket: string
  businessGoal: string
}

export function LaunchOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1) // Maps to original step 3
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    businessName: 'My Business',
    businessType: 'other',
    industry: 'Tech',
    description: 'A tech business',
    targetMarket: '',
    businessGoal: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      submitOnboarding()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getButtonDisabled = () => {
    if (loading) return true
    
    // Only check for the remaining steps (original 3 and 4)
    switch (step) {
      case 1: // Original step 3
        return !data.targetMarket || !data.businessGoal
      case 2: // Original step 4 (review)
        return false
      default:
        return false
    }
  }

  const submitOnboarding = async () => {
    setLoading(true)
    try {
      console.log('[v0] Submitting onboarding data:', data)
      const response = await fetch('/api/launch/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      console.log('[v0] API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('[v0] Launch created successfully:', result)
        if (result.launchId) {
          console.log('[v0] Redirecting to:', `/dashboard/launch/${result.launchId}`)
          router.push(`/dashboard/launch/${result.launchId}`)
        } else {
          console.error('[v0] No launchId in response:', result)
          alert('Error: Launch created but no ID returned. Please try again.')
        }
      } else {
        const errorData = await response.json()
        console.error('[v0] Onboarding API error:', response.status, errorData)
        const errorMessage = errorData.error || errorData.details || 'Failed to create launch'
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('[v0] Onboarding submission error:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1220] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-sky-400" />
            <h1 className="text-4xl font-bold text-white">Start Your Business Launch</h1>
          </div>
          <p className="text-slate-400">Step {step} of 2 - Tell us about your business idea</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sky-400"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 2) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Form Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Target Market</label>
                <input
                  type="text"
                  name="targetMarket"
                  value={data.targetMarket}
                  onChange={handleInputChange}
                  placeholder="Who is your ideal customer?"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">What problem do you solve?</label>
                <textarea
                  name="businessGoal"
                  value={data.businessGoal}
                  onChange={handleInputChange}
                  placeholder="What's the main problem your business solves?"
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none transition resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-sky-400/30 bg-sky-400/10 p-6">
                <h3 className="font-semibold text-white mb-4">Review Your Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Business Name</p>
                    <p className="text-white font-medium">{data.businessName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Business Type</p>
                    <p className="text-white font-medium capitalize">{data.businessType}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Industry</p>
                    <p className="text-white font-medium">{data.industry}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Target Market</p>
                    <p className="text-white font-medium">{data.targetMarket}</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Once you start, our AI system will guide you through building your business with personalized recommendations at every step.
              </p>
            </div>
          )}
        </motion.div>

        {/* Buttons */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={getButtonDisabled()}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {step === 2 ? (
              <>Start Launch {loading && <Sparkles className="h-4 w-4 animate-spin" />}</>
            ) : (
              <>Next <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
