'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Check, RotateCcw, Edit2 } from 'lucide-react'

interface IdeaCreatorProps {
  onIdeaSelected: (idea: string) => void
  isLoading?: boolean
}

interface GeneratedIdea {
  id: string
  name: string
  description: string
  serves: string
  revenue: string
}

interface BusinessFoundation {
  businessName: string
  domain: string
  businessDescription: string
  whatYouSell: string[]
  whoYouServe: string[]
  revenueModel: string
  pricing: string
  businessPlanSummary: string
}

// Mock data generator for business foundation
const generateFoundation = (idea: string): BusinessFoundation => {
  const words = idea.split(' ').filter(w => w.length > 2)
  const keyword = words[0]?.toLowerCase() || 'business'

  // Generate business name variations based on idea
  const nameVariations = [
    `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Pro`,
    `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Solutions`,
    `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}Works`,
    `Pro${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
  ]

  const businessName = nameVariations[Math.floor(Math.random() * nameVariations.length)]
  const domain = businessName.toLowerCase().replace(/\s+/g, '') + '.com'

  // Generate description
  const descriptions = [
    `${businessName} specializes in ${idea.toLowerCase()}. We deliver professional solutions tailored to our clients' needs.`,
    `${businessName} provides expert ${idea.toLowerCase()} services to help businesses and individuals succeed.`,
    `We're ${businessName}, focused on delivering exceptional ${idea.toLowerCase()} with a commitment to quality and customer satisfaction.`,
  ]

  const businessDescription = descriptions[Math.floor(Math.random() * descriptions.length)]

  // What you sell
  const whatYouSellOptions = [
    [`${idea}`, 'Customized solutions', 'Professional consulting', 'Quality assurance', 'Ongoing support'],
    [`Professional ${idea}`, 'Expert guidance', 'Implementation services', 'Training and support', 'Maintenance'],
    [`High-quality ${idea}`, 'Personalized service', 'Customer success team', 'Regular optimization', 'Results tracking'],
  ]

  const whatYouSell = whatYouSellOptions[Math.floor(Math.random() * whatYouSellOptions.length)]

  // Who you serve
  const whoYouServeOptions = [
    ['Small businesses', 'Startups', 'Entrepreneurs'],
    ['Local companies', 'Professional services', 'Growing businesses'],
    ['Individuals', 'Small business owners', 'Corporate teams'],
    ['E-commerce businesses', 'Service providers', 'Digital teams'],
  ]

  const whoYouServe = whoYouServeOptions[Math.floor(Math.random() * whoYouServeOptions.length)]

  // Revenue model
  const revenueModels = [
    'Service-based revenue with project fees and retainers',
    'Direct sales with tiered pricing for different package levels',
    'Monthly subscriptions combined with one-time implementation fees',
    'Per-project pricing with ongoing maintenance contracts',
  ]

  const revenueModel = revenueModels[Math.floor(Math.random() * revenueModels.length)]

  // Pricing
  const pricingOptions = [
    'Starting at $500/month for basic packages, scaling to $5,000+/month for premium',
    '$50-$300+ per project depending on complexity and scope',
    'Tiered pricing: Starter ($299/month), Professional ($599/month), Enterprise (custom)',
    '$2,000-$10,000+ per project, plus $500-$2,000/month for ongoing support',
  ]

  const pricing = pricingOptions[Math.floor(Math.random() * pricingOptions.length)]

  // Business plan summary
  const summaries = [
    `Year 1 will focus on establishing brand presence and acquiring initial customers through targeted marketing. We'll deliver exceptional results to build testimonials and referrals. By month 6, we'll refine our processes based on client feedback. Year 2 will focus on scaling operations and expanding service offerings.`,
    `We'll launch with a strong value proposition and focus on customer acquisition through word-of-mouth and digital marketing. First quarter targets acquiring 5-10 clients. By month 6, we'll have refined our offering based on market feedback. Months 7-12 will focus on scaling and team expansion.`,
    `Launch strategy includes direct outreach to target market, content marketing, and partnerships. We'll track key metrics and optimize pricing and service offerings quarterly. By month 6, we aim to have established a repeatable sales process. Year 2 will focus on geographic expansion or service diversification.`,
  ]

  const businessPlanSummary = summaries[Math.floor(Math.random() * summaries.length)]

  return {
    businessName,
    domain,
    businessDescription,
    whatYouSell: whatYouSell.slice(0, 5),
    whoYouServe: whoYouServe.slice(0, 4),
    revenueModel,
    pricing,
    businessPlanSummary,
  }
}

// Mock idea generator based on business category
const generateIdeasForCategory = (category: string): GeneratedIdea[] => {
  const ideas: { [key: string]: GeneratedIdea[] } = {
    service: [
      {
        id: '1',
        name: 'Virtual Assistant Service',
        description: 'Help busy professionals and entrepreneurs with administrative tasks remotely',
        serves: 'Small business owners and solopreneurs',
        revenue: 'Hourly rates or monthly retainers ($30-$100+/hour)',
      },
      {
        id: '2',
        name: 'Social Media Management',
        description: 'Create and manage social media content for small businesses',
        serves: 'Local businesses and e-commerce companies',
        revenue: 'Monthly service packages ($500-$3,000+/month)',
      },
      {
        id: '3',
        name: 'Freelance Writing',
        description: 'Write content for blogs, websites, and marketing materials',
        serves: 'Marketing agencies and online businesses',
        revenue: 'Per-project or retainer ($0.10-$1+/word or $2,000+/month)',
      },
    ],
    online: [
      {
        id: '4',
        name: 'Digital Course Creator',
        description: 'Create and sell online courses teaching skills you know',
        serves: 'People wanting to learn new skills online',
        revenue: 'Course sales ($29-$299 per course)',
      },
      {
        id: '5',
        name: 'E-commerce Store',
        description: 'Sell products online through your own storefront',
        serves: 'Consumers interested in niche products',
        revenue: 'Product sales with 30-70% margins',
      },
      {
        id: '6',
        name: 'SaaS Tool',
        description: 'Build software that solves a specific problem for businesses',
        serves: 'Companies needing workflow solutions',
        revenue: 'Monthly subscriptions ($9-$99+/month per user)',
      },
    ],
    local: [
      {
        id: '7',
        name: 'Pressure Washing Service',
        description: 'Clean driveways, patios, and commercial properties',
        serves: 'Homeowners and local businesses',
        revenue: 'Per-job fees ($150-$500+) or monthly contracts',
      },
      {
        id: '8',
        name: 'Pet Sitting & Dog Walking',
        description: 'Care for pets while owners are away or busy',
        serves: 'Pet owners in your local area',
        revenue: 'Per-visit rates ($15-$50+ per visit)',
      },
      {
        id: '9',
        name: 'Home Cleaning Service',
        description: 'Provide residential or commercial cleaning services',
        serves: 'Busy professionals and businesses',
        revenue: 'Per-clean fees ($100-$300+) or monthly subscriptions',
      },
    ],
    product: [
      {
        id: '10',
        name: 'Handmade Crafts Shop',
        description: 'Create and sell handmade products on Etsy or your own site',
        serves: 'Consumers looking for unique, artisanal products',
        revenue: 'Product sales with 50-80% margins',
      },
      {
        id: '11',
        name: 'Print-on-Demand Products',
        description: 'Design and sell custom t-shirts, mugs, and merchandise',
        serves: 'People wanting personalized or niche products',
        revenue: 'Product markup ($5-$30+ per item)',
      },
      {
        id: '12',
        name: 'Digital Products',
        description: 'Create templates, presets, or design tools to sell',
        serves: 'Creators and professionals needing tools',
        revenue: 'Digital product sales ($9-$99+ per product)',
      },
    ],
    professional: [
      {
        id: '13',
        name: 'Consulting Business',
        description: 'Advise companies in your area of expertise',
        serves: 'Businesses needing specialized guidance',
        revenue: 'Project fees ($2,000-$10,000+) or hourly rates ($100-$300+/hour)',
      },
      {
        id: '14',
        name: 'Coaching Practice',
        description: 'Coach clients on career, life, or business goals',
        serves: 'Individuals wanting personal guidance',
        revenue: 'Monthly coaching ($500-$2,000+) or packages',
      },
      {
        id: '15',
        name: 'Training & Workshops',
        description: 'Teach workshops and training programs in your field',
        serves: 'Professionals wanting skill development',
        revenue: 'Workshop fees ($500-$5,000+) or per-participant rates',
      },
    ],
  }

  return ideas[category] || []
}

export function IdeaCreator({ onIdeaSelected, isLoading = false }: IdeaCreatorProps) {
  const [step, setStep] = useState<'initial' | 'category' | 'ideas' | 'custom' | 'foundation'>('initial')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])
  const [customIdea, setCustomIdea] = useState('')
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [foundation, setFoundation] = useState<BusinessFoundation | null>(null)

  const categories = [
    { id: 'service', label: 'Service Business', icon: '💼' },
    { id: 'online', label: 'Online Business', icon: '🌐' },
    { id: 'local', label: 'Local Business', icon: '📍' },
    { id: 'product', label: 'Product Business', icon: '📦' },
    { id: 'professional', label: 'Professional Business', icon: '👨‍💼' },
    { id: 'notsure', label: 'Not Sure', icon: '🤔' },
  ]

  const handleHaveIdea = () => {
    setStep('custom')
  }

  const handleNeedHelp = () => {
    setStep('category')
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (categoryId === 'notsure') {
      const allIdeas = Object.values(generateIdeasForCategory('')).flat()
      setGeneratedIdeas(allIdeas.slice(0, 3))
    } else {
      const ideas = generateIdeasForCategory(categoryId)
      setGeneratedIdeas(ideas.slice(0, 3))
    }
    setStep('ideas')
  }

  const handleUseIdea = (idea: GeneratedIdea) => {
    const ideaText = idea.name
    setSelectedIdea(ideaText)
    const generated = generateFoundation(ideaText)
    setFoundation(generated)
    setStep('foundation')
  }

  const handleSubmitCustom = () => {
    if (customIdea.trim()) {
      setSelectedIdea(customIdea.trim())
      const generated = generateFoundation(customIdea.trim())
      setFoundation(generated)
      setStep('foundation')
    }
  }

  const handleApproveFoundation = () => {
    if (selectedIdea) {
      onIdeaSelected(selectedIdea)
    }
  }

  const handleRegenerate = () => {
    if (selectedIdea) {
      const generated = generateFoundation(selectedIdea)
      setFoundation(generated)
    }
  }

  const handleEditIdea = () => {
    setStep('custom')
    setSelectedIdea(null)
    setFoundation(null)
    setCustomIdea('')
  }

  const handleBackFromIdeas = () => {
    setStep('category')
    setSelectedCategory(null)
    setGeneratedIdeas([])
  }

  const handleBackToInitial = () => {
    setStep('initial')
    setCustomIdea('')
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-6">
              <h2 className="text-3xl font-bold text-white">What kind of business do you want to create?</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={handleHaveIdea}
                  className="rounded-lg border-2 border-white/10 bg-white/[0.02] p-6 text-left hover:border-sky-400 hover:bg-sky-400/5 transition"
                >
                  <div className="text-3xl mb-3">💡</div>
                  <h3 className="font-semibold text-white mb-2">I already have an idea</h3>
                  <p className="text-sm text-slate-400">I know what I want to build</p>
                </button>

                <button
                  onClick={handleNeedHelp}
                  className="rounded-lg border-2 border-white/10 bg-white/[0.02] p-6 text-left hover:border-sky-400 hover:bg-sky-400/5 transition"
                >
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="font-semibold text-white mb-2">Help me create an idea</h3>
                  <p className="text-sm text-slate-400">I need ideas and inspiration</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Describe your idea in one sentence</h2>
                <p className="text-slate-400 text-sm">Be specific about what you'd offer and who you'd help</p>
              </div>

              <textarea
                value={customIdea}
                onChange={(e) => setCustomIdea(e.target.value)}
                placeholder="E.g., I want to start a pressure washing service for homeowners and small businesses in my area."
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none transition resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleBackToInitial}
                  className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitCustom}
                  disabled={!customIdea.trim() || isLoading}
                  className="flex-1 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Build My Idea
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-6">
              <h2 className="text-2xl font-bold text-white">What type of business interests you?</h2>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="rounded-lg border-2 border-white/10 bg-white/[0.02] p-4 text-left hover:border-sky-400 hover:bg-sky-400/5 transition group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition">{cat.icon}</div>
                    <p className="font-medium text-white text-sm">{cat.label}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleBackToInitial}
                className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}

        {step === 'ideas' && (
          <motion.div
            key="ideas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Here are 3 ideas for you</h2>

            <div className="space-y-4">
              {generatedIdeas.map((idea, idx) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur hover:border-sky-400/30 transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{idea.name}</h3>
                      <p className="text-slate-400 text-sm mb-3">{idea.description}</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-white"><span className="text-slate-400">Who it serves:</span> {idea.serves}</p>
                        <p className="text-white"><span className="text-slate-400">Revenue model:</span> {idea.revenue}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUseIdea(idea)}
                    disabled={isLoading}
                    className="w-full rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Use This Idea
                  </button>
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleBackFromIdeas}
              className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Back to Categories
            </button>
          </motion.div>
        )}

        {step === 'foundation' && foundation && (
          <motion.div
            key="foundation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Business Foundation is Ready</h2>
              <p className="text-slate-400">Review the generated foundation for your business idea</p>
            </div>

            {/* Business Foundation Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur space-y-8">
              {/* Business Name */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Business Name</h3>
                <p className="text-2xl font-bold text-white">{foundation.businessName}</p>
              </div>

              {/* Domain */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Recommended Domain</h3>
                <p className="text-lg text-sky-400 font-mono">{foundation.domain}</p>
              </div>

              {/* Business Description */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Business Description</h3>
                <p className="text-white leading-relaxed">{foundation.businessDescription}</p>
              </div>

              {/* What You Sell */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">What You Sell</h3>
                <ul className="space-y-2">
                  {foundation.whatYouSell.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-sky-400 font-bold mt-0.5">•</span>
                      <span className="text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Who You Serve */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Who You Serve</h3>
                <ul className="space-y-2">
                  {foundation.whoYouServe.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-sky-400 font-bold mt-0.5">•</span>
                      <span className="text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Revenue Model */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Revenue Model</h3>
                <p className="text-white">{foundation.revenueModel}</p>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Simple Pricing</h3>
                <p className="text-white">{foundation.pricing}</p>
              </div>

              {/* Business Plan Summary */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Business Plan Summary</h3>
                <p className="text-white leading-relaxed">{foundation.businessPlanSummary}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleEditIdea}
                className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition flex items-center justify-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Idea
              </button>
              <button
                onClick={handleRegenerate}
                className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                onClick={handleApproveFoundation}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Approve Foundation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
