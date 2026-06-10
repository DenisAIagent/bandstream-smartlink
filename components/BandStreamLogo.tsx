'use client'

import { useRef } from 'react'

interface BandStreamLogoProps {
  className?: string
  onClick?: () => void
}

export default function BandStreamLogo({ className = '' }: BandStreamLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  // useEffect(() => {
  //   // Wait for SVGator player to be available
  //   const player = svgRef.current?.svgatorPlayer
  //   if (player?.ready) {
  //     player.ready(() => {
  //       // Stop any ongoing animation and reset to first frame
  //       player.stop()
  //     })
  //   }
  // }, [])

  // const handleClick = () => {
  //   const player = svgRef.current?.svgatorPlayer
  //   if (player?.ready) {
  //     // Restart animation from beginning
  //     player.restart()
  //   }
  //   onClick?.()
  // }

  return (
    <svg
      ref={svgRef}
      className={className}
      // onClick={handleClick}
      id="eT3BWrDaV0E1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="95 100 105 105"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      <g transform="translate(108.197147 106.567519)">
        <path
          id="eT3BWrDaV0E3"
          d="M71.59,87.6h-45.56C10.01,87.6,0,76.96,0,61.94c0-12.26,6.76-19.4,15.14-22.15-5.38-2.88-8.89-8.14-8.89-16.65C6.26,9.64,15.27,0,29.54,0c0,0,5.95,0,5.95,0c19.94,0,36.1,16.16,36.1,36.1v51.5Z"
          transform="translate(.055013 0.184337)"
          fill="#55b78a"
        />
        <path
          id="eT3BWrDaV0E4"
          d="M37.13,60.33L51.78,50.4c1.72-1.17,1.73-3.71,0-4.88L37.01,35.47c-1.96-1.34-4.62.08-4.6,2.45l.12,19.98c.01,2.36,2.65,3.74,4.6,2.42"
          transform="translate(0 0.184337)"
          fill="#fff"
        />
      </g>
      <script>{`!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof __SVGATOR_DEFINE__&&__SVGATOR_DEFINE__.amd?__SVGATOR_DEFINE__(e):((t="undefined"!=typeof globalThis?globalThis:t||self).__SVGATOR_PLAYER__=t.__SVGATOR_PLAYER__||{},t.__SVGATOR_PLAYER__["91c80d77"]=e())}(this,(function(){"use strict";...`}</script>
    </svg>
  )
} 