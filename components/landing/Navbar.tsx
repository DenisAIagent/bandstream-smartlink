"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { BandstreamLogo } from "./BandstreamLogo";

export function Navbar() {
  const t = useTranslations("landing");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] py-5 transition-all duration-300 ${
        scrolled
          ? "bg-black/85 backdrop-blur-[20px] border-b border-green-accent/10"
          : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <a href="#" className="nav-logo">
          <BandstreamLogo className="h-9 w-auto" />
        </a>
        <ul
          className={`items-center gap-8 list-none ${
            menuOpen
              ? "flex flex-col absolute top-full left-0 right-0 bg-black/95 backdrop-blur-[20px] p-6 gap-4 border-b border-white/5"
              : "hidden md:flex"
          }`}
        >
          <li>
            <a
              href="#comment-ca-marche"
              onClick={(e) => handleNavClick(e, "#comment-ca-marche")}
              className="text-sm font-medium text-[#aaa] hover:text-green-accent transition-colors tracking-wide"
            >
              {t("nav.howItWorks")}
            </a>
          </li>
          <li>
            <a
              href="#fonctionnalites"
              onClick={(e) => handleNavClick(e, "#fonctionnalites")}
              className="text-sm font-medium text-[#aaa] hover:text-green-accent transition-colors tracking-wide"
            >
              {t("nav.features")}
            </a>
          </li>
          <li>
            <a
              href="#tarifs"
              onClick={(e) => handleNavClick(e, "#tarifs")}
              className="text-sm font-medium text-[#aaa] hover:text-green-accent transition-colors tracking-wide"
            >
              {t("nav.pricing")}
            </a>
          </li>
          <li>
            <a
              href="#acces"
              onClick={(e) => handleNavClick(e, "#acces")}
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-green-accent text-white text-sm font-semibold tracking-wide hover:bg-green-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(14,216,148,0.3)] transition-all duration-300"
            >
              {t("nav.cta")}
            </a>
          </li>
        </ul>
        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className="block w-6 h-0.5 bg-white my-[5px]"></span>
          <span className="block w-6 h-0.5 bg-white my-[5px]"></span>
          <span className="block w-6 h-0.5 bg-white my-[5px]"></span>
        </button>
      </div>
    </nav>
  );
}
