'use client'
import React from 'react'
import { Band } from '@/types/bandstream'
import BandSmartLinks from './BandSmartLinks'
import BandCoverImage from './BandCoverImage'
import { Ticket, Calendar, MapPin } from 'lucide-react'

interface BandProps {
  bandData: Band
  accentRgb?: [number, number, number]
}

const BandPage: React.FC<BandProps> = ({ bandData, accentRgb }) => {
  const isEventExpired = bandData.nextEventDate ? new Date(bandData.nextEventDate) < new Date() : false

  const formatEventDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'UTC'
    })
  }

  const coverSrc = bandData.coverImage || '/images/bandstream/emptycover.jpg'
  const [r, g, b] = accentRgb || [14, 216, 148]
  const hasAccent = !!accentRgb

  return (
    <div className="fixed inset-0 w-full bg-black flex items-center justify-center px-3 py-3 sm:p-6 overflow-hidden">
      {/* Blurred cover background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-xl brightness-[0.35] scale-110"
      />

      {/* Radial glow — uses extracted color */}
      <div
        className="absolute w-[700px] h-[700px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(${r},${g},${b},0.1) 0%, transparent 70%)`,
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-[400px] max-w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
        style={{
          backgroundColor: '#1a1a1a',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: hasAccent ? `rgba(${r},${g},${b},0.15)` : 'rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-4 sm:px-6 sm:py-8 text-center"
          style={{
            background: `linear-gradient(to bottom right, rgba(${r},${g},${b},0.15), rgba(${r},${g},${b},0.05))`,
          }}
        >
          <BandCoverImage bandData={bandData} />
          <h1 className="font-heading text-lg sm:text-xl font-semibold text-white mb-0.5">
            {bandData.name}
          </h1>
          <div
            className="text-xs sm:text-sm font-normal font-body"
            style={{ color: `rgb(${r},${g},${b})` }}
          >
            {bandData.domainname}.band.stream
          </div>
          {bandData.album && (
            <div className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1 font-body">
              {bandData.album}
            </div>
          )}
        </div>

        {/* Event section */}
        {bandData.ticketingURL && bandData.nextEventDate && !isEventExpired && (
          <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-white/[0.06]">
            <div className="flex flex-col items-center gap-1 sm:gap-2 text-gray-300 text-xs sm:text-sm font-body">
              <div className="flex items-center gap-2">
                <Calendar
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  style={{ color: `rgb(${r},${g},${b})` }}
                />
                <span>{formatEventDate(bandData.nextEventDate)}</span>
              </div>
              {bandData.nextEventLocation && (
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    style={{ color: `rgb(${r},${g},${b})` }}
                  />
                  <span>{bandData.nextEventLocation}</span>
                </div>
              )}
            </div>
            <a
              href={bandData.ticketingURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-2 sm:mt-3 w-full py-2.5 sm:py-3 rounded-xl text-white font-semibold text-xs sm:text-sm transition-all duration-300 font-body"
              style={{ backgroundColor: `rgb(${r},${g},${b})` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(0.85)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = ''
              }}
            >
              <Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Tickets</span>
            </a>
          </div>
        )}

        {/* Platform links */}
        {bandData.platforms && bandData.platforms.length > 0 && (
          <div className="p-2.5 sm:p-4">
            <BandSmartLinks bandData={bandData} accentRgb={[r, g, b]} accentReady={hasAccent} />
          </div>
        )}
      </div>
    </div>
  )
}

export default BandPage
