'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Check } from 'lucide-react'

interface BusinessFoundationData {
  businessName: string
  domain: string
  businessDescription: string
  whoYouServe: string[] // bullet list
  whatYouSell: string[] // bullet list
  revenueModel: string
  pricing: string
  businessPlanSummary: string
}

interface BusinessFoundationProps {
  data?: BusinessFoundationData
  isApproved?: boolean
  isLoading?: boolean
  onApprove: () => void
  onRegenerate: () => void
  onEditIdea: () => void
}

export function BusinessFoundation({
  data,
  isApproved = false,
  isLoading = false,
  onApprove,
  onRegenerate,
  onEditIdea,
}: BusinessFoundationProps) {
  if (isApproved) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6"
      >
        <div className="flex items-start gap-3">
          <Check className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-white">Business Foundation Approved</h3>
            <p className="text-sm text-slate-400 mt-1">
              Your business foundation is ready. Move to Step 2 to continue building your launch plan.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden backdrop-blur"
    >
      {/* Content - Single Vertical Card */}
      <div className="p-8 space-y-8">
        {/* Business Name */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Business Name
          </h3>
          <p className="text-2xl font-bold text-white">{data.businessName}</p>
        </div>

        {/* Domain */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Recommended Domain
          </h3>
          <p className="text-base text-white">{data.domain}</p>
        </div>

        {/* Business Description */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Business Description
          </h3>
          <p className="text-base text-white leading-relaxed">{data.businessDescription}</p>
        </div>

        {/* Who You Serve */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Who You Serve
          </h3>
          <ul className="space-y-2">
            {data.whoYouServe.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-sky-400 font-semibold mt-0.5">•</span>
                <span className="text-white">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What You Sell */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">
            What You Sell
          </h3>
          <ul className="space-y-2">
            {data.whatYouSell.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-sky-400 font-semibold mt-0.5">•</span>
                <span className="text-white">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Revenue Model */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Revenue Model
          </h3>
          <p className="text-base text-white">{data.revenueModel}</p>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Pricing
          </h3>
          <p className="text-base text-white">{data.pricing}</p>
        </div>

        {/* Business Plan Summary */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Business Plan Summary
          </h3>
          <p className="text-base text-white leading-relaxed">{data.businessPlanSummary}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Actions */}
      <div className="px-8 py-6 bg-white/[0.02] flex gap-3">
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Approve Foundation
        </button>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
        <button
          onClick={onEditIdea}
          className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
        >
          Edit Idea
        </button>
      </div>
    </motion.div>
  )
}
