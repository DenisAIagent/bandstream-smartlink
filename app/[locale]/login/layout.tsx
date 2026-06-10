import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'login' });

  return {
    title: `${t('meta_title')} — band.stream`,
    description: t('meta_description'),
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
