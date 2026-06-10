import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/components/bandstream/LegalPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  return { title: t('legalTitle') + ' — band.stream' };
}

export default async function LegalNoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <LegalPage
      locale={locale}
      mdFileFr="legal-fr.md"
      mdFileEn="legal-en.md"
      title={t('legalTitle')}
      otherLinks={[
        { href: `/${locale}/terms`, label: t('termsTitle') },
        { href: `/${locale}/privacy`, label: t('privacyTitle') },
      ]}
    />
  );
}
