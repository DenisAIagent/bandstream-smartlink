"use client";

import { useTranslations } from "next-intl";
import { useFadeInAll } from "./useFadeIn";

export function Pricing() {
  const t = useTranslations("landing");
  const containerRef = useFadeInAll();

  return (
    <section id="tarifs" className="py-[120px] max-md:py-20">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <div className="mb-16 text-center fade-in-item opacity-0 translate-y-[30px] transition-all duration-[600ms]">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-green-accent mb-4">
            {t("pricing.label")}
          </p>
          <h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-bold mb-5 tracking-tight">
            {t("pricing.title")}
          </h2>
          <p className="text-[1.05rem] font-light text-[#888] max-w-[560px] mx-auto leading-relaxed">
            {t("pricing.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {/* Free */}
          <div className="flex flex-col p-10 rounded-[20px] border border-white/[0.06] bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 fade-in-item opacity-0 translate-y-[30px]">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-green-accent mb-2">
              {t("pricing.free.label")}
            </p>
            <h3 className="text-[1.4rem] font-bold mb-1">{t("pricing.free.name")}</h3>
            <p className="text-[0.85rem] font-light text-[#888] mb-6">{t("pricing.free.desc")}</p>
            <div className="mb-8">
              <span className="font-heading text-[3rem] font-bold text-green-accent leading-none">0</span>
              <span className="text-sm font-normal text-[#888]"> {t("pricing.free.period")}</span>
            </div>
            <ul className="list-none flex-1 mb-8">
              {[
                t("pricing.free.f1"),
                t("pricing.free.f2"),
                t("pricing.free.f3"),
                t("pricing.free.f4"),
                t("pricing.free.f5"),
              ].map((item, i) => (
                <li
                  key={i}
                  className="py-2.5 text-sm font-normal text-[#aaa] flex items-center gap-3 border-b border-white/[0.04]"
                >
                  <span className="w-[18px] h-[18px] min-w-[18px] rounded-full bg-green-accent/15 flex items-center justify-center">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0ED894" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#acces"
              className="inline-flex items-center justify-center w-full px-7 py-3 rounded-full bg-transparent text-white text-sm font-semibold tracking-wide border-[1.5px] border-white/20 hover:border-green-accent hover:text-green-accent transition-all duration-300"
            >
              {t("pricing.free.cta")}
            </a>
          </div>

          {/* Pro (featured) */}
          <div className="relative flex flex-col p-10 rounded-[20px] border border-green-accent bg-gradient-to-b from-green-accent/[0.08] to-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 fade-in-item opacity-0 translate-y-[30px]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-accent text-black text-xs font-bold px-4 py-1 rounded-full">
              {t("pricing.pro.badge")}
            </div>
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-green-accent mb-2">
              {t("pricing.pro.label")}
            </p>
            <h3 className="text-[1.4rem] font-bold mb-1">{t("pricing.pro.name")}</h3>
            <p className="text-[0.85rem] font-light text-[#888] mb-6">{t("pricing.pro.desc")}</p>
            <div className="mb-8">
              <span className="font-heading text-[3rem] font-bold text-green-accent leading-none">5</span>
              <span className="text-sm font-normal text-[#888]"> {t("pricing.pro.period")}</span>
            </div>
            <ul className="list-none flex-1 mb-8">
              {[
                t("pricing.pro.f1"),
                t("pricing.pro.f2"),
                t("pricing.pro.f3"),
                t("pricing.pro.f4"),
                t("pricing.pro.f5"),
              ].map((item, i) => (
                <li
                  key={i}
                  className="py-2.5 text-sm font-normal text-[#aaa] flex items-center gap-3 border-b border-white/[0.04]"
                >
                  <span className="w-[18px] h-[18px] min-w-[18px] rounded-full bg-green-accent/15 flex items-center justify-center">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0ED894" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#acces"
              className="inline-flex items-center justify-center w-full px-7 py-3 rounded-full bg-green-accent text-white text-sm font-semibold tracking-wide hover:bg-green-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(14,216,148,0.3)] transition-all duration-300"
            >
              {t("pricing.pro.cta")}
            </a>
          </div>

          {/* Campagne Pub */}
          <div className="relative flex flex-col p-10 rounded-[20px] border border-green-accent/30 bg-gradient-to-b from-green-accent/5 to-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 fade-in-item opacity-0 translate-y-[30px]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-accent text-white text-[0.7rem] font-bold px-3.5 py-1 rounded-full whitespace-nowrap">
              {t("pricing.campaign.badge")}
            </div>
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-green-accent mb-2">
              {t("pricing.campaign.label")}
            </p>
            <h3 className="text-[1.4rem] font-bold mb-1">{t("pricing.campaign.name")}</h3>
            <p className="text-[0.85rem] font-light text-[#888] mb-6">{t("pricing.campaign.desc")}</p>
            <div className="mb-8">
              <span className="font-heading text-[3rem] font-bold text-green-accent leading-none">200</span>
              <span className="text-sm font-normal text-[#888]"> {t("pricing.campaign.period")}</span>
            </div>
            <ul className="list-none flex-1 mb-8">
              {[
                t("pricing.campaign.f1"),
                t("pricing.campaign.f2"),
                t("pricing.campaign.f3"),
                t("pricing.campaign.f4"),
                t("pricing.campaign.f5"),
              ].map((item, i) => (
                <li
                  key={i}
                  className="py-2.5 text-sm font-normal text-[#aaa] flex items-center gap-3 border-b border-white/[0.04]"
                >
                  <span className="w-[18px] h-[18px] min-w-[18px] rounded-full bg-green-accent/15 flex items-center justify-center">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0ED894" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-[#888] mb-5 leading-relaxed">
              {t("pricing.campaign.budgetNote")}{" "}
              <span className="text-green-accent">{t("pricing.campaign.budgetHighlight")}</span>
              {t("pricing.campaign.budgetSuffix")}
            </p>
            <a
              href="#acces"
              className="inline-flex items-center justify-center w-full px-7 py-3 rounded-full bg-green-accent text-white text-sm font-semibold tracking-wide hover:bg-green-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(14,216,148,0.3)] transition-all duration-300"
            >
              {t("pricing.campaign.cta")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
