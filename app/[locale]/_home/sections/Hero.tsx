import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';
import { ArrowRight } from './icons';
import HeroVisual from './HeroVisual';

interface HeroProps {
  copy: HomeCopy['hero'];
}

export default function Hero({ copy }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.mx}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>
            <span className={styles.dot} />
            {copy.kicker}
          </div>
          <h1>
            <span className={styles.line}><span className={styles.inner}>{copy.titleLine1}</span></span>
            <span className={styles.line}>
              <span className={styles.inner}>
                {copy.titleLine2a}<em>{copy.titleLine2em}</em>
              </span>
            </span>
            <span className={styles.line}><span className={styles.inner}>{copy.titleLine3}</span></span>
          </h1>
          <p
            className={styles.heroSub}
            dangerouslySetInnerHTML={{ __html: copy.sub }}
          />
          <div className={styles.heroActions}>
            <a href="#cta" className={`${styles.btn} ${styles.btnPrimary}`}>
              {copy.ctaPrimary}
              <ArrowRight />
            </a>
            <a href="#smartlinks" className={`${styles.btn} ${styles.btnGhost}`}>
              {copy.ctaSecondary}
            </a>
          </div>
          <p className={styles.heroHint}>{copy.hint}</p>
        </div>
        <HeroVisual copy={copy} />
      </div>
    </section>
  );
}
