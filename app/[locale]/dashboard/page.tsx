"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import BandCard from "@/components/bandstream/dashboard/BandCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

import Link from "next/link";

interface Band {
  id: number;
  name: string;
  domainname: string;
  coverImage: string | null;
  publishedAt: string | null;
  smartLinkCount: number;
  platforms: { platformId: number; platformName: string; customURL: string }[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<{ used: number; limit: number | null; canCreate: boolean }>({
    used: 0,
    limit: null,
    canCreate: true,
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [bandsRes, limitsRes] = await Promise.all([
          fetch("/api/dashboard/bands"),
          fetch("/api/dashboard/limits"),
        ]);
        if (bandsRes.ok) setBands(await bandsRes.json());
        if (limitsRes.ok) {
          const data = await limitsRes.json();
          if (data?.artists) setLimits(data.artists);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const artistLimit = limits.limit;
  const atArtistLimit = !limits.canCreate;
  const visibleBands = query.trim()
    ? bands.filter((b) =>
        b.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : bands;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {tc("welcome")}, {session?.user?.name || session?.user?.email}
        </h1>
        <p className="text-muted-foreground mt-1">{t("dashboard_subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold">
          {t("my_artists")}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {artistLimit === null ? bands.length : `${limits.used}/${artistLimit}`}
          </span>
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {bands.length > 5 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_artists")}
                className="pl-8 w-48 sm:w-64 h-9"
              />
            </div>
          )}
          {atArtistLimit ? (
            <Link href="/dashboard/settings">
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                {t("artist_limit_cta")}
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/bands/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t("create_artist")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">...</div>
      ) : bands.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">{t("no_artists")}</p>
          <p className="mt-2">{t("no_artists_hint")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleBands.map((band) => (
            <BandCard
              key={band.id}
              id={band.id}
              name={band.name}
              domainname={band.domainname}
              coverImage={band.coverImage}
              platformCount={band.smartLinkCount}
              publishedAt={band.publishedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
