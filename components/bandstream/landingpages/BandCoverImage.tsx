'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Band } from '@/types/bandstream'
import Image from 'next/image'
import { FaPlay, FaPause } from 'react-icons/fa'

interface BandProps {
  bandData: Band
}

const BandCoverImage: React.FC<BandProps> = ({ bandData }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isSmall, setIsSmall] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsSmall(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsSmall(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const COVER_SIZE = isSmall ? 80 : 120
  const VINYL_SIZE = isSmall ? 80 : 120
  const VINYL_SLIDE = isSmall ? 44 : 66

  const vinylOut = isHovered || isPlaying

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying((prev) => !prev)
  }

  // Detect clicks/taps outside to dismiss hover on mobile
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsHovered(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [])

  const hasMusicSample = !!bandData.musicSample
  const coverSrc = bandData.coverImage || '/images/bandstream/emptycover.jpg'
  const clipId = `vc-${bandData.domainname}`

  if (!hasMusicSample) {
    return (
      <div className="relative mx-auto mb-2 sm:mb-3" style={{ width: COVER_SIZE, height: COVER_SIZE }}>
        <Image
          src={coverSrc}
          alt={`${bandData.name} cover`}
          width={COVER_SIZE}
          height={COVER_SIZE}
          priority
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    )
  }

  return (
    <div className="flex justify-center mx-auto mb-2 sm:mb-3">
      {/* Keyframes for vinyl spin — 33 RPM = 1.818s per revolution */}
      <style>{`
        @keyframes vinyl-spin-${clipId} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        ref={containerRef}
        className="relative transition-all duration-500 ease-in-out"
        style={{
          width: vinylOut ? COVER_SIZE + VINYL_SLIDE : COVER_SIZE,
          height: COVER_SIZE,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
      >
        {/* Vinyl disc — slides out from behind the cover */}
        <div
          className="absolute top-0 transition-all duration-500 ease-in-out"
          style={{
            width: VINYL_SIZE,
            height: VINYL_SIZE,
            left: vinylOut ? COVER_SIZE - VINYL_SIZE + VINYL_SLIDE : (COVER_SIZE - VINYL_SIZE) / 2,
            opacity: vinylOut ? 1 : 0,
          }}
        >
          {/* Rotating disc — pure CSS animation */}
          <div
            className="w-full h-full rounded-full"
            style={{
              animation: `vinyl-spin-${clipId} 1.818s linear infinite`,
              animationPlayState: isPlaying ? 'running' : 'paused',
            }}
          >
            <svg
              viewBox="0 0 120 120"
              width={VINYL_SIZE}
              height={VINYL_SIZE}
              xmlns="http://www.w3.org/2000/svg"
              className="rounded-full"
              style={{ display: 'block' }}
            >
              <defs>
                <clipPath id={clipId}>
                  <circle cx="60" cy="60" r="20" />
                </clipPath>
              </defs>

              {/* Disc body */}
              <circle cx="60" cy="60" r="59" fill="#111" stroke="#333" strokeWidth="0.5" />

              {/* Grooves */}
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#222" strokeWidth="0.4" />
              <circle cx="60" cy="60" r="46" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="42" fill="none" stroke="#222" strokeWidth="0.4" />
              <circle cx="60" cy="60" r="38" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="34" fill="none" stroke="#222" strokeWidth="0.4" />
              <circle cx="60" cy="60" r="30" fill="none" stroke="#1a1a1a" strokeWidth="0.4" />

              {/* Center label with cover image */}
              <image
                href={coverSrc}
                x="40"
                y="40"
                width="40"
                height="40"
                clipPath={`url(#${clipId})`}
                preserveAspectRatio="xMidYMid slice"
              />

              {/* Label edge ring */}
              <circle cx="60" cy="60" r="20" fill="none" stroke="#444" strokeWidth="0.5" />

              {/* Central hole */}
              <circle cx="60" cy="60" r="3" fill="#080808" />
              <circle cx="60" cy="60" r="3.5" fill="none" stroke="#333" strokeWidth="0.3" />
            </svg>
          </div>

          {/* Static sheen overlay (doesn't rotate) */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <svg viewBox="0 0 120 120" width={VINYL_SIZE} height={VINYL_SIZE}>
              <defs>
                <clipPath id={`sheen-clip-${clipId}`}>
                  <circle cx="60" cy="60" r="59" />
                </clipPath>
                <linearGradient id={`sheen-${clipId}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="35%" stopColor="white" stopOpacity="0.07" />
                  <stop offset="65%" stopColor="white" stopOpacity="0.07" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g clipPath={`url(#sheen-clip-${clipId})`}>
                <ellipse
                  cx="42"
                  cy="42"
                  rx="25"
                  ry="15"
                  fill={`url(#sheen-${clipId})`}
                  transform="rotate(-35, 42, 42)"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Square cover sleeve — always at left, above vinyl */}
        <div
          className="absolute top-0 left-0 z-10 rounded-lg overflow-hidden shadow-lg"
          style={{ width: COVER_SIZE, height: COVER_SIZE }}
        >
          <Image
            src={coverSrc}
            alt={`${bandData.name} cover`}
            width={COVER_SIZE}
            height={COVER_SIZE}
            priority
            className="w-full h-full object-cover"
          />

          {/* Play/Pause overlay */}
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: isHovered || isPlaying ? 1 : 0 }}
          >
            <button
              onClick={togglePlay}
              className="text-white text-xl hover:scale-110 transition-transform duration-200"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={bandData.musicSample ?? undefined}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  )
}

export default BandCoverImage
