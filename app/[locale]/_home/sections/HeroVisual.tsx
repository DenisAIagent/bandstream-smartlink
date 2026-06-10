'use client';

import { useEffect, useState } from 'react';
import type { HomeCopy } from '../content/types';
import { TEMPLATES, type TemplateId } from '../content/templates';
import styles from '../home.module.css';
import TemplatePhone from './TemplatePhone';
import LiveCounter from './LiveCounter';
import { ChartUpIcon, TargetIcon } from './icons';

interface HeroVisualProps {
  copy: HomeCopy['hero'];
}

/**
 * Hero right column: phone mockup auto-cycling through templates,
 * plus floating decorative cards and the live counter.
 */
export default function HeroVisual({ copy }: HeroVisualProps) {
  const [activeId, setActiveId] = useState<TemplateId>(TEMPLATES[0].id);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveId((prev) => {
        const idx = TEMPLATES.findIndex((t) => t.id === prev);
        return TEMPLATES[(idx + 1) % TEMPLATES.length].id;
      });
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.heroVisual}>
      <div className={styles.floaters} aria-hidden="true">
        <div className={`${styles.floater} ${styles.floater1}`}>
          <div className={styles.fi}><ChartUpIcon /></div>
          <div className={styles.ft}>
            <strong>{copy.floater1.label}</strong>
            <small>{copy.floater1.sub}</small>
          </div>
        </div>
        <div className={`${styles.floater} ${styles.floater2}`}>
          <div className={styles.fi}><TargetIcon /></div>
          <div className={styles.ft}>
            <strong>{copy.floater2.label}</strong>
            <small>{copy.floater2.sub}</small>
          </div>
        </div>
        <LiveCounter labelSuffix={copy.floater3.labelSuffix} />
      </div>
      <TemplatePhone activeId={activeId} ariaLabel={copy.phoneAriaLabel} />
    </div>
  );
}
