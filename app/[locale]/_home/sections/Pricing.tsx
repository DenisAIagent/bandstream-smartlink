import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';

interface PricingProps {
  copy: HomeCopy['pricing'];
}

export default function Pricing({ copy }: PricingProps) {
  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.mx}>
        <div className={`${styles.sHead} ${styles.reveal}`}>
          <span className={styles.sEyebrow}>{copy.eyebrow}</span>
          <h2 className={styles.sTitle}>
            {copy.titlePre}<em>{copy.titleEm}</em>{copy.titlePost}
          </h2>
          <p className={styles.sSub}>{copy.sub}</p>
        </div>
        <div className={styles.pricingGrid}>
          {copy.plans.map((plan) => {
            const cardClass = plan.featured
              ? `${styles.price} ${styles.featured} ${styles.reveal}`
              : `${styles.price} ${styles.reveal}`;
            const ctaClass =
              plan.ctaVariant === 'primary'
                ? `${styles.btn} ${styles.btnPrimary}`
                : `${styles.btn} ${styles.btnGhost}`;
            return (
              <div key={plan.name} className={cardClass}>
                {plan.featured && <div className={styles.priceBadge}>{copy.badge}</div>}
                <div className={styles.priceKicker}>{plan.kicker}</div>
                <div className={styles.priceName}>{plan.name}</div>
                <div className={styles.priceDesc}>{plan.desc}</div>
                <div className={styles.priceAmt}>
                  <span className={styles.num}>{plan.amount}</span>
                  <span className={styles.per}>{plan.per}</span>
                </div>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a href="#cta" className={ctaClass} style={{ justifyContent: 'center' }}>
                  {plan.ctaLabel}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
