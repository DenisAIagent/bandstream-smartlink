'use client'
import React from 'react'
import { Band } from '@/types/bandstream'
import { PlatformData } from '@/types/bandstream'
import { getPlatformIcon } from './PlatformIcons'
import { joinPlatformUrl } from './templates/adapter'

interface BandSmartLinksProps {
  bandData: Band
  accentRgb?: [number, number, number]
  accentReady?: boolean
}

const BandSmartLinks: React.FC<BandSmartLinksProps> = ({ bandData, accentRgb, accentReady = false }) => {
  const [r, g, b] = accentRgb || [14, 216, 148]

  return (
    <div className="flex flex-col">
      {bandData.platforms.map(({ platform, customURL }: PlatformData) => {
        const iconData = getPlatformIcon(platform.shortname)
        return (
          <a
            key={platform.id}
            href={joinPlatformUrl(platform.URL, customURL)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              window.umami?.track(`listen_${platform.shortname}`, {
                platform: platform.shortname,
                band: bandData.domainname,
              })
            }
            className={`group flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 last:mb-0 transition-all duration-300 cursor-pointer listen_${platform.shortname}`}
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => {
              if (accentReady) {
                e.currentTarget.style.borderColor = `rgba(${r},${g},${b},0.25)`
                e.currentTarget.style.backgroundColor = `rgba(${r},${g},${b},0.06)`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
            }}
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: iconData.bgColor,
                border: iconData.border ? '1px solid #2a2a2a' : undefined,
              }}
            >
              {iconData.icon}
            </div>
            <span className="text-xs sm:text-[0.85rem] font-medium flex-1 text-white font-body">
              {platform.name}
            </span>
            <span
              className="text-xs transition-colors duration-300"
              style={{ color: '#888' }}
            >
              &rarr;
            </span>
          </a>
        )
      })}
    </div>
  )
}

export default BandSmartLinks
