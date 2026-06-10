import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';

interface FaqProps {
  copy: HomeCopy['faq'];
}

/**
 * FAQ — native <details> accordions: accessible, zero JS, and the
 * #faq nav anchor finally lands somewhere.
 */
export default function Faq({ copy }: FaqProps) {
  return (
    <section id="faq" style={{ padding: 'var(--space-section, 6rem) 0' }}>
      <div className={styles.mx}>
        <div className={`${styles.sHead} ${styles.reveal}`}>
          <span className={styles.sEyebrow}>{copy.eyebrow}</span>
          <h2 className={styles.sTitle}>
            {copy.titlePre}<em>{copy.titleEm}</em>{copy.titlePost}
          </h2>
        </div>

        <div
          className={styles.reveal}
          style={{ maxWidth: '720px', margin: '0 auto' }}
        >
          {copy.items.map((item) => (
            <details
              key={item.q}
              style={{
                borderBottom: '1px solid rgba(128,128,128,0.2)',
                padding: '1rem 0',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  listStyle: 'none',
                }}
              >
                {item.q}
              </summary>
              <p
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  opacity: 0.75,
                }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
