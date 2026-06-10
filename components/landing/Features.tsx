"use client";

import { useTranslations } from "next-intl";
import { useFadeInAll } from "./useFadeIn";

const featureIcons = [
  // Smart Links
  <svg key="links" viewBox="0 0 24 24" className="w-6 h-6 stroke-green-accent fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
  // Analytics
  <svg key="analytics" viewBox="0 0 24 24" className="w-6 h-6 stroke-green-accent fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-4" />
  </svg>,
  // Events
  <svg key="events" viewBox="0 0 24 24" className="w-6 h-6 stroke-green-accent fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>,
  // Languages
  <svg key="langs" viewBox="0 0 24 24" className="w-6 h-6 stroke-green-accent fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>,
  // Domain
  <svg key="domain" viewBox="0 0 24 24" className="w-6 h-6 stroke-green-accent fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>,
  // GDPR
  <svg key="gdpr" viewBox="0 0 24 24" className="w-6 h-6 stroke-green-accent fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>,
];

export function Features() {
  const t = useTranslations("landing");
  const containerRef = useFadeInAll();

  const features = [
    { title: t("features.smartLinks.title"), desc: t("features.smartLinks.desc") },
    { title: t("features.analytics.title"), desc: t("features.analytics.desc") },
    { title: t("features.events.title"), desc: t("features.events.desc") },
    { title: t("features.languages.title"), desc: t("features.languages.desc") },
    { title: t("features.domain.title"), desc: t("features.domain.desc") },
    { title: t("features.gdpr.title"), desc: t("features.gdpr.desc") },
  ];

  return (
    <section id="fonctionnalites" className="py-[120px] max-md:py-20">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <div className="mb-16 text-center fade-in-item opacity-0 translate-y-[30px] transition-all duration-[600ms]">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-green-accent mb-4">
            {t("features.label")}
          </p>
          <h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-bold mb-5 tracking-tight">
            {t("features.title")}
          </h2>
          <p className="text-[1.05rem] font-light text-[#888] max-w-[560px] mx-auto leading-relaxed">
            {t("features.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className="relative overflow-hidden p-9 rounded-2xl bg-[#1a1a1a] border border-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:border-green-accent/15 group fade-in-item opacity-0 translate-y-[30px]"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <div className="w-12 h-12 rounded-xl bg-green-accent/10 flex items-center justify-center mb-5">
                {featureIcons[i]}
              </div>
              <h3 className="font-heading text-[1.1rem] font-semibold mb-2.5">{feat.title}</h3>
              <p className="text-[0.85rem] font-light text-[#888] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
