'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Check } from 'lucide-react'

interface IdeaCreatorProps {
  onIdeaSelected: (idea: string, category?: string) => void
  isLoading?: boolean
}

interface GeneratedIdea {
  id: string
  name: string
  description: string
  serves: string
  revenue: string
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
  const [step, setStep] = useState<'initial' | 'category' | 'ideas' | 'custom'>('initial')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])
  const [customIdea, setCustomIdea] = useState('')

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
      // Show ideas from all categories
      const allIdeas = Object.values(generateIdeasForCategory('')).flat()
      setGeneratedIdeas(allIdeas.slice(0, 3))
    } else {
      const ideas = generateIdeasForCategory(categoryId)
      setGeneratedIdeas(ideas.slice(0, 3))
    }
    setStep('ideas')
  }

  const handleUseIdea = (idea: GeneratedIdea) => {
    onIdeaSelected(idea.name)
  }

  const handleSubmitCustom = () => {
    if (customIdea.trim()) {
      onIdeaSelected(customIdea.trim())
    }
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
      </AnimatePresence>
    </div>
  )
}
