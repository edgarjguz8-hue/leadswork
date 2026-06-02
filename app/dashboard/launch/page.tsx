'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { LaunchOnboarding } from './onboarding'
import { Loader } from 'lucide-react'

export default function LaunchPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [hasExistingLaunch, setHasExistingLaunch] = useState<boolean | null>(null)

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.push('/sign-in')
      return
    }

    checkForExistingLaunch()
  }, [session, isPending, router])

  const checkForExistingLaunch = async () => {
    try {
      const response = await fetch('/api/launch/list')
      if (response.ok) {
        const data = await response.json()
        // If user has existing launches, show them the onboarding to create a new one
        // (they can access existing ones from the dashboard)
        setHasExistingLaunch(false)
      } else {
        setHasExistingLaunch(false)
      }
    } catch (error) {
      console.error('[v0] Error checking for existing launch:', error)
      setHasExistingLaunch(false)
    }
  }

  if (isPending || hasExistingLaunch === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-center">
          <Loader className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return <LaunchOnboarding />
}
