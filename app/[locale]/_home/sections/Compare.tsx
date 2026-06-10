import type { HomeCopy } from '../content/types';
import styles from '../home.module.css';

interface CompareProps {
  copy: HomeCopy['compare'];
}

type CellValue = HomeCopy['compare']['rows'][number]['values'][number];

function renderCell(cell: CellValue, isUs: boolean): React.ReactNode {
  if (typeof cell === 'string') return cell;
  switch (cell.type) {
    case 'check':
      return (
        <span className={styles.check}>
          {cell.value ?? '✓'}
        </span>
      );
    case 'nope':
      return <span className={styles.nope}>{cell.value ?? '—'}</span>;
    case 'warn':
      return <span style={{ color: '#E5B23D' }}>{cell.value ?? '⚠'}</span>;
    case 'price':
      return (
        <span
          className={styles.priceBig}
          style={isUs ? { color: 'var(--bs-green)' } : undefined}
        >
          {cell.value}
          {cell.sub && <small>{cell.sub}</small>}
        </span>
      );
    case 'plain':
    default:
      return (
        <span
          style={isUs ? { color: 'var(--bs-green)', fontWeight: 600 } : undefined}
        >
          {cell.value}
        </span>
      );
  }
}

export default function Compare({ copy }: CompareProps) {
  return (
    <section className={styles.compareSec}>
      <div className={styles.mx}>
        <div className={`${styles.sHead} ${styles.reveal}`}>
          <span className={styles.sEyebrow}>{copy.eyebrow}</span>
          <h2 className={styles.sTitle}>
            {copy.titlePre}<em>{copy.titleEm}</em>{copy.titlePost}
          </h2>
          <p className={styles.sSub}>{copy.sub}</p>
        </div>
        <div className={`${styles.compareWrap} ${styles.reveal}`}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th />
                {copy.headers.map((header, idx) => {
                  const isUs = idx === copy.headers.length - 1;
                  return (
                    <th key={header} className={isUs ? styles.colUs : undefined}>
                      {header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {copy.rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  {row.values.map((value, idx) => {
                    const isUs = idx === row.values.length - 1;
                    const isCheck = typeof value !== 'string' && value.type === 'check';
                    const tdClass = isUs
                      ? isCheck
                        ? `${styles.colUs} ${styles.check}`
                        : styles.colUs
                      : undefined;
                    return (
                      <td key={idx} className={tdClass}>
                        {renderCell(value, isUs)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
