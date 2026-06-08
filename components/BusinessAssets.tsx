import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Edit, Eye, Lock } from 'lucide-react'

interface Asset {
  id: string
  type: string
  title: string
  content?: string
  isApproved: boolean
  lastUpdatedAt: string
}

const ASSET_DEFINITIONS = [
  {
    type: 'foundation',
    title: 'Business Foundation',
    icon: '📋',
    description: 'Core business details and strategy',
  },
  {
    type: 'brand',
    title: 'Brand Kit',
    icon: '🎨',
    description: 'Brand identity and guidelines',
  },
  {
    type: 'packages',
    title: 'Service Packages',
    icon: '📦',
    description: 'Service offerings and pricing',
  },
  {
    type: 'website',
    title: 'Website',
    icon: '🌐',
    description: 'Website content and structure',
  },
  {
    type: 'contact',
    title: 'Contact Form',
    icon: '📧',
    description: 'Contact information and forms',
  },
  {
    type: 'plan',
    title: 'Launch Plan',
    icon: '🚀',
    description: 'Launch timeline and checklist',
  },
]

interface BusinessAssetsProps {
  launchId: string
  assets: Asset[]
  onAssetUpdated?: () => void
}

export function BusinessAssets({ launchId, assets, onAssetUpdated }: BusinessAssetsProps) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  const getAssetByType = (type: string) => {
    return assets.find(a => a.type === type)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleViewAsset = (asset: Asset) => {
    // Open modal or navigate to view asset
    console.log('[v0] Viewing asset:', asset.id)
  }

  const handleEditAsset = (asset: Asset) => {
    // Open modal or navigate to edit asset
    console.log('[v0] Editing asset:', asset.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-12"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Business Assets</h3>
        <p className="text-sm text-slate-400">Approved content from each step of your launch</p>
      </div>

      <div className="grid gap-3">
        {ASSET_DEFINITIONS.map((definition, index) => {
          const asset = getAssetByType(definition.type)

          return (
            <motion.div
              key={definition.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className={`rounded-lg border transition flex items-center gap-4 p-4 ${
                asset
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                  : 'border-slate-700/50 bg-slate-800/20 hover:border-slate-600/50'
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {asset && asset.isApproved ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                ) : asset ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <span className="text-lg">{definition.icon}</span>
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{definition.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{definition.description}</p>
                {asset && (
                  <p className="text-xs text-slate-500 mt-1">
                    Last updated: {formatDate(asset.lastUpdatedAt)}
                  </p>
                )}
              </div>

              {/* Status Badge and Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {asset && asset.isApproved && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                    Approved
                  </span>
                )}
                {asset && !asset.isApproved && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    Pending
                  </span>
                )}
                {!asset && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700/30 text-slate-400">
                    Not Started
                  </span>
                )}

                {/* Action Buttons */}
                {asset && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleViewAsset(asset)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
                      title="View asset"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditAsset(asset)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
                      title="Edit asset"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {assets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 rounded-lg border border-slate-700/30 bg-slate-800/10 p-8 text-center"
        >
          <p className="text-sm text-slate-400 mb-2">No assets created yet</p>
          <p className="text-xs text-slate-500">
            Complete steps in your launch workflow to create and approve business assets
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
