'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import PremiumDashboard from '@/components/features/dashboard/PremiumDashboard'
import Onboarding from '../components/features/onboarding/Onboarding'
import LandingPage from '../components/features/onboarding/LandingPage'
import { Sparkles } from 'lucide-react'

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [githubUsername, setGithubUsername] = useState<string | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check if user has completed onboarding
      const username = user.unsafeMetadata?.githubUsername as string
      if (username) {
        setGithubUsername(username)
        setIsOnboarded(true)
      }
      setCheckingOnboarding(false)
    } else if (isLoaded) {
      setCheckingOnboarding(false)
    }
  }, [isLoaded, isSignedIn, user])

  const handleOnboardingComplete = async (username: string) => {
    // Save GitHub username to Clerk user metadata
    await user?.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        githubUsername: username
      }
    })

    setGithubUsername(username)
    setIsOnboarded(true)
  }

  // Premium loading state
  if (!isLoaded || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white/50 mt-4 text-sm">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  // Show landing page if not signed in
  if (!isSignedIn) {
    return <LandingPage />
  }

  // Show onboarding if signed in but not onboarded
  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-[#0a0a0b]">
        <Onboarding onComplete={handleOnboardingComplete} />
      </main>
    )
  }

  // Show Premium Dashboard
  return <PremiumDashboard githubUsername={githubUsername!} />
}