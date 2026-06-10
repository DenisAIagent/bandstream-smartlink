"use client";

import { useTranslations } from "next-intl";
import { BandstreamLogo } from "./BandstreamLogo";

export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="pt-[60px] pb-8 border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <div>
            <BandstreamLogo className="h-8 w-auto mb-4" />
            <p className="text-[0.85rem] font-light text-[#888] leading-relaxed max-w-[280px]">
              {t("footer.brandDesc")}
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-green-accent mb-5">
              {t("footer.product")}
            </h4>
            <ul className="list-none">
              <li className="mb-2.5">
                <a href="#fonctionnalites" className="text-[0.85rem] font-normal text-[#888] hover:text-green-accent transition-colors">
                  {t("footer.productLinks.features")}
                </a>
              </li>
              <li className="mb-2.5">
                <a href="#tarifs" className="text-[0.85rem] font-normal text-[#888] hover:text-green-accent transition-colors">
                  {t("footer.productLinks.pricing")}
                </a>
              </li>
              <li className="mb-2.5">
                <a href="#comment-ca-marche" className="text-[0.85rem] font-normal text-[#888] hover:text-green-accent transition-colors">
                  {t("footer.productLinks.howItWorks")}
                </a>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-green-accent mb-5">
              {t("footer.company")}
            </h4>
            <ul className="list-none">
              <li className="mb-2.5">
                <a href="#" className="text-[0.85rem] font-normal text-[#888] hover:text-green-accent transition-colors">
                  {t("footer.companyLinks.blog")}
                </a>
              </li>
              <li className="mb-2.5">
                <a href="#" className="text-[0.85rem] font-normal text-[#888] hover:text-green-accent transition-colors">
                  {t("footer.companyLinks.privacy")}
                </a>
              </li>
              <li className="mb-2.5">
                <a href="#" className="text-[0.85rem] font-normal text-[#888] hover:text-green-accent transition-colors">
                  {t("footer.companyLinks.terms")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-green-accent mb-5">
              {t("footer.contact")}
            </h4>
            <ul className="list-none">
              <li className="mb-2.5">
                <a href="mailto:contact@band.stream" className="text-[0.85rem] font-normal text-[#888] hover:text-green-accent transition-colors">
                  contact@band.stream
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/[0.06] gap-4 text-center">
          <p className="text-[0.8rem] text-[#888]">&copy; 2026 band.stream</p>
          <p className="text-[0.8rem] text-[#888]">www.band.stream</p>
        </div>
      </div>
    </footer>
  );
}
