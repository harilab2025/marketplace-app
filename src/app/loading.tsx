'use client'

import { useEffect, useState } from 'react'

export default function Loading() {
  const [progress, setProgress] = useState(0)
  const [morphStage, setMorphStage] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0
        return prev + Math.random() * 3
      })
    }, 150)

    const morphInterval = setInterval(() => {
      setMorphStage(prev => (prev + 1) % 4)
    }, 1200)

    return () => {
      clearInterval(progressInterval)
      clearInterval(morphInterval)
    }
  }, [])

  const shapes = [
    'rounded-full', // Circle
    'rounded-3xl rotate-45', // Diamond
    'rounded-2xl', // Rounded square
    'rounded-none rotate-12' // Square tilted
  ]

  const colors = [
    'from-cyan-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-teal-500',
    'from-orange-400 to-red-500'
  ]

  if (!isClient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-linear-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-12 shadow-2xl" />
          <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Loading Experience
          </h2>
          <p className="text-slate-400 text-lg">Crafting something amazing...</p>
          <div className="w-80 mx-auto mt-8">
            <div className="h-3 bg-slate-700/50 rounded-full">
              <div className="h-full bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full w-0" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center">
        {/* Main morphing loader */}
        <div className="relative mb-12">
          {/* Central morphing shape */}
          <div className="relative">
            <div
              className={`w-24 h-24 bg-linear-to-br ${colors[morphStage]} ${shapes[morphStage]} transition-all duration-1000 ease-in-out shadow-2xl`}
              style={{
                boxShadow: `0 0 60px ${morphStage === 0 ? '#06b6d4' : morphStage === 1 ? '#a855f7' : morphStage === 2 ? '#10b981' : '#f97316'}40`
              }}
            />

            {/* Orbiting elements */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-white/60 rounded-full animate-spin"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-60px)`,
                  animationDuration: `${2 + i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Ripple effects */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 border-2 border-white/20 ${shapes[morphStage]} transition-all duration-1000 animate-ping`}
              style={{
                animationDuration: `${2 + i * 0.5}s`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>

        {/* Loading text with typewriter effect */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Loading Experience
          </h2>
          <p className="text-slate-400 text-lg">
            Crafting something amazing...
          </p>
        </div>

        {/* Progress bar with liquid effect */}
        <div className="w-80 mx-auto mb-8">
          <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/30">
            <div
              className="absolute left-0 top-0 h-full bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-500">
            <span>0%</span>
            <span className="text-slate-300">{Math.round(progress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Floating dots */}
        <div className="flex justify-center space-x-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-linear-to-br from-cyan-400 to-purple-500 rounded-full animate-bounce shadow-lg"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.2s'
              }}
            />
          ))}
        </div>

        {/* Status messages */}
        <div className="mt-8 h-6">
          <p className="text-slate-400 text-sm animate-pulse">
            {progress < 25 && "Initializing components..."}
            {progress >= 25 && progress < 50 && "Loading resources..."}
            {progress >= 50 && progress < 75 && "Preparing interface..."}
            {progress >= 75 && "Almost ready..."}
          </p>
        </div>
      </div>
    </div>
  )
}