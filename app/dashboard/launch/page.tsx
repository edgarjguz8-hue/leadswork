'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { Loader } from 'lucide-react'

export default function LaunchPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.push('/sign-in')
      return
    }

    handleLaunchFlow()
  }, [session, isPending])

  const handleLaunchFlow = async () => {
    try {
      // Check for existing launch
      const listResponse = await fetch('/api/launch/list')
      if (listResponse.ok) {
        const listData = await listResponse.json()
        if (listData.launches && listData.launches.length > 0) {
          // Use existing launch
          const activeLaunch = listData.launches.find((l: any) => l.status === 'in_progress') || listData.launches[0]
          router.push(`/dashboard/launch/${activeLaunch.id}`)
          return
        }
      }

      // No existing launch, create a new one automatically
      console.log('[v0] Creating new launch...')
      const response = await fetch('/api/launch/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'My Business',
          businessType: 'startup',
          description: 'Building something great',
          industry: 'technology',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Launch created:', data.launchId)
        router.push(`/dashboard/launch/${data.launchId}`)
      } else {
        console.error('[v0] Failed to create launch')
      }
    } catch (error) {
      console.error('[v0] Error in launch flow:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
      <div className="text-center">
        <Loader className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400">Preparing your launch...</p>
      </div>
    </div>
  )
}
