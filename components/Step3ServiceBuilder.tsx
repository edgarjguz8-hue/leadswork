'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, Edit2, Trash2 } from 'lucide-react'

interface ServicePackage {
  id: string
  name: string
  description: string
  price: string
  features: string[]
}

interface ServiceData {
  valueProposition: string
  customerBenefits: string
  packages: ServicePackage[]
}

interface Step3ServiceBuilderProps {
  launchId: string
  launchName: string
  onComplete: (serviceData: ServiceData) => void
}

export function Step3ServiceBuilder({
  launchId,
  launchName,
  onComplete,
}: Step3ServiceBuilderProps) {
  const [stage, setStage] = useState<'idle' | 'generating' | 'reviewing' | 'completed'>('idle')
  const [serviceData, setServiceData] = useState<ServiceData>({
    valueProposition: '',
    customerBenefits: '',
    packages: [],
  })
  const [editValues, setEditValues] = useState<Partial<ServiceData>>({})
  const [editingField, setEditingField] = useState<keyof ServiceData | null>(null)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`step3-${launchId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.serviceData) {
          setServiceData(parsed.serviceData)
          setStage('reviewing')
        }
      } catch (error) {
        console.error('[v0] Error loading saved service data:', error)
      }
    }
  }, [launchId])

  const handleGenerateServices = async () => {
    try {
      setStage('generating')
      setErrorMessage(null)

      const response = await fetch('/api/launch/generate-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launchName,
          launchId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate services')
      }

      const data = await response.json()
      console.log('[v0] Services generated:', data)

      if (data.services) {
        setServiceData(data.services)
        setStage('reviewing')
        // Save to localStorage
        localStorage.setItem(`step3-${launchId}`, JSON.stringify({
          stage: 'reviewing',
          serviceData: data.services,
        }))
      }
    } catch (error) {
      console.error('[v0] Error generating services:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate services')
      setStage('idle')
    }
  }

  const handleEditField = (field: 'valueProposition' | 'customerBenefits') => {
    setEditingField(field)
    setEditValues({ [field]: serviceData[field] })
  }

  const handleSaveEdit = (field: 'valueProposition' | 'customerBenefits') => {
    const newValue = editValues[field]
    if (newValue !== undefined) {
      setServiceData(prev => ({
        ...prev,
        [field]: newValue,
      }))
      setEditingField(null)
      setEditValues({})
    }
  }

  const handleEditPackage = (pkg: ServicePackage) => {
    setEditingPackageId(pkg.id)
    setEditValues(pkg)
  }

  const handleSavePackage = () => {
    if (!editingPackageId) return
    const updatedPackage = editValues as ServicePackage
    setServiceData(prev => ({
      ...prev,
      packages: prev.packages.map(pkg =>
        pkg.id === editingPackageId ? updatedPackage : pkg
      ),
    }))
    setEditingPackageId(null)
    setEditValues({})
  }

  const handleDeletePackage = (id: string) => {
    setServiceData(prev => ({
      ...prev,
      packages: prev.packages.filter(pkg => pkg.id !== id),
    }))
  }

  const handleApproveServices = async () => {
    // Apply any edits made before approval
    const finalData = {
      ...serviceData,
      ...editValues,
    }
    setServiceData(finalData)

    // Save to localStorage
    localStorage.setItem(`step3-${launchId}`, JSON.stringify({
      stage: 'completed',
      serviceData: finalData,
      approvedAt: new Date().toISOString(),
    }))

    // Save to Business Assets in database
    try {
      const assetContent = JSON.stringify({
        valueProposition: finalData.valueProposition,
        customerBenefits: finalData.customerBenefits,
        packages: finalData.packages,
      })

      await fetch(`/api/launch/${launchId}/asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'packages',
          title: 'Service Packages',
          content: assetContent,
          isApproved: true,
        }),
      })

      console.log('[v0] Services saved to assets')
    } catch (error) {
      console.error('[v0] Failed to save services to assets:', error)
    }

    setStage('completed')
    onComplete(finalData)
  }

  return (
    <div className="space-y-6">
      {stage === 'idle' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleGenerateServices}
          disabled={errorMessage !== null}
          className="w-full rounded-lg border border-sky-500/30 bg-sky-500/10 px-6 py-3 text-sm font-medium text-sky-400 hover:bg-sky-500/20 transition disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4 inline mr-2" />
          Generate Service Packages
        </motion.button>
      )}

      {stage === 'generating' && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Generating your service packages...</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      {(stage === 'reviewing' || stage === 'completed') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Value Proposition */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Value Proposition</h4>
              {stage !== 'completed' && (
                <button
                  onClick={() => handleEditField('valueProposition')}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.05] transition"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {editingField === 'valueProposition' ? (
              <div className="flex gap-2">
                <textarea
                  value={editValues.valueProposition || ''}
                  onChange={(e) => setEditValues({ ...editValues, valueProposition: e.target.value })}
                  className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSaveEdit('valueProposition')}
                    className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white text-sm">{serviceData.valueProposition}</p>
            )}
          </div>

          {/* Customer Benefits */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Customer Benefits</h4>
              {stage !== 'completed' && (
                <button
                  onClick={() => handleEditField('customerBenefits')}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.05] transition"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {editingField === 'customerBenefits' ? (
              <div className="flex gap-2">
                <textarea
                  value={editValues.customerBenefits || ''}
                  onChange={(e) => setEditValues({ ...editValues, customerBenefits: e.target.value })}
                  className="flex-1 rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSaveEdit('customerBenefits')}
                    className="p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white text-sm">{serviceData.customerBenefits}</p>
            )}
          </div>

          {/* Service Packages Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Service Packages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {serviceData.packages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 space-y-3"
                  >
                    {editingPackageId === pkg.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editValues.name || ''}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          placeholder="Package name"
                          className="w-full rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400"
                        />
                        <input
                          type="text"
                          value={editValues.price || ''}
                          onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                          placeholder="Price"
                          className="w-full rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400"
                        />
                        <textarea
                          value={editValues.description || ''}
                          onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                          placeholder="Description"
                          className="w-full rounded-lg border border-sky-400/50 bg-white/[0.05] px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePackage}
                            className="flex-1 p-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPackageId(null)}
                            className="flex-1 p-2 rounded-lg bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 transition text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-white">{pkg.name}</h5>
                            <p className="text-lg font-bold text-sky-400 mt-1">{pkg.price}</p>
                          </div>
                          {stage !== 'completed' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditPackage(pkg)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.05] transition"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-300">{pkg.description}</p>
                        {pkg.features.length > 0 && (
                          <ul className="space-y-1">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-sky-400" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Approve Button */}
          {stage === 'reviewing' && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleApproveServices}
              className="w-full rounded-lg border border-purple-500/30 bg-purple-500/20 px-6 py-3 text-sm font-medium text-purple-400 hover:bg-purple-500/30 transition"
            >
              <Check className="h-4 w-4 inline mr-2" />
              Approve Services
            </motion.button>
          )}

          {stage === 'completed' && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
              <p className="text-sm font-medium text-emerald-400">
                <Check className="h-4 w-4 inline mr-2" />
                Services approved and saved
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
