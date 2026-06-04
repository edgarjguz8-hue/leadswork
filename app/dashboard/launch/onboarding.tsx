'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft } from 'lucide-react'
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

// Mock data generator - creates realistic foundation from business idea
const generateFoundationFromIdea = (idea: string): BusinessFoundationData => {
  const lowerIdea = idea.toLowerCase()
  
  // Extract key business concept
  const words = idea.split(' ')
  const businessType = words.slice(-1)[0] || 'business'
  
  // Basic business name generation
  let businessName = 'Your Business'
  if (idea.includes('pressure') && idea.includes('wash')) {
    businessName = 'ProWash Solutions'
  } else if (idea.includes('cup') || idea.includes('coffee')) {
    businessName = 'Cup Co'
  } else if (idea.includes('cleaning')) {
    businessName = 'CleanPro Services'
  } else if (idea.includes('consulting')) {
    businessName = 'ConsultPro'
  } else {
    // Generic name from keywords
    const keyword = words.find(w => w.length > 3) || 'Pro'
    businessName = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase() + ' Co'
  }

  // Generate domain
  const domain = businessName.toLowerCase().replace(/\s+/g, '') + '.com'

  // Generate business description
  let businessDescription = `${businessName} is a ${businessType} company dedicated to providing exceptional value to our customers. We focus on delivering high-quality solutions with outstanding customer service.`
  
  if (lowerIdea.includes('pressure wash')) {
    businessDescription = 'ProWash Solutions provides professional pressure washing services for residential and commercial properties. We specialize in keeping properties clean, well-maintained, and protected.'
  } else if (lowerIdea.includes('cup')) {
    businessDescription = 'Cup Co creates premium drinkware products designed for everyday use. Our cups combine quality, style, and functionality for customers who value durability and design.'
  }

  // Generate target audiences
  let whoYouServe = [
    'Small to medium-sized businesses',
    'Individual customers looking for quality',
    'People who value professional service'
  ]
  
  if (lowerIdea.includes('pressure wash')) {
    whoYouServe = [
      'Homeowners who want professional property cleaning',
      'Small businesses needing maintenance services',
      'Real estate agents preparing properties'
    ]
  } else if (lowerIdea.includes('cup')) {
    whoYouServe = [
      'Coffee enthusiasts and daily drinkers',
      'Corporate buyers for branded merchandise',
      'Gift-buyers looking for quality products'
    ]
  }

  // Generate products/services
  let whatYouSell = [
    'Core service or product offering',
    'Premium or specialized variants',
    'Maintenance or recurring services'
  ]
  
  if (lowerIdea.includes('pressure wash')) {
    whatYouSell = [
      'Residential pressure washing (driveways, patios, home exteriors)',
      'Commercial property cleaning services',
      'Monthly maintenance contracts'
    ]
  } else if (lowerIdea.includes('cup')) {
    whatYouSell = [
      'Custom branded cups and drinkware',
      'Premium material options (ceramic, stainless steel)',
      'Bulk orders for corporate clients'
    ]
  }

  // Revenue model
  let revenueModel = 'Direct sales of products or services with opportunities for recurring revenue through maintenance or subscription models.'
  
  if (lowerIdea.includes('pressure wash')) {
    revenueModel = 'Per-job pricing for one-time services, plus recurring monthly maintenance contracts. Higher margins on commercial contracts.'
  } else if (lowerIdea.includes('cup')) {
    revenueModel = 'Direct sales to consumers and corporate buyers. Bulk orders generate higher margins. Potential wholesale distribution.'
  }

  // Pricing
  let pricing = 'Competitive pricing based on market research, with premium options available.'
  
  if (lowerIdea.includes('pressure wash')) {
    pricing = '$150-$300 for residential jobs, $500-$2,000+ for commercial contracts, and $99-$199/month for maintenance plans.'
  } else if (lowerIdea.includes('cup')) {
    pricing = '$15-$30 per unit for retail customers, bulk discounts starting at $8-$12 per unit for corporate orders.'
  }

  // Business plan summary
  let businessPlanSummary = `${businessName} will launch with a focus on customer acquisition through digital marketing and local partnerships. We'll prioritize quality and customer service to build a strong reputation. Our first year goals include establishing a solid customer base and refining our operations.`
  
  if (lowerIdea.includes('pressure wash')) {
    businessPlanSummary = 'ProWash will start with residential customers in the local area, leveraging online reviews and word-of-mouth marketing. We\'ll build a team and invest in professional equipment. By month 6, we\'ll pursue commercial contracts which have higher margins and more stable recurring revenue.'
  } else if (lowerIdea.includes('cup')) {
    businessPlanSummary = 'Cup Co will launch with an e-commerce store and approach corporate buyers for bulk orders. We\'ll invest in high-quality materials and design. Strategic partnerships with influencers in the coffee space will drive awareness. Year 1 focuses on building a loyal customer base and establishing our brand.'
  }

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
  const [businessIdea, setBusinessIdea] = useState('')
  const [generatedFoundation, setGeneratedFoundation] = useState<BusinessFoundationData | null>(null)

  const handleGenerateFoundation = () => {
    if (!businessIdea.trim()) return
    const foundation = generateFoundationFromIdea(businessIdea)
    setGeneratedFoundation(foundation)
  }

  const handleApproveFoundation = async () => {
    if (!generatedFoundation) return

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
      console.error('Onboarding submission error:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateFoundation = () => {
    const newFoundation = generateFoundationFromIdea(businessIdea)
    setGeneratedFoundation(newFoundation)
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
              : 'Step 1 - Business Foundation - Tell us your idea. LeadsWork will build the foundation of your business.'}
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
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-6"
          >
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                What business do you want to build?
              </label>
              <textarea
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="I want to start a cup company."
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none transition resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateFoundation}
                disabled={!businessIdea.trim() || loading}
                className="flex-1 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Build My Foundation
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="foundation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <BusinessFoundation
              data={generatedFoundation}
              isLoading={loading}
              onApprove={handleApproveFoundation}
              onRegenerate={handleRegenerateFoundation}
              onEditIdea={handleEditIdea}
            />

            {/* Back to Edit Button */}
            <button
              onClick={handleEditIdea}
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
