'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Copy, Check } from 'lucide-react'

interface AIToolModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  toolId: string
  section: string
  businessContext?: string
  onInsert?: (content: string) => void
}

export function AIToolModal({
  isOpen,
  onClose,
  toolName,
  toolId,
  section,
  businessContext = '',
  onInsert,
}: AIToolModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generateContent = async () => {
    setLoading(true)
    setError('')
    setContent('')

    try {
      const response = await fetch(
        `/api/launch/ai-tools/${section}/${toolId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessContext }),
        }
      )

      if (!response.ok) throw new Error('Failed to generate content')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        setContent((prev) => prev + text)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate content'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-xl shadow-2xl flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-400/10 p-2">
                    <Sparkles className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {toolName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      AI-powered generation
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 hover:bg-white/10 transition text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {!content && !loading && !error && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-sky-400/10 p-4 mb-4">
                      <Sparkles className="h-8 w-8 text-sky-400" />
                    </div>
                    <p className="text-white font-medium mb-2">
                      Ready to generate content?
                    </p>
                    <p className="text-sm text-slate-400 mb-6">
                      Click generate to let AI create tailored content for you
                    </p>
                    <button
                      onClick={generateContent}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-3 text-sm font-medium text-[#0a1220] hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Content
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative h-12 w-12 mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-12 w-12 rounded-full border-2 border-sky-400/20 border-t-sky-400"
                      />
                    </div>
                    <p className="text-white font-medium">Generating content...</p>
                    <p className="text-sm text-slate-400 mt-2">
                      This should take about 10-30 seconds
                    </p>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4">
                    <p className="text-red-400 font-medium">Error</p>
                    <p className="text-sm text-red-400/80 mt-1">{error}</p>
                    <button
                      onClick={generateContent}
                      className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {content && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-invert max-w-none"
                  >
                    <div className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed">
                      {content}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              {content && (
                <div className="border-t border-white/10 p-6 flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 hover:bg-white/[0.06] transition font-medium text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </button>
                  {onInsert && (
                    <button
                      onClick={() => {
                        onInsert(content)
                        onClose()
                      }}
                      className="flex-1 rounded-lg bg-sky-400 px-4 py-3 hover:bg-sky-300 transition font-medium text-[#0a1220]"
                    >
                      Insert Content
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
