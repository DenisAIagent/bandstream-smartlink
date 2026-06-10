import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';

interface StepsProps {
  copy: HomeCopy['steps'];
}

export default function Steps({ copy }: StepsProps) {
  return (
    <section className={styles.stepsSec} id="steps">
      <div className={styles.mx}>
        <div className={`${styles.sHead} ${styles.reveal}`}>
          <span className={styles.sEyebrow}>{copy.eyebrow}</span>
          <h2 className={styles.sTitle}>
            {copy.titlePre}<em>{copy.titleEm}</em>{copy.titlePost}
          </h2>
          <p className={styles.sSub}>{copy.sub}</p>
        </div>
        <div className={`${styles.stepsTrack} ${styles.reveal}`}>
          <div className={styles.stepsLine} aria-hidden="true" />
          {copy.items.map((item, idx) => (
            <div key={idx} className={styles.step}>
              <div className={styles.stepNum}>{idx + 1}</div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
