'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { IdeaCreator } from '@/components/idea-creator'
import { BusinessFoundation } from '@/components/business-foundation'

interface BusinessFoundationData {
  businessName: string
  domain: string
  businessDescription: string
  whoYouServe: string[]
  whatYouSell: string[]
  revenueModel: string
  pricing: string
  businessPlanSummary: string
}

// Generate business foundation from selected idea
const generateFoundationFromIdea = (idea: string): BusinessFoundationData => {
  const words = idea.split(' ').filter(w => w.length > 3)
  const primaryWord = words[0] || 'Business'

  // Generate business name
  let businessName = primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1).toLowerCase()
  
  if (idea.toLowerCase().includes('service')) {
    businessName += ' Pro Services'
  } else if (idea.toLowerCase().includes('online')) {
    businessName += ' Online'
  } else if (idea.toLowerCase().includes('local')) {
    businessName += ' Local'
  } else if (idea.toLowerCase().includes('shop')) {
    businessName += ' Shop'
  } else {
    businessName += ' Co'
  }

  // Generate domain
  const domain = businessName.toLowerCase().replace(/\s+/g, '') + '.com'

  // Business description
  const businessDescription = `${businessName} is built to help customers by offering ${idea.toLowerCase()}. We focus on delivering quality service with exceptional customer care.`

  // Who you serve
  const whoYouServe = [
    'Customers in your target market',
    'People looking for quality and professionalism',
    'Clients who value your expertise',
  ]

  // What you sell
  const whatYouSell = [
    idea,
    'Professional expertise and support',
    'Quality delivery and customer satisfaction',
  ]

  // Revenue model
  const revenueModel = 'Direct service or product sales with opportunities to grow into recurring revenue or scaling.'

  // Pricing
  const pricing = 'Competitive pricing based on market research. Adjust based on your costs, value, and local market conditions.'

  // Business plan summary
  const businessPlanSummary = `Year 1 Focus: Launch with strong customer service and build your reputation. Start with direct sales and word-of-mouth marketing. Focus on delivering exceptional results to build testimonials and referrals. Month 6: Review what's working, optimize your processes, and plan expansion. By Year 2: Scale by adding team members, expanding your service/product offerings, or entering new markets.`

  return {
    businessName,
    domain,
    businessDescription,
    whoYouServe,
    whatYouSell,
    revenueModel,
    pricing,
    businessPlanSummary,
  }
}

export function LaunchOnboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [generatedFoundation, setGeneratedFoundation] = useState<BusinessFoundationData | null>(null)

  const handleIdeaSelected = (idea: string) => {
    setSelectedIdea(idea)
    const foundation = generateFoundationFromIdea(idea)
    setGeneratedFoundation(foundation)
  }

  const handleApproveFoundation = async () => {
    if (!generatedFoundation || !selectedIdea) return

    setLoading(true)
    try {
      const launchData = {
        businessName: generatedFoundation.businessName,
        businessType: 'service',
        industry: 'Professional Services',
        description: generatedFoundation.businessDescription,
        targetMarket: generatedFoundation.whoYouServe.join(', '),
        businessGoal: generatedFoundation.businessPlanSummary,
        foundationData: generatedFoundation,
      }

      const response = await fetch('/api/launch/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/dashboard/launch/${result.launchId}`)
      } else {
        const errorText = await response.text()
        alert(`Error: ${errorText || 'Failed to create launch'}`)
      }
    } catch (error) {
      console.error('Launch creation error:', error)
      alert('Error creating launch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateFoundation = () => {
    if (selectedIdea) {
      const newFoundation = generateFoundationFromIdea(selectedIdea)
      setGeneratedFoundation(newFoundation)
    }
  }

  const handleEditIdea = () => {
    setSelectedIdea(null)
    setGeneratedFoundation(null)
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a1220] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-sky-400" />
            <h1 className="text-4xl font-bold text-white">Create Your Business Idea</h1>
          </div>
          <p className="text-slate-400">
            {generatedFoundation 
              ? 'Review and approve your business foundation'
              : 'Step 1 - Let LeadsWork help you create and define your business'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 h-2 w-full bg-white/10 rounded-full overflow-hidden max-w-3xl mx-auto">
          <motion.div
            className="h-full bg-sky-400"
            initial={{ width: 0 }}
            animate={{ width: `${generatedFoundation ? 30 : 10}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Main Content */}
        {!generatedFoundation ? (
          <div className="max-w-4xl mx-auto">
            <IdeaCreator
              onIdeaSelected={handleIdeaSelected}
              isLoading={loading}
            />
            
            <div className="mt-8 text-center">
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-white text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Selected Idea Display */}
            <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-6">
              <p className="text-sm text-slate-400 mb-2">Your Business Idea</p>
              <p className="text-xl font-semibold text-white">{selectedIdea}</p>
            </div>

            {/* Foundation Component */}
            <BusinessFoundation
              data={generatedFoundation}
              isLoading={loading}
              onApprove={handleApproveFoundation}
              onRegenerate={handleRegenerateFoundation}
              onEditIdea={handleEditIdea}
            />

            {/* Additional Actions */}
            <div className="text-center">
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-white text-sm transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
