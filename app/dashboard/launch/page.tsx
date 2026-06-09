'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { Loader } from 'lucide-react'
import { nanoid } from 'nanoid'

export default function LaunchPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.push('/sign-in')
      return
    }

    // Automatically create a default launch and redirect to dashboard
    createDefaultLaunchAndRedirect()
  }, [session, isPending, router])

  const createDefaultLaunchAndRedirect = async () => {
    try {
      const launchId = nanoid()
      console.log('[v0] Creating default launch:', launchId)
      
      const response = await fetch('/api/launch/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Untitled Business',
          businessType: '',
          industry: '',
          description: '',
          targetMarket: '',
          businessGoal: '',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[v0] Launch created:', result.launchId)
        router.push(`/dashboard/launch/${result.launchId}`)
      } else {
        console.error('[v0] Failed to create launch:', response.status)
        // Fallback: still redirect to allow dashboard to load with local state
        router.push(`/dashboard/launch/${launchId}`)
      }
    } catch (error) {
      console.error('[v0] Error creating launch:', error)
      // Fallback: redirect anyway - dashboard will handle with local state
      const fallbackId = nanoid()
      router.push(`/dashboard/launch/${fallbackId}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
      <div className="text-center">
        <Loader className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400">Starting your launch...</p>
      </div>
    </div>
  )
}
