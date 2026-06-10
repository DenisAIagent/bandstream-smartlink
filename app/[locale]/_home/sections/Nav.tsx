'use client';

import Image from 'next/image';
import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';
import { ArrowRight, SunIcon, MoonIcon } from './icons';

interface NavProps {
  copy: HomeCopy['nav'];
  scrolled: boolean;
  onToggleTheme: () => void;
}

export default function Nav({ copy, scrolled, onToggleTheme }: NavProps) {
  const className = scrolled ? `${styles.nav} ${styles.scrolled}` : styles.nav;
  return (
    <nav className={className} id="nav">
      <div className={styles.mx}>
        <a href="#" className={styles.logo} aria-label="band.stream">
          <Image
            src="/images/home/logo-bandstream-white.png"
            alt="band.stream"
            className={styles.darkOnly}
            width={140}
            height={36}
            priority
          />
          <Image
            src="/images/home/logo-bandstream-black.png"
            alt="band.stream"
            className={styles.lightOnly}
            width={140}
            height={36}
            priority
          />
        </a>
        <div className={styles.navLinks}>
          <a href="#features">{copy.features}</a>
          <a href="#smartlinks">{copy.smartlinks}</a>
          <a href="#pricing">{copy.pricing}</a>
          <a href="#faq">{copy.faq}</a>
        </div>
        <div className={styles.navRight}>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={onToggleTheme}
            aria-label={copy.themeToggleLabel}
          >
            <span className={styles.sun}><SunIcon /></span>
            <span className={styles.moon}><MoonIcon /></span>
          </button>
          <a href="#cta" className={`${styles.btn} ${styles.btnPrimary}`}>
            {copy.cta}
            <ArrowRight />
          </a>
        </div>
      </div>
    </nav>
  );
}
