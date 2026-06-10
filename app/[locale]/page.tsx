import type { Metadata } from 'next';
import Home from './_home/Home';
import { fr } from './_home/content/fr';
import { en } from './_home/content/en';
import type { HomeLocale } from './_home/content/types';

const SUPPORTED: HomeLocale[] = ['fr', 'en'];

function resolveLocale(locale: string): HomeLocale {
  return (SUPPORTED as string[]).includes(locale) ? (locale as HomeLocale) : 'fr';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveLocale(locale);
  const copy = resolved === 'en' ? en : fr;
  const canonical = `/${resolved}`;
  const ogImage = {
    url: resolved === 'en' ? '/images/home/og-en.jpg' : '/images/home/og.jpg',
    width: 1200,
    height: 630,
    alt: 'band.stream',
    type: 'image/jpeg',
  };
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical },
    openGraph: {
      title: copy.meta.title,
      description: copy.meta.description,
      url: canonical,
      siteName: 'band.stream',
      type: 'website',
      locale: resolved === 'en' ? 'en_US' : 'fr_FR',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.meta.title,
      description: copy.meta.description,
      images: [ogImage.url],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <Home locale={resolveLocale(locale)} />;
}
