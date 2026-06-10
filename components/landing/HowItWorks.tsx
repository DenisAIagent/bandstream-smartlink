"use client";

import { useTranslations } from "next-intl";
import { useFadeInAll } from "./useFadeIn";

export function HowItWorks() {
  const t = useTranslations("landing");
  const containerRef = useFadeInAll();

  return (
    <section
      id="comment-ca-marche"
      className="py-[120px] max-md:py-20 bg-[#111] border-t border-b border-white/[0.04]"
    >
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <div className="mb-16 text-center fade-in-item opacity-0 translate-y-[30px] transition-all duration-[600ms]">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-green-accent mb-4">
            {t("howItWorks.label")}
          </p>
          <h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-bold mb-5 tracking-tight">
            {t("howItWorks.title")}
          </h2>
          <p className="text-[1.05rem] font-light text-[#888] max-w-[560px] mx-auto leading-relaxed">
            {t("howItWorks.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-0.5 bg-gradient-to-r from-green-accent to-green-accent/20" />

          {[
            { num: "1", title: t("howItWorks.step1.title"), desc: t("howItWorks.step1.desc") },
            { num: "2", title: t("howItWorks.step2.title"), desc: t("howItWorks.step2.desc") },
            { num: "3", title: t("howItWorks.step3.title"), desc: t("howItWorks.step3.desc") },
          ].map((step) => (
            <div
              key={step.num}
              className="text-center px-6 py-10 fade-in-item opacity-0 translate-y-[30px] transition-all duration-[600ms]"
            >
              <div className="w-14 h-14 rounded-full bg-green-accent/10 border-2 border-green-accent flex items-center justify-center mx-auto mb-6 font-heading text-[1.3rem] font-bold text-green-accent relative z-[2]">
                {step.num}
              </div>
              <h3 className="font-heading text-[1.15rem] font-semibold mb-2.5">{step.title}</h3>
              <p className="text-sm font-light text-[#888] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
