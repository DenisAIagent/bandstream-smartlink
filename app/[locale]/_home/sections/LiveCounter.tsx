'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../home.module.css';
import { PulseIcon } from './icons';

interface LiveCounterProps {
  labelSuffix: string;
}

const INITIAL_POINTS = [24, 22, 23, 19, 20, 14, 15, 8, 4];

/**
 * Animated "streams en direct" counter and sparkline.
 * Ports the `IIFE` counter from the original draft to a React effect.
 * Random increments + occasional burst + sparkline shift.
 */
export default function LiveCounter({ labelSuffix }: LiveCounterProps) {
  const [value, setValue] = useState(128473);
  const [tickFlash, setTickFlash] = useState(false);
  const [points, setPoints] = useState<number[]>(INITIAL_POINTS);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function tick() {
      if (cancelled) return;

      const burst = Math.random() < 0.12;
      const inc = burst ? 40 + Math.floor(Math.random() * 50) : 3 + Math.floor(Math.random() * 25);

      setValue((v) => v + inc);
      setTickFlash(true);
      setTimeout(() => {
        if (!cancelled) setTickFlash(false);
      }, 160);

      setPoints((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.max(2, last - (0.4 + Math.random() * 1.8) + (inc > 30 ? -0.8 : 0));
        const updated = [...prev, next];
        if (updated.length > 9) updated.shift();
        return updated;
      });

      const delay = 700 + Math.random() * 1100;
      timeoutRef.current = setTimeout(tick, delay);
    }

    timeoutRef.current = setTimeout(tick, 900);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const linePoints = points
    .map((y, i) => {
      const t = max === min ? 12 : ((y - min) / (max - min)) * 20 + 2;
      return `${i * 10},${t.toFixed(1)}`;
    })
    .join(' ');
  const fillPoints = `${linePoints} 80,28 0,28`;

  const formatted = new Intl.NumberFormat('fr-FR').format(value).replace(/\s/g, ' ');

  return (
    <div className={`${styles.floater} ${styles.floater3} ${styles.floaterCounter}`}>
      <div className={styles.fi}>
        <PulseIcon />
      </div>
      <div className={styles.ft}>
        <strong className={tickFlash ? `${styles.counterNum} ${styles.tick}` : styles.counterNum}>
          {formatted}
        </strong>
        <small>
          {labelSuffix} <span className={styles.counterUp}>▲</span>
        </small>
      </div>
      <svg className={styles.counterSpark} viewBox="0 0 80 28" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="bsHomeSparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bs-green)" stopOpacity=".6" />
            <stop offset="100%" stopColor="var(--bs-green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--bs-green)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points={fillPoints} fill="url(#bsHomeSparkGrad)" opacity=".35" />
      </svg>
    </div>
  );
}
