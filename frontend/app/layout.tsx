import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sage - Your Brutally Honest AI Mentor',
  description: 'AI mentor that calls out your BS and helps you actually ship',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#111827',
          colorInputBackground: '#1f2937',
          colorInputText: '#f9fafb',
        },
        elements: {
          formButtonPrimary: 
            'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
          card: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-gray-800 border-gray-700 hover:bg-gray-700',
          formFieldInput: 'bg-gray-800 border-gray-700 text-white',
          footerActionLink: 'text-blue-400 hover:text-blue-300',
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}