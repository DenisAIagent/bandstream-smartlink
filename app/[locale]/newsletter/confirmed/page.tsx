'use client';

import {useTranslations} from 'next-intl';
import Link from 'next/link';

export default function NewsletterConfirmed() {
  const t = useTranslations('newsletterConfirmed');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <svg className="w-20 h-20 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" className="stroke-green-400/30" />
            <circle cx="12" cy="12" r="10" className="stroke-green-400" strokeDasharray="63" strokeDashoffset="0">
              <animate attributeName="stroke-dashoffset" from="63" to="0" dur="0.6s" fill="freeze" />
            </circle>
            <polyline points="7.5 12 10.5 15 16.5 9" className="stroke-green-400" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.4s" begin="0.5s" fill="freeze" />
            </polyline>
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>

        <p className="text-lg text-zinc-400 leading-relaxed">
          {t('message')}
        </p>

        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
