import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';

interface ManifestoProps {
  copy: HomeCopy['manifesto'];
}

export default function Manifesto({ copy }: ManifestoProps) {
  return (
    <section className={styles.manifesto}>
      <div className={styles.manifestoWatermark} aria-hidden="true">{copy.watermark}</div>
      <div className={`${styles.manifestoInner} ${styles.reveal}`}>
        <div className={styles.manifestoEyebrow}>{copy.eyebrow}</div>
        <h2>
          {copy.titlePart1}
          <span className={styles.strike}>{copy.titleStrike}</span>
          <br />
          {copy.titlePart2}<em>{copy.titleEm}</em>{copy.titlePart3}
        </h2>
        <div className={styles.manifestoRow}>
          <div className={styles.manifestoBody}>
            <p>
              {copy.body}
              <strong style={{ color: 'var(--bs-green)', fontWeight: 700 }}>
                {copy.bodyAccent}
              </strong>
            </p>
          </div>
          <div className={styles.manifestoSignature}>
            <div className={styles.sigMark}>{copy.signatureMark}</div>
            <div>
              <strong>{copy.signatureName}</strong>
              <small>{copy.signatureSub}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
