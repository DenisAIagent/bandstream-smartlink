import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';
import { LinkIcon, SearchIcon, ChartUpIcon, LayoutIcon } from './icons';

interface FeaturesProps {
  copy: HomeCopy['features'];
}

const ICONS = {
  link: LinkIcon,
  search: SearchIcon,
  chart: ChartUpIcon,
  layout: LayoutIcon,
};

const MINI_CHART_HEIGHTS = [28, 44, 38, 62, 52, 74, 68, 88, 80, 95, 72, 86, 64, 78, 92, 70];

export default function Features({ copy }: FeaturesProps) {
  return (
    <section className={styles.features} id="features">
      <div className={styles.mx}>
        <div className={`${styles.sHead} ${styles.reveal}`}>
          <span className={styles.sEyebrow}>{copy.eyebrow}</span>
          <h2 className={styles.sTitle}>
            {copy.titlePre}<em>{copy.titleEm}</em>{copy.titlePost}
          </h2>
          <p className={styles.sSub}>{copy.sub}</p>
        </div>
        <div className={styles.featGrid}>
          {copy.items.map((item, idx) => {
            const Icon = ICONS[item.icon];
            const featClass = item.span2
              ? `${styles.feat} ${styles.reveal} ${styles.span2}`
              : `${styles.feat} ${styles.reveal}`;
            return (
              <div key={idx} className={featClass}>
                <div className={styles.featIc}>
                  <Icon />
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.span2 && (
                  <div className={styles.miniChart} aria-hidden="true">
                    {MINI_CHART_HEIGHTS.map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}%`, animationDelay: `${0.05 + i * 0.05}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
