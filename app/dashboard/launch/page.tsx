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
    const launchId = nanoid()
    console.log('[v0] Creating default launch:', launchId)
    
    // Create local launch object immediately
    const defaultLaunch = {
      id: launchId,
      userId: session?.user?.id,
      name: 'Untitled Business',
      description: '',
      businessType: '',
      industry: '',
      location: '',
      completedSteps: [],
      progress: 0,
      status: 'draft',
      isApproved: false,
      currentStep: 1,
      steps: Array.from({ length: 5 }, (_, i) => ({
        id: `step-${i + 1}`,
        stepNumber: i + 1,
        title: ['Business Foundation', 'Brand & Identity', 'Service Offerings', 'Website Builder', 'Launch Strategy'][i],
        description: '',
        isCompleted: false,
        progress: 0,
        subtasks: [],
      })),
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to localStorage immediately
    try {
      localStorage.setItem(`launch-${launchId}`, JSON.stringify(defaultLaunch))
      console.log('[v0] Launch saved to localStorage:', launchId)
    } catch (error) {
      console.error('[v0] Failed to save to localStorage:', error)
    }

    // Attempt database save in background (non-blocking)
    try {
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
        console.log('[v0] Launch created in database:', result.launchId)
      } else {
        console.warn('[v0] Database creation failed, using localStorage fallback')
      }
    } catch (error) {
      console.warn('[v0] Database creation error, using localStorage fallback:', error)
    }

    // Redirect immediately to dashboard
    router.push(`/dashboard/launch/${launchId}`)
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
