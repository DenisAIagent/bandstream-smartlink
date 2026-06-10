'use client';

import { useEffect, useState } from 'react';
import type { HomeCopy } from '../content/types';
import { TEMPLATES, type TemplateId } from '../content/templates';
import styles from '../home.module.css';
import TemplatePhone from './TemplatePhone';
import { TemplateArrowIcon } from './icons';

interface SmartlinksProps {
  copy: HomeCopy['smartlinks'];
}

export default function Smartlinks({ copy }: SmartlinksProps) {
  const [activeId, setActiveId] = useState<TemplateId>(TEMPLATES[0].id);
  const [autoKey, setAutoKey] = useState(0);

  // Auto-cycle — resets whenever the user clicks
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveId((prev) => {
        const idx = TEMPLATES.findIndex((t) => t.id === prev);
        return TEMPLATES[(idx + 1) % TEMPLATES.length].id;
      });
    }, 5200);
    return () => clearInterval(interval);
  }, [autoKey]);

  const handleSelect = (id: TemplateId) => {
    setActiveId(id);
    setAutoKey((k) => k + 1);
  };

  return (
    <section className={styles.smartlinks} id="smartlinks">
      <div className={styles.mx}>
        <div className={`${styles.sHead} ${styles.reveal}`}>
          <span className={styles.sEyebrow}>{copy.eyebrow}</span>
          <h2 className={styles.sTitle}>
            {copy.titlePre}<em>{copy.titleEm}</em>{copy.titlePost}
          </h2>
          <p className={styles.sSub}>{copy.sub}</p>
        </div>
        <div className={styles.tplShowcase}>
          <div className={styles.tplPhoneWrap}>
            <TemplatePhone activeId={activeId} ariaLabel={copy.phoneAriaLabel} />
          </div>
          <div className={styles.tplList}>
            {copy.templates.map((t, idx) => {
              const active = t.id === activeId;
              const className = active
                ? `${styles.tplItem} ${styles.active}`
                : styles.tplItem;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={className}
                  onClick={() => handleSelect(t.id as TemplateId)}
                >
                  <span className={styles.tplItemNum}>{String(idx + 1).padStart(2, '0')}</span>
                  <span className={styles.tplItemBody}>
                    <h4>{t.name}</h4>
                    <p>{t.tag}</p>
                    <span className={styles.tplProgress}>
                      <span className={styles.bar} />
                    </span>
                  </span>
                  <span className={styles.tplItemArrow}>
                    <TemplateArrowIcon />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
