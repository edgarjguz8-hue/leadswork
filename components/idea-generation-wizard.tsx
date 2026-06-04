'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, RotateCcw, Check, Globe } from 'lucide-react'

interface WizardResponses {
  problem: string
  skills: string
  targetCustomer: string
  solution: string
}

interface IdeaAnalysis {
  marketPotential: string
  targetMarket: string
  revenueOpportunity: string
  requiredSkills: string
  suggestedDomain: string
  nextSteps: string
}

interface IdeaGenerationWizardProps {
  onComplete: (idea: string, responses: WizardResponses) => void
  isLoading?: boolean
}

// Analyze business idea and generate insights
const analyzeIdeaFunction = (idea: string): { analysis: IdeaAnalysis; responses: WizardResponses } => {
  const lowerIdea = idea.toLowerCase()

  // Extract keywords from idea
  const hasService = lowerIdea.match(/(service|clean|wash|design|consult|coach|teach|help)/i)
  const hasProduct = lowerIdea.match(/(product|sell|make|create|build|app|software)/i)
  const hasDigital = lowerIdea.match(/(app|software|digital|online|platform|saas|web)/i)

  // Generate domain suggestions
  const ideaWords = idea
    .split(' ')
    .filter(w => w.length > 3 && !['will', 'want', 'that', 'this', 'from'].includes(w.toLowerCase()))
    .slice(0, 3)
  
  const domainBase = ideaWords.join('').toLowerCase()
  const suggestedDomain = `${domainBase || 'mybusiness'}.com`

  // Analyze market potential
  let marketPotential = 'Moderate market potential with good scalability opportunities'
  if (hasService) {
    marketPotential = 'Strong recurring revenue potential - service businesses have high customer lifetime value'
  } else if (hasProduct) {
    marketPotential = 'High scalability potential - product businesses can scale without trading time for money'
  } else if (hasDigital) {
    marketPotential = 'Excellent scalability - digital products can reach unlimited customers with minimal marginal cost'
  }

  // Identify target market
  let targetMarket = 'Small businesses and individual consumers'
  if (lowerIdea.includes('small business') || lowerIdea.includes('b2b')) {
    targetMarket = 'Small to medium-sized businesses (SMBs) looking for professional solutions'
  } else if (lowerIdea.includes('enterprise')) {
    targetMarket = 'Large enterprises and corporations'
  } else if (lowerIdea.includes('consumer') || lowerIdea.includes('family') || lowerIdea.includes('home')) {
    targetMarket = 'Individual consumers and households'
  }

  // Revenue opportunity
  let revenueOpportunity = '$50K-$250K annually with single operator, $500K+ with team'
  if (hasService) {
    revenueOpportunity = '$100K-$500K first year (service-based), scales to $1M+ with team'
  } else if (hasProduct) {
    revenueOpportunity = '$50K-$500K first year, high potential to scale to $1M+ quickly'
  } else if (hasDigital) {
    revenueOpportunity = '$50K-$1M+ first year with viral potential, unlimited scaling'
  }

  // Required skills
  let requiredSkills = 'Customer service, operations, business management'
  if (hasService) {
    requiredSkills = 'Technical expertise in the service area, customer relationship management, operations'
  } else if (hasProduct) {
    requiredSkills = 'Product design/development, supply chain management, marketing'
  } else if (hasDigital) {
    requiredSkills = 'Development/no-code skills, user experience design, growth marketing'
  }

  // Next steps
  let nextSteps = 'Validate market demand, research competitors, create a minimum viable offer'
  if (hasService) {
    nextSteps = 'Land your first 3 paying customers, document your process, build testimonials'
  } else if (hasProduct) {
    nextSteps = 'Create a prototype/MVP, test with target customers, validate demand before scaling'
  } else if (hasDigital) {
    nextSteps = 'Build MVP quickly, launch to target audience, iterate based on feedback'
  }

  const analysis: IdeaAnalysis = {
    marketPotential,
    targetMarket,
    revenueOpportunity,
    requiredSkills,
    suggestedDomain,
    nextSteps,
  }

  // Generate structured responses for foundation generation
  const responses: WizardResponses = {
    problem: `Market need: ${idea}`,
    skills: requiredSkills,
    targetCustomer: targetMarket,
    solution: `Offering based on: ${idea}`,
  }

  return { analysis, responses }
}

export function IdeaGenerationWizard({ onComplete, isLoading = false }: IdeaGenerationWizardProps) {
  const [step, setStep] = useState(1) // 1: Input idea, 2: Review analysis, 3: Done
  const [businessIdea, setBusinessIdea] = useState('')
  const [ideaAnalysis, setIdeaAnalysis] = useState<IdeaAnalysis | null>(null)
  const [wizardResponses, setWizardResponses] = useState<WizardResponses | null>(null)

  const handleAnalyzeIdea = () => {
    if (!businessIdea.trim()) return

    const { analysis, responses } = analyzeIdeaFunction(businessIdea)
    setIdeaAnalysis(analysis)
    setWizardResponses(responses)
    setStep(2)
  }

  const handleRegenerate = () => {
    setStep(1)
    setIdeaAnalysis(null)
    setWizardResponses(null)
  }

  const handleApprove = () => {
    if (ideaAnalysis && wizardResponses) {
      onComplete(businessIdea, wizardResponses)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Input Section */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">What's Your Business Idea?</h2>
                <p className="text-slate-400">
                  Describe the business you want to build. Be specific about what you'd offer and who you'd help.
                </p>
              </div>

              <textarea
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="e.g., I want to start a pressure washing service for homeowners and small businesses in my area. I'd handle driveways, patios, and building exteriors."
                rows={5}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none transition resize-none text-base"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleAnalyzeIdea}
                  disabled={!businessIdea.trim() || isLoading}
                  className="flex-1 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze & Refine My Idea
                </button>
              </div>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Your Idea */}
            <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Your Business Idea</h2>
              <p className="text-lg text-sky-100 leading-relaxed">{businessIdea}</p>
            </div>

            {/* Analysis Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {ideaAnalysis && (
                <>
                  {/* Market Potential */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      Market Potential
                    </h3>
                    <p className="text-white leading-relaxed">{ideaAnalysis.marketPotential}</p>
                  </motion.div>

                  {/* Target Market */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      Target Market
                    </h3>
                    <p className="text-white leading-relaxed">{ideaAnalysis.targetMarket}</p>
                  </motion.div>

                  {/* Revenue Opportunity */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      Revenue Opportunity
                    </h3>
                    <p className="text-white leading-relaxed">{ideaAnalysis.revenueOpportunity}</p>
                  </motion.div>

                  {/* Required Skills */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      Required Skills
                    </h3>
                    <p className="text-white leading-relaxed">{ideaAnalysis.requiredSkills}</p>
                  </motion.div>

                  {/* Suggested Domain */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-6 backdrop-blur"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Suggested Domain
                    </h3>
                    <p className="text-lg font-semibold text-white break-all">{ideaAnalysis.suggestedDomain}</p>
                  </motion.div>

                  {/* Next Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      First Steps
                    </h3>
                    <p className="text-white leading-relaxed">{ideaAnalysis.nextSteps}</p>
                  </motion.div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Refine Idea
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Approve & Continue to Foundation
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
