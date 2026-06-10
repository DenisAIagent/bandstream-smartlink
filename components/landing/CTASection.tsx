"use client";

import { useTranslations } from "next-intl";
import { useFadeIn } from "./useFadeIn";

export function CTASection() {
  const t = useTranslations("landing");
  const fadeRef = useFadeIn();

  return (
    <section id="acces" className="py-[120px] max-md:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          ref={fadeRef}
          className="text-center px-10 max-md:px-6 py-20 max-md:py-12 rounded-3xl bg-gradient-to-br from-green-accent/10 to-green-accent/[0.02] border border-green-accent/15 opacity-0 translate-y-[30px] transition-all duration-[600ms]"
        >
          <h2 className="font-heading text-[clamp(2rem,3vw,2.8rem)] font-bold mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-[1.05rem] font-light text-[#888] mb-10 max-w-[500px] mx-auto">
            {t("cta.subtitle")}
          </p>
          <a
            href="mailto:contact@band.stream"
            className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-green-accent text-white text-base font-semibold tracking-wide hover:bg-green-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(14,216,148,0.3)] transition-all duration-300"
          >
            {t("cta.button")}
          </a>
        </div>
      </div>
    </section>
  );
}
