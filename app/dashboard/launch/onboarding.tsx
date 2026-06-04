'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { IdeaGenerationWizard } from '@/components/idea-generation-wizard'
import { BusinessFoundation } from '@/components/business-foundation'

interface WizardResponses {
  problem: string
  skills: string
  targetCustomer: string
  solution: string
}

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

// Generate business foundation from wizard responses and business idea
const generateFoundationFromResponses = (
  idea: string,
  responses: WizardResponses
): BusinessFoundationData => {
  // Extract key concepts from responses
  const solutionWords = responses.solution.toLowerCase().split(' ')
  const skillsWords = responses.skills.toLowerCase().split(' ')

  // Generate business name from key words
  let businessName = 'Your Business'
  
  // Try to create name from solution or skills
  const nameKeywords = [
    ...solutionWords.filter(w => w.length > 3),
    ...skillsWords.filter(w => w.length > 3),
  ]
  
  if (nameKeywords.length > 0) {
    const keyword = nameKeywords[0]
    businessName = keyword.charAt(0).toUpperCase() + keyword.slice(1)
    
    // Common pattern names
    if (responses.solution.toLowerCase().includes('service')) {
      businessName = `${businessName} Pro`
    } else if (responses.solution.toLowerCase().includes('consulting')) {
      businessName = `${businessName} Consulting`
    } else if (responses.solution.toLowerCase().includes('product')) {
      businessName = `${businessName} Co`
    } else {
      businessName = `${businessName} Solutions`
    }
  }

  // Generate domain
  const domain = businessName.toLowerCase().replace(/\s+/g, '') + '.com'

  // Business description from responses
  const businessDescription = `${businessName} solves the challenge: "${responses.problem}". By leveraging expertise in ${responses.skills.toLowerCase()}, we deliver ${responses.solution.toLowerCase()} to ${responses.targetCustomer.toLowerCase()}.`

  // Who you serve - from target customer response
  const whoYouServe = [
    responses.targetCustomer,
    'Organizations seeking professional solutions',
    'Customers who value quality and expertise',
  ]

  // What you sell - from solution response
  const whatYouSell = [
    responses.solution,
    `Consulting and guidance based on ${responses.skills.toLowerCase()}`,
    'Ongoing support and maintenance',
  ]

  // Revenue model - infer from solution type
  let revenueModel = 'Service-based with opportunities for recurring revenue'
  if (responses.solution.toLowerCase().includes('product')) {
    revenueModel = 'Direct product sales with potential for subscriptions'
  } else if (responses.solution.toLowerCase().includes('consulting')) {
    revenueModel = 'Project-based and retainer consulting fees'
  }

  // Pricing - estimated based on service level
  let pricing = '$50-$200+ per service depending on scope and market'
  if (responses.solution.toLowerCase().includes('product')) {
    pricing = '$20-$500+ per product depending on type and materials'
  } else if (responses.solution.toLowerCase().includes('consulting')) {
    pricing = '$75-$300+ per hour or $2,000-$10,000+ per project'
  }

  // Business plan summary
  const businessPlanSummary = `Our business addresses a clear need: ${responses.problem.toLowerCase()}. We combine deep expertise in ${responses.skills.toLowerCase()} to deliver ${responses.solution.toLowerCase()}. Our target market of ${responses.targetCustomer.toLowerCase()} represents a significant opportunity. Year 1 will focus on establishing a strong reputation through exceptional delivery, with growth through referrals and strategic partnerships. By month 6, we'll have refined our processes and expanded our service offerings based on customer feedback.`

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
  const [businessIdea, setBusinessIdea] = useState<string | null>(null)
  const [wizardResponses, setWizardResponses] = useState<WizardResponses | null>(null)
  const [generatedFoundation, setGeneratedFoundation] = useState<BusinessFoundationData | null>(null)

  const handleWizardComplete = (idea: string, responses: WizardResponses) => {
    setBusinessIdea(idea)
    setWizardResponses(responses)
    
    // Generate foundation from responses
    const foundation = generateFoundationFromResponses(idea, responses)
    setGeneratedFoundation(foundation)
  }

  const handleApproveFoundation = async () => {
    if (!generatedFoundation || !businessIdea || !wizardResponses) return

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
        ideaGeneration: {
          idea: businessIdea,
          responses: wizardResponses,
        },
      }

      console.log('[v0] Submitting launch with foundation:', launchData)

      const response = await fetch('/api/launch/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[v0] Launch created:', result.launchId)
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
    if (wizardResponses && businessIdea) {
      const newFoundation = generateFoundationFromResponses(businessIdea, wizardResponses)
      setGeneratedFoundation(newFoundation)
    }
  }

  const handleEditIdea = () => {
    setBusinessIdea(null)
    setWizardResponses(null)
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
            <h1 className="text-4xl font-bold text-white">Start Your Business Launch</h1>
          </div>
          <p className="text-slate-400">
            Step 1: Business Foundation - Let's build your business idea together
          </p>
        </div>

        {/* Main Content */}
        {!generatedFoundation ? (
          <IdeaGenerationWizard
            onComplete={handleWizardComplete}
            isLoading={loading}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto space-y-6"
          >
            {/* Business Idea Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
              <h2 className="text-xl font-semibold text-white mb-4">Your Business Idea</h2>
              <p className="text-lg text-sky-300 leading-relaxed">{businessIdea}</p>
            </div>

            {/* Foundation Component */}
            <BusinessFoundation
              data={generatedFoundation}
              isLoading={loading}
              onApprove={handleApproveFoundation}
              onRegenerate={handleRegenerateFoundation}
              onEditIdea={handleEditIdea}
            />

            {/* Cancel Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCancel}
                className="rounded-lg border border-white/10 px-6 py-2 text-sm font-medium text-slate-400 hover:text-white hover:border-sky-400/30 transition"
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
