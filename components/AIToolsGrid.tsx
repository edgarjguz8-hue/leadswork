'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { AIToolModal } from './AIToolModal'
import { aiToolsConfig } from '@/lib/ai-tools-config'

interface AIToolsGridProps {
  section: keyof typeof aiToolsConfig
  businessContext?: string
  title?: string
  showAsButtons?: boolean
}

export function AIToolsGrid({
  section,
  businessContext = '',
  title,
  showAsButtons = false,
}: AIToolsGridProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const tools = aiToolsConfig[section]

  const selectedToolData = tools.find((t: any) => t.id === selectedTool)

  if (showAsButtons) {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool: any) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedTool(tool.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] border border-white/10 hover:border-sky-400/30 px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.08] transition"
            >
              <Sparkles className="h-3 w-3 text-sky-400" />
              {tool.name}
            </motion.button>
          ))}
        </div>

        {selectedToolData && (
          <AIToolModal
            isOpen={!!selectedTool}
            onClose={() => setSelectedTool(null)}
            toolName={selectedToolData.name}
            toolId={selectedTool!}
            section={section}
            businessContext={businessContext}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {title && (
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
            {title}
          </h3>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool: any, idx: number) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedTool(tool.id)}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-sky-400/30 hover:bg-white/[0.06] transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-lg bg-sky-400/10 p-2 group-hover:bg-sky-400/20 transition">
                  <Sparkles className="h-4 w-4 text-sky-400" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-sky-400 transition" />
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">
                {tool.name}
              </h4>
              <p className="text-xs text-slate-400">{tool.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedToolData && (
        <AIToolModal
          isOpen={!!selectedTool}
          onClose={() => setSelectedTool(null)}
          toolName={selectedToolData.name}
          toolId={selectedTool!}
          section={section}
          businessContext={businessContext}
        />
      )}
    </>
  )
}
