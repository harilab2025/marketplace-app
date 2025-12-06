'use client'

import { useState, useEffect } from 'react'
import { Home, ArrowLeft, Rocket } from 'lucide-react'

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([])
  const [astronautPos, setAstronautPos] = useState({ x: 50, y: 50 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Generate stars
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.5 + 0.1
    }))
    setStars(newStars)

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Animate astronaut following mouse with delay
    const timer = setTimeout(() => {
      setAstronautPos({
        x: mousePos.x * 0.1 + 45,
        y: mousePos.y * 0.1 + 45
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [mousePos, isClient])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-center max-w-4xl px-4">
          <div className="w-32 h-40 bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl mx-auto mb-8 relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-blue-200 to-blue-300 rounded-full" />
          </div>
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
            404
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Lost in Space
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {`Oops! It looks like you've drifted too far into the cosmic void.`}
            {`The page you're looking for has floated away into another dimension.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-slate-200 rounded-2xl font-semibold"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold"
            >
              <Home className="w-5 h-5 inline mr-2" />
              Return to Earth
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black overflow-hidden relative">
      {/* Animated stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${2 + star.speed}s ease-in-out infinite alternate`
          }}
        />
      ))}

      {/* Planets in background */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-600 rounded-full opacity-60 blur-sm animate-pulse" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-40 blur-sm animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-teal-600 rounded-full opacity-50 blur-sm animate-pulse delay-500" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          {/* Floating astronaut */}
          <div
            className="relative mb-8 transition-all duration-1000 ease-out"
            style={{
              transform: `translate(${(astronautPos.x - 50) * 0.5}px, ${Math.sin(Date.now() / 1000) * 10}px)`
            }}
          >
            <div className="relative inline-block">
              {/* Astronaut body */}
              <div className="w-32 h-40 bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl mx-auto relative shadow-2xl">
                {/* Helmet */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-blue-200 to-blue-300 rounded-full shadow-inner">
                  <div className="absolute inset-2 bg-gradient-to-b from-cyan-100 to-blue-100 rounded-full opacity-80" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-pink-200 rounded-full" />
                  <div className="absolute top-6 left-6 w-2 h-2 bg-black rounded-full" />
                  <div className="absolute top-6 right-6 w-2 h-2 bg-black rounded-full" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-pink-400 rounded-full" />
                </div>

                {/* Body details */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-red-400 to-red-600 rounded-2xl" />
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full shadow-inner" />

                {/* Arms */}
                <div className="absolute top-12 -left-4 w-8 h-16 bg-gray-300 rounded-full transform -rotate-12" />
                <div className="absolute top-12 -right-4 w-8 h-16 bg-gray-300 rounded-full transform rotate-12" />

                {/* Legs */}
                <div className="absolute -bottom-2 left-6 w-6 h-12 bg-gray-300 rounded-full" />
                <div className="absolute -bottom-2 right-6 w-6 h-12 bg-gray-300 rounded-full" />
              </div>

              {/* Floating effect */}
              <div className="absolute inset-0 bg-gradient-radial from-cyan-400/20 to-transparent rounded-full animate-ping" />
            </div>
          </div>

          {/* 404 with glitch effect */}
          <div className="relative mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse relative">
              404
              {/* Glitch layers */}
              <span className="absolute inset-0 text-red-500 opacity-30 animate-ping" style={{ left: '2px' }}>404</span>
              <span className="absolute inset-0 text-blue-500 opacity-30 animate-ping" style={{ left: '-2px', animationDelay: '0.1s' }}>404</span>
            </h1>
          </div>

          {/* Message */}
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Lost in Space
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              {`Oops! It looks like you've drifted too far into the cosmic void.`}
              {`The page you're looking for has floated away into another dimension.`}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => window.history.back()}
              className="group relative px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-slate-200 rounded-2xl font-semibold transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Go Back
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Return to Earth
              </div>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="group relative px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-slate-200 rounded-2xl font-semibold transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Try Again
              </div>
            </button>
          </div>

          {/* Fun message */}
          <p className="mt-8 text-slate-500 text-sm">
            💫 {`Fun fact: You're now officially a space explorer!`}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  )
}