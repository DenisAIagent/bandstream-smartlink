'use client';

import { useRef } from 'react';

export default function AnimatedSvgButton() {
  const objectRef = useRef<HTMLObjectElement>(null);

  const handleMouseOver = () => {
    const svg = objectRef.current?.contentDocument?.querySelector('svg');
    if (svg) {
      svg.dispatchEvent(new Event('mouseover'));
    }
  };

  const handleMouseOut = () => {
    const svg = objectRef.current?.contentDocument?.querySelector('svg');
    if (svg) {
      svg.dispatchEvent(new Event('mouseout'));
    }
  };

  return (
    <button 
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseOut}
      className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-violet-400 text-primary-foreground hover:bg-violet-500 h-10 px-4 py-2"
    >
      <object 
        ref={objectRef}
        type="image/svg+xml" 
        data="/svg/bandstreamplay.svg" 
        width="24" 
        height="24"
      >
        svg-animation
      </object>
      Play
    </button>
  );
} 