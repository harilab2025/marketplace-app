'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; opacity: number }>>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Create floating particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2
    }))
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + 100) % 100,
        y: (particle.y + particle.vy + 100) % 100,
        opacity: Math.sin(Date.now() * 0.001 + particle.id) * 0.3 + 0.5
      })))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <AlertTriangle className="w-24 h-24 text-red-400 mx-auto mb-8" />
          <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Oops! Something Broke
          </h1>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
            <p className="text-slate-300 mb-2 text-lg">We encountered an unexpected error</p>
            <p className="text-slate-400 text-sm font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-600/30">
              {error.message || 'An unknown error occurred'}
            </p>
            {error.digest && (
              <p className="text-slate-500 text-xs mt-2">Error ID: {error.digest}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-slate-600/30 rounded-2xl font-semibold transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50"
            >
              <Home className="w-5 h-5 inline mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative flex items-center justify-center">
      {/* Animated background particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-purple-400 rounded-full blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* Glowing orb background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Error icon with glitch effect */}
        <div className="relative mb-8">
          <div className="relative inline-block">
            <AlertTriangle className="w-24 h-24 text-red-400 animate-pulse" />
            <div className="absolute inset-0 w-24 h-24 text-red-600 animate-ping opacity-20">
              <AlertTriangle className="w-full h-full" />
            </div>
          </div>

          {/* Glitch bars */}
          <div className="absolute -left-4 top-8 w-8 h-1 bg-red-500 animate-pulse" />
          <div className="absolute -right-6 top-12 w-12 h-1 bg-purple-500 animate-pulse delay-300" />
          <div className="absolute -left-2 bottom-6 w-6 h-1 bg-blue-500 animate-pulse delay-700" />
        </div>

        {/* Error title with typing effect */}
        <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Oops! Something Broke
        </h1>

        {/* Error message */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
          <p className="text-slate-300 mb-2 text-lg">We encountered an unexpected error</p>
          <p className="text-slate-400 text-sm font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-600/30">
            {error.message || 'An unknown error occurred'}
          </p>
          {error.digest && (
            <p className="text-slate-500 text-xs mt-2">Error ID: {error.digest}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="group relative px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="group px-8 py-4 bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-slate-600/30 rounded-2xl font-semibold transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Go Home
            </div>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}