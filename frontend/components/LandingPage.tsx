'use client'

import { Brain, Github, Target, TrendingUp, Zap, Shield, Users, ArrowRight, CheckCircle, MessageCircle, BookOpen, Calendar } from 'lucide-react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

export default function LandingPage() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Multi-Agent AI System",
      description: "Four specialized AI agents debate your questions to give you the most balanced advice"
    },
    {
      icon: <Github className="w-6 h-6" />,
      title: "GitHub Integration",
      description: "Analyzes your repos, commit patterns, and coding behavior to spot gaps"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Accountability Tracking",
      description: "Daily check-ins that hold you accountable to your commitments"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Pattern Recognition",
      description: "Identifies procrastination, tutorial hell, and self-sabotage patterns"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Brutally Honest Chat",
      description: "No sugar-coating. Get real feedback that actually helps you grow"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Life Decisions Log",
      description: "Track major decisions and extract lessons over time"
    }
  ]

  const testimonials = [
    {
      quote: "Finally, an AI that doesn't just validate my excuses. Sage called out my tutorial hell and I actually shipped my project.",
      author: "Alex Chen",
      role: "Full-stack Developer"
    },
    {
      quote: "The multi-agent debate feature is brilliant. You get perspectives you never considered.",
      author: "Sarah Kim",
      role: "Software Engineer"
    },
    {
      quote: "Daily check-ins keep me honest. I can't bullshit an AI that sees my GitHub activity.",
      author: "Marcus Johnson",
      role: "Indie Developer"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sage
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <button className="text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-gray-800">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Powered by Multi-Agent AI</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stop Lying to Yourself.
              </span>
              <br />
              <span className="text-white">Start Shipping.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              An AI mentor that analyzes your GitHub, calls out your BS, and holds you accountable. 
              No validation. No excuses. Just real growth.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignUpButton mode="modal">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-blue-500/50 flex items-center">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <button className="bg-gray-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-700 transition border border-gray-700">
                Watch Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                Free 14-day trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Sage is Different
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Not another productivity app. A mentor that actually challenges you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all hover:shadow-xl hover:shadow-blue-500/10 group"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <div className="text-blue-400">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get started in minutes. See results immediately.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Connect GitHub", description: "Link your GitHub account for instant analysis" },
            { step: "2", title: "Get Analyzed", description: "AI examines your repos, patterns, and behavior" },
            { step: "3", title: "Daily Check-ins", description: "Commit to specific goals every morning" },
            { step: "4", title: "Ship & Grow", description: "Track progress and extract lessons over time" }
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Developers Love Sage
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real feedback from real developers who stopped making excuses.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
            >
              <p className="text-gray-300 mb-4 leading-relaxed italic">"{testimonial.quote}"</p>
              <div>
                <p className="text-white font-semibold">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Stop Procrastinating?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join developers who are finally shipping their projects instead of collecting tutorials.
            </p>
            <SignUpButton mode="modal">
              <button className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-2xl">
                Start Free Trial Now
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2 rounded-xl">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Sage</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2025 Sage AI Mentor. No BS. Just results.
          </div>
        </div>
      </footer>
    </div>
  )
}