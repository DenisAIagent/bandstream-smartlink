import Image from 'next/image';
import Link from 'next/link';
import SocialIcons, { type Socials } from './SocialIcons';

interface HubSmartLink {
  id: number;
  slug: string;
  title: string;
  coverImage: string | null;
}

interface ArtistHubProps {
  name: string;
  bio: string | null;
  socials: Socials;
  coverImage: string | null;
  smartLinks: HubSmartLink[];
  accentRgb?: [number, number, number];
}

/**
 * Page artiste ({artist}.band.stream) : photo, bio, réseaux sociaux et
 * liste des sorties. Esthétique sombre cohérente avec les templates
 * smartlink (obsidian).
 */
export default function ArtistHub({
  name,
  bio,
  socials,
  coverImage,
  smartLinks,
  accentRgb,
}: ArtistHubProps) {
  const [r, g, b] = accentRgb ?? [14, 216, 148];

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center px-4 py-10 sm:py-16"
      style={{
        background: `radial-gradient(800px 400px at 50% -10%, rgba(${r},${g},${b},0.12), transparent 70%), #0a0a0b`,
        color: '#F5F5F7',
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Photo artiste */}
        <div
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-5 shrink-0"
          style={{ border: `2px solid rgba(${r},${g},${b},0.4)` }}
        >
          {coverImage ? (
            <Image src={coverImage} alt={name} fill className="object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h1>

        {bio && (
          <p className="mt-3 text-sm leading-relaxed text-white/65 whitespace-pre-line">
            {bio}
          </p>
        )}

        <SocialIcons socials={socials} className="flex items-center justify-center gap-3 mt-5" />

        {/* Sorties */}
        {smartLinks.length > 0 && (
          <nav aria-label={name} className="w-full mt-8 flex flex-col gap-2.5">
            {smartLinks.map((link) => (
              <Link
                key={link.id}
                href={`/${link.slug}`}
                className="group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5">
                  {link.coverImage ? (
                    <Image src={link.coverImage} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-lg">
                      ♪
                    </div>
                  )}
                </div>
                <span className="flex-1 text-left text-sm font-medium truncate">
                  {link.title}
                </span>
                <span
                  className="text-white/30 group-hover:translate-x-0.5 transition-transform mr-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      <footer className="mt-auto pt-12 text-[11px] text-white/25">
        Powered by{' '}
        <Link href="/" className="font-semibold hover:text-white/60 transition-colors">
          band.stream
        </Link>
      </footer>
    </main>
  );
}
