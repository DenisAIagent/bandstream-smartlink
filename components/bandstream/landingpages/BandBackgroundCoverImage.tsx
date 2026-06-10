'use client'
import React from 'react'
import { Band } from '@/types/bandstream'

interface BandProps {
  bandData: Band
}

const BandBackgroundCoverImage: React.FC<BandProps> = () => {
  return (
    <div className="absolute inset-0 bg-black w-full h-full" style={{ zIndex: 0 }} />
  )
}

export default BandBackgroundCoverImage
