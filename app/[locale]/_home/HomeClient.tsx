'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { HomeCopy } from './content/types';
import styles from './home.module.css';
import Nav from './sections/Nav';

interface HomeClientProps {
  copy: HomeCopy;
  children: ReactNode;
}

const THEME_KEY = 'bs-home-theme';

type Theme = 'dark' | 'light';

/**
 * Client root for the landing page. Owns:
 *  - Isolated theme state (localStorage key `bs-home-theme`, attribute `data-home-theme`).
 *    Does NOT read or write the app's global `next-themes` / `[data-theme]`.
 *  - Nav scrolled state (`.scrolled` class when window.scrollY > 20).
 *  - Reveal-on-scroll IntersectionObserver that adds the hashed `in` class
 *    to any `.reveal` descendants. Scoped by the class hash so it never
 *    touches reveal animations elsewhere in the app.
 */
export default function HomeClient({ copy, children }: HomeClientProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [scrolled, setScrolled] = useState(false);

  // Load persisted theme once on mount (avoid SSR hydration mismatch).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    }
  }, []);

  // Persist theme changes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Nav scroll state.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal-on-scroll.
  useEffect(() => {
    const revealClass = styles.reveal;
    const inClass = styles.in;
    if (!revealClass || !inClass) return;
    const elements = document.querySelectorAll<HTMLElement>(`.${revealClass}`);
    if (elements.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(inClass);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className={styles.home} data-home-theme={theme}>
      <div className={styles.ambient} aria-hidden="true">
        <div className={`${styles.blob} ${styles.b1}`} />
        <div className={`${styles.blob} ${styles.b2}`} />
      </div>
      <div className={styles.gridBg} aria-hidden="true" />
      <Nav copy={copy.nav} scrolled={scrolled} onToggleTheme={toggleTheme} />
      {children}
    </div>
  );
}
