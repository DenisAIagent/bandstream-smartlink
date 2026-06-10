import type { HomeCopy } from '../content/types';
import { STRIP_ORDER, PLATFORMS } from '../content/platforms';
import styles from '../home.module.css';
import PlatformIcon from './PlatformIcon';

interface PlatformsStripProps {
  copy: HomeCopy['platformsStrip'];
}

export default function PlatformsStrip({ copy }: PlatformsStripProps) {
  return (
    <div className={styles.platformsStrip}>
      <div className={styles.mx}>
        <p className={styles.stripLabel}>{copy.label}</p>
        <div className={styles.stripTrack}>
          {STRIP_ORDER.map((key) => (
            <span key={key} className={styles.pl} title={PLATFORMS[key].name}>
              <PlatformIcon platform={key} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
