"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useFadeIn } from "./useFadeIn";

export function Hero() {
  const t = useTranslations("landing");
  const fadeRef = useFadeIn();

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-20">
      {/* Glow */}
      <div className="absolute w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(14,216,148,0.1)_0%,transparent_70%)] -right-[150px] top-[15%] pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
        {/* Left content */}
        <div className="relative z-[2]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-accent/20 bg-green-accent/5 text-[0.8rem] font-medium text-green-accent mb-8">
            <span className="w-1.5 h-1.5 bg-green-accent rounded-full animate-pulse" />
            {t("hero.badge")}
          </div>
          <h1 className="font-heading text-[clamp(2.6rem,4.5vw,4rem)] font-bold mb-6 leading-[1.15] tracking-tight">
            {t("hero.title1")}
            <br />
            {t("hero.title2")}
            <br />
            <span className="text-green-accent">{t("hero.title3")}</span>
          </h1>
          <p className="text-[1.1rem] font-light text-[#aaa] mb-10 max-w-[480px] leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start mb-10">
            <a
              href="#acces"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-green-accent text-white text-base font-semibold tracking-wide hover:bg-green-dark hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(14,216,148,0.3)] transition-all duration-300"
            >
              {t("hero.cta1")}
            </a>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-transparent text-white text-base font-semibold tracking-wide border-[1.5px] border-white/20 hover:border-green-accent hover:text-green-accent transition-all duration-300"
            >
              {t("hero.cta2")}
            </a>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-[#888] font-normal">{t("hero.compatibleWith")}</span>
            {["Spotify", "Apple Music", "YouTube Music", "Deezer", "+3"].map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-white/[0.06] text-xs font-medium text-[#aaa]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Smartlink preview */}
        <div className="relative z-[2] flex items-center justify-center" ref={fadeRef}>
          <div className="w-[340px] max-w-full rounded-3xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
            <div className="bg-gradient-to-br from-green-accent/15 to-green-accent/5 px-6 py-8 text-center">
              <div className="w-[72px] h-[72px] rounded-full mx-auto mb-3 overflow-hidden">
                <Image
                  src="/images/bandstream/avatar-artiste.jpg"
                  alt="Artist avatar"
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-heading text-[1.1rem] font-semibold mb-0.5">{t("hero.smartlink.name")}</div>
              <div className="text-xs text-green-accent font-normal">{t("hero.smartlink.url")}</div>
            </div>
            <div className="p-4">
              {[
                { name: "Spotify", bg: "#1DB954", icon: <SpotifyIcon /> },
                { name: "Apple Music", bg: "#FA243C", icon: <AppleMusicIcon /> },
                { name: "YouTube Music", bg: "#FF0000", icon: <YouTubeMusicIcon /> },
                { name: "Deezer", bg: "#A238FF", icon: <DeezerIcon /> },
                { name: "Tidal", bg: "#000", icon: <TidalIcon />, border: true },
                { name: "Qobuz", bg: "#4285F4", icon: <QobuzIcon /> },
              ].map((link) => (
                <div
                  key={link.name}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2 transition-all duration-300 hover:border-green-accent/20 hover:bg-green-accent/[0.04] cursor-pointer"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.7rem] font-bold text-white"
                    style={{
                      background: link.bg,
                      border: link.border ? "1px solid #2a2a2a" : undefined,
                    }}
                  >
                    {link.icon}
                  </div>
                  <span className="text-[0.85rem] font-medium flex-1">{link.name}</span>
                  <span className="text-xs text-[#888]">&rarr;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Official Spotify logo — from designer-provided SVG */
function SpotifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 236 225" fill="#fff">
      <path d="m122.37,3.31C61.99.91,11.1,47.91,8.71,108.29c-2.4,60.38,44.61,111.26,104.98,113.66,60.38,2.4,111.26-44.6,113.66-104.98C229.74,56.59,182.74,5.7,122.37,3.31Zm46.18,160.28c-1.36,2.4-4.01,3.6-6.59,3.24-.79-.11-1.58-.37-2.32-.79-14.46-8.23-30.22-13.59-46.84-15.93-16.62-2.34-33.25-1.53-49.42,2.4-3.51.85-7.04-1.3-7.89-4.81-.85-3.51,1.3-7.04,4.81-7.89,17.78-4.32,36.06-5.21,54.32-2.64,18.26,2.57,35.58,8.46,51.49,17.51,3.13,1.79,4.23,5.77,2.45,8.91Zm14.38-28.72c-2.23,4.12-7.39,5.66-11.51,3.43-16.92-9.15-35.24-15.16-54.45-17.86-19.21-2.7-38.47-1.97-57.26,2.16-1.02.22-2.03.26-3.01.12-3.41-.48-6.33-3.02-7.11-6.59-1.01-4.58,1.89-9.11,6.47-10.12,20.77-4.57,42.06-5.38,63.28-2.4,21.21,2.98,41.46,9.62,60.16,19.74,4.13,2.23,5.66,7.38,3.43,11.51Zm15.94-32.38c-2.1,4.04-6.47,6.13-10.73,5.53-1.15-.16-2.28-.52-3.37-1.08-19.7-10.25-40.92-17.02-63.07-20.13-22.15-3.11-44.42-2.45-66.18,1.97-5.66,1.15-11.17-2.51-12.32-8.16-1.15-5.66,2.51-11.17,8.16-12.32,24.1-4.89,48.74-5.62,73.25-2.18,24.51,3.44,47.99,10.94,69.81,22.29,5.12,2.66,7.11,8.97,4.45,14.09Z" />
    </svg>
  );
}

/* Official Apple Music glyph — from designer-provided SVG (music note only) */
function AppleMusicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 73 73" fill="#fff">
      <path fillRule="evenodd" clipRule="evenodd" d="M50.9,11c-0.17,0.02-1.72,0.29-1.91,0.33l-21.4,4.32l-0.01,0c-0.56,0.12-1,0.32-1.33,0.6 c-0.41,0.34-0.63,0.83-0.72,1.39c-0.02,0.12-0.05,0.36-0.05,0.72c0,0,0,21.86,0,26.78c0,0.63-0.05,1.23-0.47,1.75 c-0.42,0.52-0.95,0.67-1.56,0.8c-0.47,0.09-0.93,0.19-1.4,0.28c-1.77,0.36-2.92,0.6-3.96,1c-1,0.39-1.74,0.88-2.34,1.5 c-1.18,1.23-1.66,2.91-1.49,4.48c0.14,1.34,0.74,2.62,1.78,3.56c0.7,0.64,1.57,1.13,2.6,1.33c1.07,0.21,2.2,0.14,3.86-0.2 c0.88-0.18,1.71-0.46,2.5-0.92c0.78-0.46,1.45-1.07,1.97-1.82c0.52-0.75,0.86-1.58,1.05-2.47c0.19-0.91,0.24-1.74,0.24-2.65V28.56 c0-1.24,0.35-1.57,1.36-1.82c0,0,17.79-3.59,18.62-3.75c1.16-0.22,1.7,0.11,1.7,1.32v15.86c0,0.63-0.01,1.26-0.43,1.78 c-0.42,0.52-0.95,0.67-1.56,0.8c-0.47,0.09-0.93,0.19-1.4,0.28c-1.77,0.36-2.92,0.6-3.96,1c-1,0.39-1.74,0.88-2.34,1.5 c-1.18,1.23-1.7,2.91-1.53,4.48c0.14,1.34,0.78,2.62,1.82,3.56c0.7,0.64,1.57,1.11,2.6,1.32c1.07,0.21,2.2,0.14,3.86-0.2 c0.88-0.18,1.71-0.44,2.5-0.91c0.78-0.46,1.45-1.07,1.97-1.82c0.52-0.75,0.86-1.58,1.05-2.47c0.19-0.91,0.2-1.74,0.2-2.65V12.89 C52.71,11.66,52.06,10.9,50.9,11z" />
    </svg>
  );
}

/* Official YouTube Music icon — from designer-provided SVG (circle + ring + play triangle) */
function YouTubeMusicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 469.336 469.336" fill="#fff">
      <g transform="translate(-21.332031,-21.332031)">
        <path d="M256,133.33203C323.625,133.33203 378.66797,188.375 378.66797,256 378.66797,323.625 323.625,378.66797 256,378.66797 188.375,378.66797 133.33203,323.625 133.33203,256 133.33203,188.375 188.375,133.33203 256,133.33203M256,112c-79.57422,0-144,64.42578-144,144 0,79.57422 64.42578,144 144,144 79.57422,0 144-64.42578 144-144 0-79.57422-64.42578-144-144-144z" />
        <path d="M213.33203,320 320,256 213.33203,192Z" />
      </g>
    </svg>
  );
}

/* Official Deezer equalizer — from designer-provided SVG (wavy pattern only, no text) */
function DeezerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 349 318" fill="#fff">
      <path d="M261.171 0C269.875 0 277.631 19.0978 282.387 48.4551C285.325 31.4242 289.636 20.7144 294.412 20.6934H294.423C303.329 20.7248 310.549 57.8657 310.549 103.722C310.549 149.578 303.319 186.751 294.402 186.751C290.747 186.751 287.374 180.44 284.658 169.863C280.367 208.579 271.461 235.195 261.151 235.195C253.174 235.195 246.014 219.208 241.208 193.993C237.926 241.946 229.667 275.968 220.014 275.969C213.955 275.969 208.431 262.487 204.342 240.535C199.424 285.85 188.064 317.601 174.816 317.601C161.569 317.6 150.188 285.859 145.291 240.535C141.232 262.486 135.709 275.968 129.62 275.969C119.967 275.969 111.727 241.947 108.425 193.993C103.618 219.207 96.4797 235.195 88.4824 235.195C78.1829 235.195 69.2671 208.59 64.9756 169.863C62.2797 180.47 58.8866 186.75 55.2314 186.751C46.3153 186.751 39.085 149.578 39.085 103.722C39.085 57.8652 46.3153 20.6934 55.2314 20.6934C60.0175 20.694 64.299 31.4345 67.2676 48.4551C72.0235 19.0876 79.748 0 88.4824 0C98.8526 0.000139024 107.84 26.9942 112.091 66.1914C116.251 37.6632 122.562 19.4758 129.63 19.4756C139.536 19.4756 147.957 55.2467 151.077 105.144C156.944 79.561 165.436 63.5117 174.837 63.5117C184.238 63.5117 192.729 79.5713 198.586 105.144C201.716 55.2474 210.128 19.4767 220.033 19.4756C227.091 19.4756 233.393 37.663 237.573 66.1914C241.814 26.9945 250.801 0.000556067 261.171 0Z" />
      <path d="M25.1709 58.4346C30.2297 58.4346 34.3291 75.0567 34.3291 95.5557C34.3291 116.055 30.2297 132.677 25.1709 132.677C20.1122 132.677 16.0127 116.054 16.0127 95.5557C16.0127 75.0569 20.1122 58.4348 25.1709 58.4346Z" />
      <path d="M324.454 58.4346C329.513 58.4346 333.612 75.0567 333.612 95.5557C333.612 116.055 329.513 132.677 324.454 132.677C319.395 132.677 315.296 116.054 315.296 95.5557C315.296 75.0569 319.395 58.4348 324.454 58.4346Z" />
    </svg>
  );
}

/* Tidal — from simpleicons.org */
function TidalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
      <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996 4.004 12l4.004-4.004L12.012 12l-4.004 4.004 4.004 4.004 4.004-4.004L12.012 12l4.004-4.004-4.004-4.004zM16.042 7.996l3.979-3.979L24 7.996l-3.979 3.979z" />
    </svg>
  );
}

/* Qobuz — magnifying glass icon */
function QobuzIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
      <path d="M11.8 1C5.9 1 1.1 5.8 1.1 11.7c0 5.9 4.8 10.7 10.7 10.7 1.7 0 3.4-.4 4.8-1.2l2.1 2.1 1.8-1.8-2.1-2.1c2.1-2 3.4-4.8 3.4-7.9C21.9 5.7 17.4 1 11.8 1zm0 18.8c-4.5 0-8.1-3.6-8.1-8.1s3.6-8.1 8.1-8.1 8.1 3.6 8.1 8.1-3.6 8.1-8.1 8.1z" />
    </svg>
  );
}
