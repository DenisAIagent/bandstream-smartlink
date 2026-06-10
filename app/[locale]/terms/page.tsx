import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/components/bandstream/LegalPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  return { title: t('termsTitle') + ' — band.stream' };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <LegalPage
      locale={locale}
      mdFileFr="terms-fr.md"
      mdFileEn="terms-en.md"
      title={t('termsTitle')}
      otherLinks={[
        { href: `/${locale}/privacy`, label: t('privacyTitle') },
        { href: `/${locale}/legal`, label: t('legalTitle') },
      ]}
    />
  );
}
