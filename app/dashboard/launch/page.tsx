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
  const [existingLaunchId, setExistingLaunchId] = useState<string | null>(null)

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.push('/sign-in')
      return
    }

    checkForExistingLaunch()
  }, [session, isPending])

  const checkForExistingLaunch = async () => {
    try {
      const response = await fetch('/api/launch/list')
      if (response.ok) {
        const data = await response.json()
        if (data.launches && data.launches.length > 0) {
          // Redirect to most recent active launch
          const activeLaunch = data.launches.find((l: any) => l.status === 'in_progress') || data.launches[0]
          setExistingLaunchId(activeLaunch.id)
          setHasExistingLaunch(true)
          router.push(`/dashboard/launch/${activeLaunch.id}`)
        } else {
          setHasExistingLaunch(false)
        }
      } else {
        setHasExistingLaunch(false)
      }
    } catch (error) {
      console.error('Error checking for existing launch:', error)
      setHasExistingLaunch(false)
    }
  }

  if (isPending || hasExistingLaunch === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <div className="text-center">
          <Loader className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading your launches...</p>
        </div>
      </div>
    )
  }

  if (hasExistingLaunch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1220]">
        <p className="text-slate-400">Redirecting...</p>
      </div>
    )
  }

  return <LaunchOnboarding />
}
