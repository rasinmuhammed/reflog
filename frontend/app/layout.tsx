import type { Metadata } from 'next'
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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}