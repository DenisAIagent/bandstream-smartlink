import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/components/bandstream/LegalPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  return { title: t('privacyTitle') + ' — band.stream' };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <LegalPage
      locale={locale}
      mdFileFr="privacy-fr.md"
      mdFileEn="privacy-en.md"
      title={t('privacyTitle')}
      otherLinks={[
        { href: `/${locale}/terms`, label: t('termsTitle') },
        { href: `/${locale}/legal`, label: t('legalTitle') },
      ]}
    />
  );
}
