'use client';

import { useState, type FormEvent } from 'react';
import type { HomeLocale, HomeCopy } from '../content/types';
import styles from '../home.module.css';

interface CtaBigProps {
  copy: HomeCopy['ctaBig'];
  locale: HomeLocale;
}

type Status = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error';

export default function CtaBig({ copy, locale }: CtaBigProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || status === 'submitting') return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });
      const data: { ok?: boolean; duplicate?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus('success');
      } else if (data.duplicate) {
        setStatus('duplicate');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className={styles.ctaBig} id="cta">
      <div className={styles.mx}>
        <div className={`${styles.ctaCard} ${styles.reveal}`}>
          <h2>
            {copy.titlePre}<em>{copy.titleEm}</em>
            <br />
            {copy.titlePost}
          </h2>
          <p>{copy.sub}</p>
          {status === 'success' ? (
            <p
              style={{
                width: '100%',
                textAlign: 'center',
                color: 'var(--bs-green)',
                fontWeight: 600,
                padding: '16px',
              }}
            >
              {copy.successMsg}
            </p>
          ) : status === 'duplicate' ? (
            <p
              style={{
                width: '100%',
                textAlign: 'center',
                color: 'var(--fg-2)',
                fontWeight: 500,
                padding: '16px',
              }}
            >
              {copy.duplicateMsg}
            </p>
          ) : (
            <form className={styles.ctaForm} onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder={copy.emailPlaceholder}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'submitting'}
              />
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? copy.submitting : copy.submitLabel}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p
              style={{
                marginTop: 12,
                fontSize: '.82rem',
                color: '#E5B23D',
              }}
            >
              {copy.errorMsg}
            </p>
          )}
          <p className={styles.ctaHint}>{copy.hint}</p>
        </div>
      </div>
    </section>
  );
}
