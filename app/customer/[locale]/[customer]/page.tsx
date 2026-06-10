import { redirect } from 'next/navigation';
import { getArtistHubData } from '@/lib/queries/smartlinks';
import { Band } from '@/types/bandstream';
import SmartLinkRenderer from '@/components/bandstream/landingpages/templates/SmartLinkRenderer';
import ArtistHub from '@/components/bandstream/landingpages/hub/ArtistHub';
import type { Socials } from '@/components/bandstream/landingpages/hub/SocialIcons';
import { extractColorsFromUrl } from '@/lib/colors/extract-colors';

async function accentFrom(coverSrc: string | null) {
  const src = coverSrc || '/images/bandstream/emptycover.jpg';
  if (!src.startsWith('http')) return undefined;
  const colors = await extractColorsFromUrl(src);
  return colors?.dominant;
}

function extractSocials(socials: unknown): Socials {
  if (!socials || typeof socials !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(socials as Record<string, unknown>)) {
    if (typeof value === 'string' && value.length > 0) out[key] = value;
  }
  return out as Socials;
}

/**
 * Racine {artist}.band.stream :
 * - profil vide (ni bio ni réseaux) avec exactement 1 sortie publiée
 *   → on rend cette sortie en place (continuité des liens partagés/QR
 *   et du path "/" dans Umami) ;
 * - sinon → page artiste (hub) : photo, bio, réseaux, liste des sorties ;
 * - fallback legacy (aucun smartlink mais champs release sur Band,
 *   ex. backfill pas encore passé) → ancien rendu direct du Band.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ customer: string }>;
}) {
  const { customer } = await params;
  const band = await getArtistHubData(customer);

  if (!band) {
    console.log('Band not found');
    redirect('/404');
  }

  const socials = extractSocials(band.socials);
  const hasProfile = Boolean(band.bio) || Object.keys(socials).length > 0;

  // Une seule sortie, pas de profil → rendu inline de la sortie
  if (!hasProfile && band.smartLinks.length === 1) {
    const smartLink = band.smartLinks[0];
    return (
      <SmartLinkRenderer
        band={band}
        smartLink={smartLink}
        accentRgb={await accentFrom(smartLink.coverImage)}
      />
    );
  }

  // Fallback legacy : aucun smartlink mais des données release sur le Band
  if (band.smartLinks.length === 0 && (band.album || band.platforms.length > 0)) {
    return (
      <SmartLinkRenderer
        band={band as unknown as Band}
        accentRgb={await accentFrom(band.coverImage)}
      />
    );
  }

  return (
    <ArtistHub
      name={band.name}
      bio={band.bio}
      socials={socials}
      coverImage={band.coverImage}
      smartLinks={band.smartLinks}
      accentRgb={await accentFrom(band.coverImage)}
    />
  );
}
