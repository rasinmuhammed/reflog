'use client'

import { useState } from 'react'
import Dashboard from '../components/Dashboard'
import Onboarding from '../components/Onboarding'

export default function Home() {
  const [githubUsername, setGithubUsername] = useState<string | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)

  const handleOnboardingComplete = (username: string) => {
    setGithubUsername(username)
    setIsOnboarded(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {!isOnboarded ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <Dashboard githubUsername={githubUsername!} />
      )}
    </main>
  )
}