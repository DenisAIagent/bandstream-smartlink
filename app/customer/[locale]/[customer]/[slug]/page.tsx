import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSmartLinkData } from '@/lib/queries/smartlinks';
import SmartLinkRenderer from '@/components/bandstream/landingpages/templates/SmartLinkRenderer';
import { extractColorsFromUrl } from '@/lib/colors/extract-colors';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ customer: string; slug: string }>;
}): Promise<Metadata> {
  const { customer, slug } = await params;
  const data = await getSmartLinkData(customer, slug);

  return {
    title: data ? `${data.band.name} - ${data.smartLink.title}` : 'band.stream',
    description: data
      ? `${data.smartLink.title} by ${data.band.name}`
      : 'Your smartlinks platform',
  };
}

export default async function SmartLinkPage({
  params,
}: {
  params: Promise<{ customer: string; slug: string }>;
}) {
  const { customer, slug } = await params;
  const data = await getSmartLinkData(customer, slug);

  if (!data) {
    notFound();
  }

  const coverSrc = data.smartLink.coverImage || '/images/bandstream/emptycover.jpg';
  const colors = coverSrc.startsWith('http')
    ? await extractColorsFromUrl(coverSrc)
    : null;

  return (
    <SmartLinkRenderer
      band={data.band}
      smartLink={data.smartLink}
      accentRgb={colors?.dominant}
    />
  );
}
