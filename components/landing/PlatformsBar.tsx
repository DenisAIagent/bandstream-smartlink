"use client";

import { useTranslations } from "next-intl";

export function PlatformsBar() {
  const t = useTranslations("landing");
  const platforms = ["Spotify", "Apple Music", "YouTube Music", "Deezer", "Tidal", "Qobuz", "YouTube"];

  return (
    <section className="bg-green-accent py-[60px] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h3 className="font-heading text-2xl font-bold text-black mb-2">
          {t("platforms.title")}
        </h3>
        <p className="text-[0.9rem] font-medium text-black/60 mb-8">
          {t("platforms.subtitle")}
        </p>
        <div className="flex justify-center items-center gap-10 max-md:gap-6 flex-wrap">
          {platforms.map((p) => (
            <span
              key={p}
              className="font-heading text-[1.2rem] font-bold text-black opacity-70 hover:opacity-100 transition-opacity"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
