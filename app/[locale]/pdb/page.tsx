import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `band.stream — Le tracking pub à 5€/mois. C'est terminé.`,
  description: `de 25 à 46€/mois pour tracker vos campagnes ? C'est terminé. band.stream : smartlinks + GTM + Meta Pixel + RGPD à 5€/mois. Cofondé par un ex-Google, un cofondateur de Ledger et un ex-GM Accor.`,
  openGraph: {
    title: `Tu paies la pub mais tu ne peux pas la tracker  -  band.stream résout ça pour 5€/mois`,
    description: `Sans suivi de conversion, tes campagnes pub sont aveugles et les régies te pénalisent. band.stream : smartlinks + GTM + Meta Pixel + RGPD à 5€/mois. Alpha privée.`,
    type: 'website',
    url: 'https://www.band.stream/pdb',
  },
};

// Landing page content from #65.
// FR version. When EN is provided, use the locale param to switch:
//   const { locale } = await params;
//   const html = locale === 'fr' ? frBody : enBody;

const cssContent = `*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{
      --black:#000;--green:#0ED894;--green-dk:#0bc07f;--white:#fff;
      --g9:#111;--g8:#1a1a1a;--g7:#2a2a2a;--g5:#666;--g4:#888;--g3:#aaa;--g2:#555;
    }
    html{scroll-behavior:smooth}
    body{font-family:var(--font-poppins,'Poppins'),system-ui,sans-serif;background:var(--black);color:var(--white);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
    a{text-decoration:none;color:inherit}
    .mx{max-width:1200px;margin:0 auto;padding:0 24px}
    section{padding:100px 0}

    /* NAV */
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:18px 0;transition:all .3s}
    .nav.scrolled{background:rgba(0,0,0,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(14,216,148,.08)}
    .nav .mx{display:flex;align-items:center;justify-content:space-between}
    .nav-logo svg{height:34px;width:auto}
    .nav-r{display:flex;align-items:center;gap:28px}
    .nav-r>a{font-size:.85rem;font-weight:500;color:var(--g3);transition:color .2s;letter-spacing:.01em}
    .nav-r>a:hover{color:var(--green)}
    .btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 26px;border-radius:50px;font-family:inherit;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .3s;border:none}
    .btn-g{background:var(--green);color:var(--white) !important}
    .btn-g:hover{background:var(--green-dk);transform:translateY(-2px);box-shadow:0 8px 30px rgba(14,216,148,.3)}
    .btn-o{background:transparent;color:var(--white);border:1.5px solid rgba(255,255,255,.12)}
    .btn-o:hover{border-color:var(--green);color:var(--green)}

    /* HERO */
    .hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:100px 0 80px}
    .hero-glow{position:absolute;width:700px;height:700px;background:radial-gradient(circle,rgba(14,216,148,.1) 0%,transparent 70%);right:-200px;top:10%;pointer-events:none}
    .hero .mx{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:7px 16px;border-radius:50px;border:1px solid rgba(14,216,148,.2);background:rgba(14,216,148,.04);font-size:.78rem;font-weight:500;color:var(--green);margin-bottom:28px}
    .badge::before{content:'';width:6px;height:6px;background:var(--green);border-radius:50%;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    .hero h1{font-size:clamp(2.6rem,4.2vw,3.6rem);font-weight:800;margin-bottom:20px;letter-spacing:-.03em;line-height:1.08}
    .hero h1 .acc{color:var(--green)}
    .hero-sub{font-size:1.05rem;font-weight:300;color:var(--g4);margin-bottom:36px;max-width:480px;line-height:1.7}
    .hero-sub strong{color:var(--white);font-weight:600}
    .email-form{display:flex;gap:10px;margin-bottom:10px}
    .email-form input{flex:1;min-width:0;padding:14px 20px;border-radius:50px;background:var(--g8);border:1.5px solid rgba(255,255,255,.08);color:var(--white);font-family:inherit;font-size:.85rem;outline:none;transition:border-color .2s}
    .email-form input:focus{border-color:var(--green)}
    .email-form input::placeholder{color:#555}
    .email-form .btn-g{white-space:nowrap}
    .hero-hint{font-size:.72rem;color:var(--g2);margin-bottom:28px}
    .pills{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .pills>span{font-size:.72rem;color:var(--g2)}
    .pill{padding:5px 12px;border-radius:50px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:.72rem;font-weight:500;color:var(--g4)}

    /* PRISM MOCKUP */
    .hero-visual{position:relative;z-index:2;display:flex;justify-content:center}
    .prism-mock{width:360px;position:relative}
    .prism-mock::before{content:'';position:absolute;inset:-50px;background:radial-gradient(circle,rgba(14,216,148,.12),transparent 65%);border-radius:50%;filter:blur(40px);pointer-events:none}
    .prism-bg{position:absolute;inset:0;border-radius:28px;overflow:hidden}
    .prism-bg img{width:100%;height:100%;object-fit:cover;opacity:.2;transform:scale(1.05)}
    .prism-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.3) 0%,rgba(0,0,0,.7) 50%,rgba(0,0,0,.95) 100%)}
    .prism-card{position:relative;border-radius:28px;border:1px solid rgba(255,255,255,.1);overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.6)}
    .prism-artwork{position:relative}
    .prism-artwork img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
    .prism-artwork::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.95) 100%)}
    .prism-info{position:absolute;bottom:0;left:0;right:0;padding:20px 24px;z-index:2}
    .prism-title{font-size:1.4rem;font-weight:700;letter-spacing:-.02em}
    .prism-artist{font-size:.85rem;color:rgba(255,255,255,.55);font-weight:400;margin-top:2px}
    .prism-links{padding:12px 16px 16px}
    .prism-cta{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:16px;margin-bottom:8px;color:#fff;font-weight:600;font-size:.9rem;transition:all .2s;position:relative;overflow:hidden}
    .prism-cta .shimmer{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.08) 50%,transparent 60%);transform:translateX(-100%);transition:transform .6s}
    .prism-cta:hover .shimmer{transform:translateX(100%)}
    .prism-cta:hover{transform:scale(1.02)}
    .prism-cta-icon{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
    .prism-cta-play{margin-left:auto;opacity:.7}
    .prism-link{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;background:rgba(255,255,255,.05);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.06);margin-bottom:6px;transition:all .2s}
    .prism-link:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.1)}
    .prism-accent-bar{width:3px;height:28px;border-radius:2px;opacity:.5}
    .prism-link:hover .prism-accent-bar{opacity:1}
    .prism-link-icon{width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center}
    .prism-link-name{flex:1;font-size:.82rem;font-weight:500;color:rgba(255,255,255,.75)}
    .prism-link:hover .prism-link-name{color:#fff}
    .prism-link-action{font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.3)}
    .prism-nl{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.05);backdrop-filter:blur(8px);margin:8px 16px 4px}
    .prism-nl-icon{width:32px;height:32px;border-radius:10px;background:rgba(14,216,148,.15);display:flex;align-items:center;justify-content:center}
    .prism-nl-text{flex:1}
    .prism-nl-text p:first-child{font-size:.82rem;font-weight:500;color:rgba(255,255,255,.8)}
    .prism-nl-text p:last-child{font-size:.7rem;color:rgba(255,255,255,.3)}
    .prism-nl-arrow{font-size:.7rem;color:rgba(255,255,255,.2)}
    .prism-footer{text-align:center;padding:16px 0 20px;display:flex;align-items:center;justify-content:center;gap:4px}
    .prism-footer span{font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.12);font-weight:500}
    .prism-footer strong{font-size:.65rem;font-weight:600;color:rgba(14,216,148,.3)}

    /* SECTIONS */
    .s-label{font-size:.72rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--green);margin-bottom:14px}
    .s-title{font-size:clamp(1.9rem,3.2vw,2.6rem);font-weight:700;margin-bottom:16px;letter-spacing:-.02em;line-height:1.15}
    .s-sub{font-size:1rem;font-weight:300;color:var(--g4);max-width:500px;line-height:1.7}
    .s-center{text-align:center}.s-center .s-sub{margin:0 auto}
    .s-header{margin-bottom:52px}

    /* FEATURES */
    .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .feat{padding:32px 24px;border-radius:18px;background:var(--g9);border:1px solid rgba(255,255,255,.05);transition:all .3s;position:relative;overflow:hidden}
    .feat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--green);transform:scaleX(0);transition:transform .3s;transform-origin:left}
    .feat:hover::before{transform:scaleX(1)}
    .feat:hover{transform:translateY(-3px);border-color:rgba(14,216,148,.15)}
    .feat-ic{width:44px;height:44px;border-radius:12px;background:rgba(14,216,148,.08);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
    .feat-ic svg{width:22px;height:22px;stroke:var(--green);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .feat h3{font-size:1.02rem;font-weight:600;margin-bottom:8px}
    .feat p{font-size:.82rem;font-weight:300;color:var(--g4);line-height:1.65}

    /* STEPS */
    .steps{background:var(--g9);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)}
    .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;position:relative}
    .steps-grid::before{content:'';position:absolute;top:36px;left:calc(16.66% + 16px);right:calc(16.66% + 16px);height:2px;background:linear-gradient(90deg,var(--green),rgba(14,216,148,.2));z-index:0}
    .step{text-align:center;position:relative;z-index:1}
    .step-num{width:72px;height:72px;border-radius:50%;background:rgba(14,216,148,.08);border:2px solid rgba(14,216,148,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:1.6rem;font-weight:700;color:var(--green)}
    .step h3{font-size:1rem;font-weight:600;margin-bottom:8px}
    .step p{font-size:.82rem;font-weight:300;color:var(--g4);line-height:1.6;max-width:280px;margin:0 auto}

    /* DEMO */
    .demo{background:var(--g9);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)}
    .demo .mx{display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:center}
    .demo{padding-left:0;padding-right:0}
    .demo .mx{max-width:100%;padding:0}
    .demo .mx>div:first-child{padding-left:max(24px,calc((100vw - 1120px)/2));padding-right:40px}
    .carousel-wrap{overflow:hidden}
    /* CAROUSEL */
    .carousel-wrap{margin-top:0}
    .carousel-viewport{overflow:hidden;position:relative;border-radius:16px}
    .carousel-track{display:flex;transition:transform .45s cubic-bezier(.22,1,.36,1)}
    .carousel-slide{min-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 8px 8px}
    .tpl-mock{position:relative}
    .tpl-label{text-align:center;margin-top:14px;font-size:.85rem;font-weight:600;color:rgba(255,255,255,.7);letter-spacing:.02em}
    .carousel-nav{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:14px}
    .carousel-arrow{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:rgba(255,255,255,.6);font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .carousel-arrow:hover{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)}
    .carousel-dots{display:flex;gap:8px}
    .carousel-dots button{width:8px;height:8px;border-radius:50%;border:none;background:rgba(255,255,255,.15);cursor:pointer;padding:0;transition:all .25s}
    .carousel-dots button.active{background:var(--green);width:24px;border-radius:4px}
    .check-list{margin-top:24px}
    .check-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
    .check-dot{width:18px;height:18px;min-width:18px;border-radius:50%;background:rgba(14,216,148,.12);display:flex;align-items:center;justify-content:center;margin-top:3px}
    .check-dot svg{width:10px;height:10px}
    .check-item span{font-size:.85rem;color:var(--g3);line-height:1.5}

    /* PRICING */
    .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1000px;margin:0 auto}
    .p-card{padding:36px 28px;border-radius:20px;border:1px solid rgba(255,255,255,.05);background:var(--g8);display:flex;flex-direction:column;transition:all .3s}
    .p-card.ft{border-color:var(--green);background:linear-gradient(180deg,rgba(14,216,148,.06) 0%,var(--g8) 100%);position:relative}
    .p-card:hover{transform:translateY(-3px)}
    .p-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--green);color:var(--black);font-size:.68rem;font-weight:700;padding:3px 14px;border-radius:50px}
    .p-label{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--green);margin-bottom:6px}
    .p-name{font-size:1.3rem;font-weight:700;margin-bottom:3px}
    .p-desc{font-size:.82rem;font-weight:300;color:var(--g4);margin-bottom:20px}
    .p-price{margin-bottom:28px}
    .p-price .amt{font-size:2.8rem;font-weight:700;color:var(--green);line-height:1}
    .p-price .per{font-size:.82rem;font-weight:400;color:var(--g4)}
    .p-features{list-style:none;flex:1;margin-bottom:28px}
    .p-features li{padding:8px 0;font-size:.82rem;font-weight:400;color:var(--g3);display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,.03)}
    .p-features li::before{content:'';width:16px;height:16px;min-width:16px;border-radius:50%;background:rgba(14,216,148,.12) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230ED894' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") center/10px no-repeat}
    .p-services{font-size:.78rem;color:var(--g5);margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,.04);line-height:1.5}
    .p-services a{color:var(--green);font-weight:500}

    /* CAMPAIGN */
    .campaign-box{max-width:800px;margin:32px auto 0;padding:28px 32px;border-radius:18px;background:linear-gradient(135deg,rgba(14,216,148,.06),rgba(14,216,148,.02));border:1px solid rgba(14,216,148,.12);display:flex;align-items:center;gap:24px}
    .campaign-box-icon{width:56px;height:56px;min-width:56px;border-radius:16px;background:rgba(14,216,148,.1);display:flex;align-items:center;justify-content:center}
    .campaign-box-icon svg{width:28px;height:28px;stroke:var(--green);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .campaign-box h4{font-size:1rem;font-weight:600;margin-bottom:4px}
    .campaign-box p{font-size:.82rem;color:var(--g4);line-height:1.6;font-weight:300}
    .campaign-box .btn{margin-top:12px}

    /* COMPARISON */
    .cmp-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -24px;padding:0 24px}
    .cmp{width:100%;min-width:700px;border-collapse:collapse;font-size:.82rem}
    .cmp th,.cmp td{padding:14px 16px;text-align:center;border-bottom:1px solid rgba(255,255,255,.05)}
    .cmp th{font-weight:600;color:var(--g3);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
    .cmp th:first-child,.cmp td:first-child{text-align:left;font-weight:500;color:var(--g3);padding-left:0}
    .cmp td{color:var(--g4);font-weight:400}
    .cmp .hl{background:rgba(14,216,148,.04);position:relative}
    .cmp .hl::before{content:'';position:absolute;top:0;bottom:0;left:0;width:2px;background:var(--green)}
    .cmp thead th.hl{color:var(--green);font-weight:700;font-size:.78rem}
    .cmp .hl{color:var(--white);font-weight:500}
    .cmp .yes{color:var(--green);font-weight:600}
    .cmp .no{color:var(--g5)}
    .cmp .price{color:var(--green);font-weight:700;font-size:.95rem}
    .cmp .others-price{color:var(--g4);font-weight:500}
    .cmp-note{text-align:center;margin-top:20px;font-size:.75rem;color:var(--g5);font-style:italic}

    /* FAQ */
    .faq-grid{max-width:800px;margin:0 auto}
    .faq-item{border-bottom:1px solid rgba(255,255,255,.06);overflow:hidden}
    .faq-q{display:flex;align-items:center;justify-content:space-between;padding:20px 0;cursor:pointer;font-size:.95rem;font-weight:500;color:var(--white);transition:color .2s;gap:16px}
    .faq-q:hover{color:var(--green)}
    .faq-q svg{width:18px;height:18px;min-width:18px;stroke:var(--g4);transition:transform .3s,stroke .3s}
    .faq-item.open .faq-q svg{transform:rotate(45deg);stroke:var(--green)}
    .faq-a{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease}
    .faq-item.open .faq-a{max-height:200px;padding-bottom:20px}
    .faq-a p{font-size:.85rem;color:var(--g4);line-height:1.7;font-weight:300}

    /* CTA */
    .cta-box{text-align:center;padding:72px 40px;border-radius:24px;background:linear-gradient(135deg,rgba(14,216,148,.08),rgba(14,216,148,.02));border:1px solid rgba(14,216,148,.12)}
    .cta-box h2{font-size:clamp(1.8rem,2.8vw,2.4rem);font-weight:700;margin-bottom:14px}
    .cta-box p{font-size:1rem;font-weight:300;color:var(--g4);margin-bottom:36px;max-width:460px;margin-left:auto;margin-right:auto}
    .cta-box .email-form{justify-content:center;max-width:480px;margin:0 auto}

    /* FOOTER */
    .footer{padding:56px 0 28px;border-top:1px solid rgba(255,255,255,.05)}
    .footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px}
    .footer-brand p{font-size:.82rem;font-weight:300;color:var(--g4);line-height:1.7;max-width:260px;margin-top:14px}
    .footer-col h4{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--green);margin-bottom:16px}
    .footer-col ul{list-style:none}
    .footer-col li{margin-bottom:8px}
    .footer-col a{font-size:.82rem;font-weight:400;color:var(--g4);transition:color .2s}
    .footer-col a:hover{color:var(--green)}
    .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:28px;border-top:1px solid rgba(255,255,255,.05)}
    .footer-bottom p{font-size:.75rem;color:var(--g5)}

    /* BASELINE */
    .baseline-divider{padding:64px 24px;text-align:center}
    .baseline-divider span{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:300;font-style:italic;color:var(--green);letter-spacing:.02em}
    /* PATTERN CTA */
    .cta-box{position:relative;overflow:hidden}
    .cta-box::before{content:'';position:absolute;inset:0;background:url('BANDSTREAM-pattern-vert.svg') repeat center/300px;opacity:.06;pointer-events:none}
    /* SPEECH BUBBLE DECO */
    .hero::after{content:'';position:absolute;right:-80px;top:50%;transform:translateY(-50%);width:280px;height:280px;background:rgba(255,255,255,.02);border-radius:50%;pointer-events:none}

    /* ANIMATIONS */
    .fade-in{opacity:0;transform:translateY(24px);transition:opacity .5s ease,transform .5s ease}
    .fade-in.visible{opacity:1;transform:translateY(0)}

    /* RESPONSIVE */
    @media(max-width:1024px){
      .hero .mx,.demo .mx{grid-template-columns:1fr;gap:48px;text-align:center;max-width:1120px;padding:0 24px}
      .demo .mx>div:first-child{padding-left:0;padding-right:0}
      .hero-sub{margin-left:auto;margin-right:auto}
      .pills{justify-content:center}
      .hero-visual{justify-content:center}
      .footer-top{grid-template-columns:1fr 1fr}
      .campaign-box{flex-direction:column;text-align:center}
      .steps-grid::before{display:none}
    }
    @media(max-width:768px){
      section{padding:72px 0}
      .nav-r{display:none}
      .feat-grid,.pricing-grid{grid-template-columns:1fr!important}
      .steps-grid{grid-template-columns:1fr;gap:40px}
      .email-form{flex-direction:column}
      .cta-box{padding:48px 20px}
      .footer-top{grid-template-columns:1fr;gap:28px}
      .footer-bottom{flex-direction:column;gap:12px;text-align:center}
      .prism-mock{width:100%;max-width:340px}
    }
    /* Modal RDV */
    .rdv-overlay{display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);padding:20px}
    .rdv-box{background:#111;border:1px solid rgba(14,216,148,.2);border-radius:20px;padding:36px;max-width:480px;width:100%;position:relative}
    .rdv-close{position:absolute;top:16px;right:16px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer;line-height:1}
    .rdv-box h3{color:#fff;font-size:1.4rem;margin-bottom:8px}
    .rdv-box p{color:rgba(255,255,255,.6);font-size:.9rem;margin-bottom:24px}
    .rdv-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
    .rdv-field label{color:rgba(255,255,255,.7);font-size:.85rem}
    .rdv-field input,.rdv-field textarea{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 14px;color:#fff;font-size:.95rem;font-family:inherit;outline:none;transition:border .2s}
    .rdv-field input:focus,.rdv-field textarea:focus{border-color:var(--green)}
    .rdv-field textarea{resize:vertical;min-height:80px}
    .rdv-submit{width:100%;margin-top:8px}`;
const bodyContent = `<!-- NAV -->
  <nav class="nav" id="navbar">
    <div class="mx">
      <a href="/" class="nav-logo">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 283.5 121.9"><path fill="#fff" d="M106.9,25.8c0-.8.5-1.2,1.2-1.2s1.2.5,1.2,1.2v14.2c2.1-3.7,6.1-6.3,10.7-6.3,7.3,0,13.2,5.9,13.2,13.2s-5.9,13.2-13.2,13.2-13.1-5.9-13.1-13.2v-21h0ZM109.4,46.8c0,5.9,4.8,10.8,10.7,10.8s10.8-4.8,10.8-10.8-4.8-10.8-10.8-10.8-10.7,4.8-10.7,10.8Z"/><path fill="#fff" d="M150.6,60c-7.2,0-13.2-5.9-13.2-13.2s5.9-13.2,13.2-13.2,13.2,5.9,13.2,13.2v11.9c0,.7-.5,1.3-1.2,1.3s-1.2-.6-1.2-1.3v-4.3c-2.4,3.3-6.3,5.5-10.8,5.5h0ZM161.3,46.8c0-6-4.7-10.8-10.7-10.8s-10.8,4.8-10.8,10.8,4.8,10.8,10.8,10.8,10.7-4.8,10.7-10.8Z"/><path fill="#fff" d="M180.8,33.7c6.2,0,11.3,5.1,11.3,11.3v13.9c0,.7-.6,1.2-1.3,1.2s-1.2-.6-1.2-1.2v-13.9c0-4.8-4-8.8-8.8-8.8s-8.8,4-8.8,8.8v13.9c0,.7-.6,1.2-1.2,1.2s-1.2-.6-1.2-1.2v-13.9c0-6.2,5.1-11.3,11.2-11.3h0Z"/><path fill="#fff" d="M197.1,46.8c0-7.3,5.9-13.2,13.1-13.2s8.7,2.6,10.8,6.3v-14.2c0-.8.5-1.2,1.2-1.2s1.3.5,1.3,1.2v21c0,7.3-5.9,13.2-13.2,13.2s-13.1-5.9-13.1-13.2ZM199.5,46.8c0,5.9,4.8,10.8,10.7,10.8s10.8-4.8,10.8-10.8-4.8-10.8-10.8-10.8-10.7,4.8-10.7,10.8Z"/><path fill="#0ed894" d="M120.3,71.1c1.5,0,2.8,1.4,2.8,3s-1.2,3-2.8,3h-9.9c-2.1,0-2.6,2.3-.5,3.1l9.2,3.1c4.6,1.5,6.1,5.4,5.4,8.6-.7,3-3.5,5.6-7.8,5.6h-10c-1.5,0-2.8-1.4-2.8-3s1.3-3.1,2.8-3.1h10.5c2.2,0,2.6-2.3.6-3.1l-9.2-3.1c-4.5-1.4-6.1-5.3-5.4-8.6.7-3.1,3.5-5.6,7.8-5.6h9.4,0Z"/><path fill="#0ed894" d="M134.8,62.1c1.7,0,3.1,1.4,3.1,3v6h3.8c1.7,0,3.1,1.4,3.1,3s-1.4,3.1-3.1,3.1h-3.8v17.4c0,1.6-1.4,3-3.1,3s-2.9-1.4-2.9-3v-17.4h-3.9c-1.6,0-3-1.4-3-3.1s1.4-3,3-3h3.9v-6c0-1.7,1.3-3,2.9-3Z"/><path fill="#0ed894" d="M158.5,71.1c1.6,0,3,1.4,3,3s-1.4,3-3,3c-3.3,0-5.9,2.7-5.9,5.9v11.6c0,1.7-1.3,3.1-3,3.1s-3-1.3-3-3.1v-11.6c0-6.5,5.4-11.9,11.9-11.9Z"/><path fill="#0ed894" d="M175.9,71.1c6.4,0,11.9,4.7,12.8,10.9.6,2.6-.2,4.4-3.4,4.4h-16.2c.9,2.9,3.6,5,6.8,5s3.7-.8,5-2.1c.6-.6,1.4-.9,2.2-.9s1.5.3,2.1.9c1.1,1.1,1.1,3.1,0,4.3-2.4,2.4-5.7,3.9-9.3,3.9-7.4,0-13.2-5.9-13.2-13.2s5.9-13.2,13.2-13.2ZM175.9,77.1c-3.2,0-5.9,2.2-6.8,5.1h13.5c-.8-2.9-3.5-5.1-6.7-5.1h0Z"/><path fill="#0ed894" d="M204.8,97.5c-7.3,0-13.2-5.9-13.2-13.2s5.9-13.1,13.2-13.1,13.1,5.9,13.1,13.1v10.2c0,1.6-1.4,3-3.1,3s-2.5-.9-2.8-2.1c-2.1,1.3-4.6,2.1-7.2,2.1h0ZM211.9,84.3c0-3.9-3.2-7.2-7.1-7.2s-7.2,3.3-7.2,7.2,3.3,7.2,7.2,7.2,7.1-3.2,7.1-7.2Z"/><path fill="#0ed894" d="M231.9,71.1c2.9,0,5.6,1.3,7.3,3.4,1.9-2.1,4.5-3.4,7.5-3.4,5.7,0,10.4,4.7,10.4,10.5v12.9c0,1.6-1.3,3-2.9,3s-3.1-1.4-3.1-3v-12.9c0-2.5-2-4.5-4.3-4.5s-4.4,2-4.4,4.5v12.9c0,1.6-1.3,3-3.1,3s-2.9-1.4-2.9-3v-12.9c0-2.5-2-4.5-4.4-4.5s-4.4,2-4.4,4.5v12.9c0,1.6-1.3,3-3,3s-3-1.4-3-3v-12.9c0-5.8,4.7-10.5,10.4-10.5h0Z"/><path fill="#0ed894" d="M56.2,24.2h-5c-11.9,0-19.5,8.1-19.5,19.4s2.9,11.5,7.4,13.9c-7,2.3-12.7,8.3-12.7,18.5s8.4,21.5,21.8,21.5h38.1v-43.1c0-16.7-13.5-30.2-30.2-30.2h0ZM70.8,65.8l-13.3,9.1c-1.8,1.2-4.2,0-4.2-2.2v-18.2c-.1-2.2,2.3-3.5,4.1-2.2l13.5,9.2c1.6,1.1,1.6,3.4,0,4.4h0Z"/><path fill="#fff" d="M229.3,54.7c1.4,0,2.5,1.2,2.5,2.6,0,1.4-1.1,2.6-2.5,2.6s-2.6-1.2-2.6-2.6,1.2-2.6,2.6-2.6Z"/></svg>
      </a>
      <div class="nav-r">
        <a href="#features">Fonctionnalités</a>
        <a href="#pricing">Tarifs</a>
        <a href="#team">Équipe</a>
        <a href="#faq">FAQ</a>
        <a href="#access" class="btn btn-g">Activer mon tracking pro</a>
      </div>
    </div>
  </nav>


  <!-- HERO -->
  <section class="hero">
    <div class="hero-glow"></div>
    <div class="mx">
      <div>
        <div class="badge fade-in">No fluff, just results — Tu paies trop cher et tu le sais</div>
        <h1 class="fade-in">de 25 à 46&nbsp;€/mois<br>pour un smartlink ?<br><span class="acc">C'est terminé.</span></h1>
        <p class="hero-sub fade-in">Linkfire, Feature.fm, ToneDen… Tu connais les prix. band.stream fait la même chose à 5€/mois. Smartlinks complets + tracking + RGPD. Tout inclus, pas d'options cachées. Cofondé par un ex-Google, un cofondateur de Ledger et un ex-GM Accor.</p>
        <form class="email-form fade-in" onsubmit="event.preventDefault();this.innerHTML='<div style='display:flex;align-items:center;gap:10px;padding:12px 0'><span style='color:#0ED894;font-weight:600;font-size:.88rem'>✓ Merci ! On te contacte dans les 24h.</span></div>'">
          <input type="email" placeholder="ton@email.com" required>
          <button type="submit" class="btn btn-g">Activer mon tracking pro</button>
        </form>
        <p class="hero-hint fade-in">Alpha privée · Places limitées · Prêt en 30 secondes · Équipe française · RGPD natif</p>
        <div class="pills fade-in">
          <span>Compatible avec</span>
          <div class="pill">Spotify</div>
          <div class="pill">Apple Music</div>
          <div class="pill">YouTube Music</div>
          <div class="pill">Deezer</div>
          <div class="pill">+4</div>
        </div>
      </div>

      <!-- PRISM MOCKUP -->
      <div class="hero-visual">
        <div class="prism-mock fade-in">
          <div class="prism-card">
            <div class="prism-bg"><img id="bg1" alt=""></div>
            <div class="prism-artwork">
              <img id="art1" alt="Forged in Rage artwork">
              <div class="prism-info">
                <div class="prism-title">Forged in Rage</div>
                <div class="prism-artist">Apocalypt</div>
              </div>
            </div>
            <div class="prism-links">
              <a href="#" class="prism-cta" style="background:linear-gradient(135deg,#1DB954,#1DB954cc)">
                <div class="shimmer"></div>
                <div class="prism-cta-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M7 14.5c3.5-2 9-2 13 0"/><path d="M5.5 10.5c4.5-2.5 12-2.5 17 0"/><path d="M4 6.5c5.5-3 14.5-3 20 0"/></svg></div>
                <span style="flex:1;font-size:.88rem">Spotify</span>
                <svg class="prism-cta-play" width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              </a>
              <a href="#" class="prism-link"><div class="prism-accent-bar" style="background:#FA243C"></div><div class="prism-link-icon"><svg width="16" height="16" viewBox="0 0 24 24"><g fill="#FA243C"><path d="M17 3v13.5a3 3 0 1 1-2-2.83V6.5l-7 1.75v9.25a3 3 0 1 1-2-2.83V5l11-2z"/></g></svg></div><span class="prism-link-name">Apple Music</span><span class="prism-link-action">Écouter</span></a>
              <a href="#" class="prism-link"><div class="prism-accent-bar" style="background:#FF0000"></div><div class="prism-link-icon"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#FF0000" stroke-width="1.5"/><polygon fill="#FF0000" points="10.5,8.5 16.5,12 10.5,15.5"/></svg></div><span class="prism-link-name">YouTube Music</span><span class="prism-link-action">Écouter</span></a>
              <a href="#" class="prism-link"><div class="prism-accent-bar" style="background:#A238FF"></div><div class="prism-link-icon"><svg width="16" height="16" viewBox="0 0 24 24"><g fill="#A238FF"><rect x="4" y="14" width="2.5" height="5" rx=".8"/><rect x="8" y="10" width="2.5" height="9" rx=".8"/><rect x="12" y="5" width="2.5" height="14" rx=".8"/><rect x="16" y="8" width="2.5" height="11" rx=".8"/></g></svg></div><span class="prism-link-name">Deezer</span><span class="prism-link-action">Écouter</span></a>
              <a href="#" class="prism-link"><div class="prism-accent-bar" style="background:#fff"></div><div class="prism-link-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004L8.008 8l4.004 4-4.004 4.004 4.004 4.004 4.004-4.004-4.004-4.004L16.016 8l4.004 4.004L24.024 7.996z"/></svg></div><span class="prism-link-name">TIDAL</span><span class="prism-link-action">Écouter</span></a>
            </div>
            <div class="prism-nl">
              <div class="prism-nl-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ED894" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg></div>
              <div class="prism-nl-text"><p>Newsletter</p><p>Sorties de Apocalypt</p></div>
              <span class="prism-nl-arrow">›</span>
            </div>
            <div class="prism-footer"><span>Powered by</span><strong>band.stream</strong></div>
          </div>
        </div>
      </div>
    </div>
  </section>



  <!-- AVANT -->
  <section>
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">Ta réalité aujourd'hui</p>
        <h2 class="s-title">Avant band.stream</h2>
      </div>
      <div class="feat-grid">
        <div class="feat fade-in">
          
          <h3>Tracking en option à 25-46€/mois</h3>
          <p>GTM et Meta Pixel sont verrouillés derrière des abonnements premium. Sans eux, les régies ne peuvent pas optimiser.</p>
        </div>
        <div class="feat fade-in">
          
          <h3>Campagnes à l'aveugle</h3>
          <p>Tu investis en pub sans savoir ce qui marche. Chaque euro est un pari. Les régies te pénalisent campagne après campagne.</p>
        </div>
        <div class="feat fade-in">
          
          <h3>RGPD = casse-tête</h3>
          <p>Consent manager, cookies, hébergement UE… La conformité coûte du temps et de l'argent. Ou tu fais l'impasse et tu risques.</p>
        </div>
      </div>
    </div>
  </section>


  <!-- STORY/SOLUTION  -  On a vécu le problème, on a construit la solution -->
  <section id="features">
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">On a vécu le problème</p>
        <h2 class="s-title">15 ans dans la musique. <span style="color:var(--green)">On a construit la solution.</span></h2>
        <p class="s-sub">Après des années à gérer des campagnes pub pour des artistes avec des outils fragmentés et hors de prix, on a créé ce qui aurait dû exister depuis longtemps.</p>
      </div>
      <div class="feat-grid">
        <div class="feat fade-in">
          <div class="feat-ic"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
          <h3>Tout-en-un à 5&nbsp;€/mois</h3>
          <p>Smartlinks complets (8 plateformes), 5 templates, sous-domaine artiste.band.stream, billetterie, analytics détaillés, GTM, Meta Pixel, consent manager RGPD. Tout. Pas d'options cachées.</p>
        </div>
        <div class="feat fade-in">
          <div class="feat-ic"><svg viewBox="0 0 24 24"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
          <h3>Suivi de conversion inclus</h3>
          <p>GTM + Meta Pixel + RGPD natif à 5&nbsp;€/mois. Ce que les concurrents facturent de 25 à 46&nbsp;€ en option, on l'inclut dans l'abonnement. Parce que le tracking ne devrait pas être un luxe.</p>
        </div>
        <div class="feat fade-in">
          <div class="feat-ic"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><path d="M10 4v16"/></svg></div>
          <h3>Offre gratuite pour démarrer</h3>
          <p>Smartlink limité + tracking basique (visites, clics) pour tester la plateforme. Quand tu es prêt à scaler tes campagnes, passe au Pro à 5&nbsp;€/mois.</p>
        </div>
      </div>
    </div>
    <!-- APRES -->
  <section>
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">Après band.stream</p>
        <h2 class="s-title">Imagine <span style="color:var(--green)">cette réalité</span></h2>
      </div>
      <div class="feat-grid">
        <div class="feat fade-in">
          <div class="feat-ic"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
          <h3>Tracking pro à 5€/mois</h3>
          <p>Smartlinks complets (8 plateformes), 5 templates, sous-domaine artiste.band.stream, billetterie, analytics détaillés, GTM, Meta Pixel, consent manager RGPD. Tout. Pas d'options cachées.</p>
        </div>
        <div class="feat fade-in">
          <div class="feat-ic"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><path d="M10 4v16"/></svg></div>
          <h3>RGPD réglé, nativement</h3>
          <p>GTM + Meta Pixel + RGPD natif à 5€/mois. Ce que les concurrents facturent de 25 à 46€ en option, on l'inclut dans l'abonnement. Parce que le tracking ne devrait pas être un luxe.</p>
        </div>
        <div class="feat fade-in">
          <div class="feat-ic"><svg viewBox="0 0 24 24"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
          <h3>Tout sur une seule page</h3>
          <p>Smartlink limité + tracking basique (visites, clics) pour tester la plateforme. Quand tu es prêt à scaler tes campagnes, passe au Pro à 5€/mois.</p>
        </div>
      </div>
    </div>
  </section>


  <!-- TRANSFORMATION  -  la preuve par les chiffres -->
  <section style="background:var(--g9);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)">
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">La transformation</p>
        <h2 class="s-title">Avant vs. après  -  <span style="color:var(--green)">les chiffres parlent</span></h2>
        <p class="s-sub">Tu passes de 25-46&nbsp;€/mois sans RGPD à 5&nbsp;€/mois avec tout inclus. Prix publics vérifiés en avril 2026.</p>
      </div>
      <div class="cmp-wrap fade-in">
        <table class="cmp">
          <thead>
            <tr>
              <th></th>
              <th class="hl">band.stream</th>
              <th>Linkfire</th>
              <th>Feature.fm</th>
              <th>Hypeddit</th>
              <th>ToneDen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Plan gratuit</td>
              <td class="hl">Limité (smartlink basique, stats visites/clics)</td>
              <td class="no">✗ Trial 14j uniquement</td>
              <td class="no">Limité (analytics 7j, branding forcé)</td>
              <td>Basique (smartlinks uniquement)</td>
              <td class="no">Limité</td>
            </tr>
            <tr>
              <td>Smartlinks + tracking + RGPD</td>
              <td class="hl price">5&nbsp;€/mois (tout inclus)</td>
              <td class="others-price">~25&nbsp;€/mois ($27)</td>
              <td class="others-price">~36&nbsp;€/mois ($39)</td>
              <td class="others-price">~9&nbsp;€/mois ($10)*</td>
              <td class="others-price">~46&nbsp;€/mois ($50)</td>
            </tr>
            <tr>
              <td>Templates design</td>
              <td class="hl yes">5 templates premium (Pro)</td>
              <td>1-2 basiques</td>
              <td>1-2 basiques</td>
              <td>1 seul</td>
              <td>1 seul</td>
            </tr>
            <tr>
              <td>Sous-domaine personnalisé</td>
              <td class="hl yes">✓ Inclus (artiste.band.stream)</td>
              <td>Payant</td>
              <td>Payant ($19+)</td>
              <td>Payant</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Support</td>
              <td class="hl yes">✓ Prioritaire (Pro)</td>
              <td class="no">Ticketing standard</td>
              <td class="no">Ticketing standard</td>
              <td class="no">Ticketing standard</td>
              <td class="no">Quasi inexistant</td>
            </tr>
            <tr>
              <td>RGPD natif</td>
              <td class="hl yes">✓ Consent manager intégré</td>
              <td class="yes">✓ Consent manager (EU)</td>
              <td>Partiel</td>
              <td class="no">✗</td>
              <td class="no">✗</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="cmp-note fade-in">Prix publics vérifiés en avril 2026, convertis en EUR au taux approximatif. *Hypeddit : pixels de tracking uniquement, pas de GTM.</p>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section style="background:var(--g9);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)">
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">Ils ont testé la bêta</p>
        <h2 class="s-title">Ce qu'en disent <span style="color:var(--green)">les premiers utilisateurs</span></h2>
      </div>
      <div class="feat-grid">
        <div class="feat fade-in" style="text-align:center;padding:36px 28px">
          
          <p style="font-size:.95rem;font-style:italic;color:var(--g3);line-height:1.7;margin-bottom:16px">"J'ai activé le pixel Meta en 2 clics. Mon CPA a baissé de 40% dès la deuxième campagne. À 5€/mois, c'est un no-brainer."</p>
          <p style="font-weight:600;color:var(--white);font-size:.88rem">Julien M.</p>
          <p style="font-size:.75rem;color:var(--g5)">Artiste indépendant · 3 200 auditeurs/mois</p>
        </div>
        <div class="feat fade-in" style="text-align:center;padding:36px 28px">
          
          <p style="font-size:.95rem;font-style:italic;color:var(--g3);line-height:1.7;margin-bottom:16px">"On gérait 12 artistes avec 4 outils différents. Maintenant tout est sur band.stream. Le dashboard label est un game changer."</p>
          <p style="font-weight:600;color:var(--white);font-size:.88rem">Sophie L.</p>
          <p style="font-size:.75rem;color:var(--g5)">Label manager · Roster de 12 artistes</p>
        </div>
        <div class="feat fade-in" style="text-align:center;padding:36px 28px">
          
          <p style="font-size:.95rem;font-style:italic;color:var(--g3);line-height:1.7;margin-bottom:16px">"Le consent manager RGPD intégré m'a évité des heures de configuration. Et le support répond en moins de 24h. Rare à ce prix."</p>
          <p style="font-weight:600;color:var(--white);font-size:.88rem">Karim B.</p>
          <p style="font-size:.75rem;color:var(--g5)">Producteur · Campagnes Meta & YouTube</p>
        </div>
      </div>
    </div>
  </section>

  <!-- DEMO -->
  <section class="demo">
    <div class="mx">
      <div class="fade-in">
        <p class="s-label">En action</p>
        <h2 class="s-title">5 designs premium,<br><span style="color:var(--green)">testés sur de vrais artistes</span></h2>
        <p class="s-sub" style="max-width:100%">Chaque template a été conçu et itéré avec des artistes et labels en conditions réelles. Résultat : des designs qui convertissent.</p>
        <div class="check-list">
          <div class="check-item"><div class="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="#0ED894" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>Sous-domaine personnalisé : <strong>artiste.band.stream</strong></span></div>
          <div class="check-item"><div class="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="#0ED894" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>Pochette, aperçu audio et newsletter intégrés</span></div>
          <div class="check-item"><div class="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="#0ED894" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>5 templates premium (Obsidian, Onyx, Prism, Ivory, Carbon)</span></div>
          <div class="check-item"><div class="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="#0ED894" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>Compatible bios, affiches, QR codes et réseaux sociaux</span></div>
        </div>
      </div>
      <!-- CAROUSEL TEMPLATES -->
      <div class="carousel-wrap fade-in">
        <div class="carousel-viewport" id="tplCarousel">
          <div class="carousel-track" id="tplTrack">

            <!-- 01 OBSIDIAN -->
            <div class="carousel-slide">
              <div class="tpl-mock" style="width:320px;max-width:90%">
                <div class="tpl-card" style="background:#0a0a0a;border-radius:24px;border:1px solid rgba(255,255,255,.08);overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)">
                  <div style="position:relative">
                    <img id="art-obsidian" alt="Forged in Rage" style="width:100%;aspect-ratio:1;object-fit:cover;opacity:.3">
                    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,.7) 50%,rgba(0,0,0,.95))"></div>
                  </div>
                  <div style="position:relative;margin-top:-120px;z-index:2;padding:0 24px 20px;text-align:center">
                    <img id="art-obsidian-thumb" alt="" style="width:160px;height:160px;border-radius:14px;object-fit:cover;margin:0 auto 14px;display:block;box-shadow:0 16px 40px rgba(0,0,0,.5)">
                    <div style="font-size:1.3rem;font-weight:700;color:#fff">Forged in Rage</div>
                    <div style="font-size:.82rem;color:rgba(255,255,255,.55);margin-top:3px">Apocalypt</div>
                    <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">
                      <a href="#" style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.85);font-size:.82rem;font-weight:500"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2"><path d="M7 14.5c3.5-2 9-2 13 0"/><path d="M5.5 10.5c4.5-2.5 12-2.5 17 0"/></svg></div><span style="flex:1">Spotify</span><span style="font-size:.7rem;color:rgba(255,255,255,.5)">Écouter</span></a>
                      <a href="#" style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.85);font-size:.82rem;font-weight:500"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#FA243C"><path d="M17 3v13.5a3 3 0 1 1-2-2.83V6.5l-7 1.75v9.25a3 3 0 1 1-2-2.83V5l11-2z"/></g></svg></div><span style="flex:1">Apple Music</span><span style="font-size:.7rem;color:rgba(255,255,255,.5)">Écouter</span></a>
                      <a href="#" style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.85);font-size:.82rem;font-weight:500"><div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#A238FF"><rect x="4" y="14" width="2.5" height="5" rx=".8"/><rect x="8" y="10" width="2.5" height="9" rx=".8"/><rect x="12" y="5" width="2.5" height="14" rx=".8"/></g></svg></div><span style="flex:1">Deezer</span><span style="font-size:.7rem;color:rgba(255,255,255,.5)">Écouter</span></a>
                    </div>
                  </div>
                  <div style="text-align:center;padding:12px 0 18px;display:flex;align-items:center;justify-content:center;gap:4px"><span style="font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.12)">Powered by</span><strong style="font-size:.65rem;color:rgba(14,216,148,.3)">band.stream</strong></div>
                </div>
              </div>
              <div class="tpl-label">Obsidian</div>
            </div>

            <!-- 02 ONYX -->
            <div class="carousel-slide">
              <div class="tpl-mock" style="width:320px;max-width:90%">
                <div class="tpl-card" style="background:#2e2e2e;border-radius:12px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)">
                  <img id="art-onyx" alt="Forged in Rage" style="width:100%;aspect-ratio:1;object-fit:cover;display:block">
                  <div style="padding:20px 20px 8px">
                    <div style="font-size:1.1rem;font-weight:700;color:#fff">Forged in Rage</div>
                    <div style="font-size:.8rem;color:rgba(255,255,255,.5);margin-top:2px">Apocalypt</div>
                  </div>
                  <div style="padding:8px 20px 20px;display:flex;flex-direction:column;gap:10px">
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:8px;background:#1DB954;color:#fff;font-size:.82rem;font-weight:600"><div style="width:28px;height:28px;border-radius:6px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M7 14.5c3.5-2 9-2 13 0"/><path d="M5.5 10.5c4.5-2.5 12-2.5 17 0"/></svg></div><span style="flex:1">Spotify</span><span style="font-size:.65rem;opacity:.7;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:8px;background:#FA243C;color:#fff;font-size:.82rem;font-weight:600"><div style="width:28px;height:28px;border-radius:6px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#fff"><path d="M17 3v13.5a3 3 0 1 1-2-2.83V6.5l-7 1.75v9.25a3 3 0 1 1-2-2.83V5l11-2z"/></g></svg></div><span style="flex:1">Apple Music</span><span style="font-size:.65rem;opacity:.7;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:8px;background:#A238FF;color:#fff;font-size:.82rem;font-weight:600"><div style="width:28px;height:28px;border-radius:6px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#fff"><rect x="4" y="14" width="2.5" height="5" rx=".8"/><rect x="8" y="10" width="2.5" height="9" rx=".8"/><rect x="12" y="5" width="2.5" height="14" rx=".8"/></g></svg></div><span style="flex:1">Deezer</span><span style="font-size:.65rem;opacity:.7;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                  </div>
                  <div style="text-align:center;padding:10px 0 16px;display:flex;align-items:center;justify-content:center;gap:4px"><span style="font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.15)">Powered by</span><strong style="font-size:.65rem;color:rgba(14,216,148,.35)">band.stream</strong></div>
                </div>
              </div>
              <div class="tpl-label">Onyx</div>
            </div>

            <!-- 03 PRISM -->
            <div class="carousel-slide">
              <div class="prism-mock" style="width:320px;max-width:90%">
                <div class="prism-card">
                  <div class="prism-bg"><img id="bg2" alt=""></div>
                  <div class="prism-artwork">
                    <img id="art2" alt="Forged in Rage artwork">
                    <div class="prism-info"><div class="prism-title" style="font-size:1.2rem">Forged in Rage</div><div class="prism-artist">Apocalypt</div></div>
                  </div>
                  <div class="prism-links">
                    <a href="#" class="prism-cta" style="background:linear-gradient(135deg,#1DB954,#1DB954cc)"><div class="shimmer"></div><div class="prism-cta-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M7 14.5c3.5-2 9-2 13 0"/><path d="M5.5 10.5c4.5-2.5 12-2.5 17 0"/><path d="M4 6.5c5.5-3 14.5-3 20 0"/></svg></div><span style="flex:1;font-size:.82rem">Spotify</span><svg class="prism-cta-play" width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></a>
                    <a href="#" class="prism-link"><div class="prism-accent-bar" style="background:#FA243C"></div><div class="prism-link-icon"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#FA243C"><path d="M17 3v13.5a3 3 0 1 1-2-2.83V6.5l-7 1.75v9.25a3 3 0 1 1-2-2.83V5l11-2z"/></g></svg></div><span class="prism-link-name">Apple Music</span><span class="prism-link-action">Écouter</span></a>
                    <a href="#" class="prism-link"><div class="prism-accent-bar" style="background:#A238FF"></div><div class="prism-link-icon"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#A238FF"><rect x="4" y="14" width="2.5" height="5" rx=".8"/><rect x="8" y="10" width="2.5" height="9" rx=".8"/><rect x="12" y="5" width="2.5" height="14" rx=".8"/></g></svg></div><span class="prism-link-name">Deezer</span><span class="prism-link-action">Écouter</span></a>
                  </div>
                  <div class="prism-footer"><span>Powered by</span><strong>band.stream</strong></div>
                </div>
              </div>
              <div class="tpl-label">Prism <span style="color:var(--green);font-size:.65rem;vertical-align:super">NEW</span></div>
            </div>

            <!-- 04 IVORY -->
            <div class="carousel-slide">
              <div class="tpl-mock" style="width:320px;max-width:90%">
                <div class="tpl-card" style="background:#FAFAF9;border-radius:24px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.15);border:1px solid rgba(0,0,0,.06)">
                  <div style="padding:24px 24px 0">
                    <img id="art-ivory" alt="Forged in Rage" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px;display:block;box-shadow:0 12px 32px rgba(0,0,0,.12)">
                  </div>
                  <div style="padding:18px 24px 6px">
                    <div style="font-size:1.2rem;font-weight:700;color:#1a1a1a">Forged in Rage</div>
                    <div style="font-size:.82rem;color:#999;margin-top:3px">Apocalypt</div>
                  </div>
                  <div style="padding:8px 24px 20px;display:flex;flex-direction:column;gap:8px">
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:16px;background:#1DB954;color:#fff;font-size:.82rem;font-weight:600;box-shadow:0 6px 20px rgba(29,185,84,.25)"><div style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M7 14.5c3.5-2 9-2 13 0"/><path d="M5.5 10.5c4.5-2.5 12-2.5 17 0"/></svg></div><span style="flex:1">Spotify</span><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></a>
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;background:#fff;border:1px solid #eee;color:#555;font-size:.82rem;font-weight:500;box-shadow:0 2px 8px rgba(0,0,0,.04)"><div style="width:3px;height:24px;border-radius:2px;background:#FA243C;opacity:.5"></div><div style="width:30px;height:30px;border-radius:10px;background:rgba(250,36,60,.08);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#FA243C"><path d="M17 3v13.5a3 3 0 1 1-2-2.83V6.5l-7 1.75v9.25a3 3 0 1 1-2-2.83V5l11-2z"/></g></svg></div><span style="flex:1">Apple Music</span><span style="font-size:.65rem;color:#bbb;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;background:#fff;border:1px solid #eee;color:#555;font-size:.82rem;font-weight:500;box-shadow:0 2px 8px rgba(0,0,0,.04)"><div style="width:3px;height:24px;border-radius:2px;background:#A238FF;opacity:.5"></div><div style="width:30px;height:30px;border-radius:10px;background:rgba(162,56,255,.08);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#A238FF"><rect x="4" y="14" width="2.5" height="5" rx=".8"/><rect x="8" y="10" width="2.5" height="9" rx=".8"/><rect x="12" y="5" width="2.5" height="14" rx=".8"/></g></svg></div><span style="flex:1">Deezer</span><span style="font-size:.65rem;color:#bbb;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                  </div>
                  <div style="text-align:center;padding:10px 0 18px;display:flex;align-items:center;justify-content:center;gap:4px"><span style="font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:#ccc">Powered by</span><strong style="font-size:.65rem;color:#bbb">band.stream</strong></div>
                </div>
              </div>
              <div class="tpl-label">Ivory <span style="color:var(--green);font-size:.65rem;vertical-align:super">NEW</span></div>
            </div>

            <!-- 05 CARBON -->
            <div class="carousel-slide">
              <div class="tpl-mock" style="width:320px;max-width:90%">
                <div class="tpl-card" style="position:relative;background:#000;border-radius:24px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)">
                  <div style="position:relative">
                    <img id="art-carbon" alt="Forged in Rage" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;opacity:.45">
                    <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 20%,rgba(0,0,0,.8) 100%)"></div>
                    <div style="position:absolute;bottom:16px;left:20px;z-index:2">
                      <div style="font-size:1.2rem;font-weight:700;color:#fff">Forged in Rage</div>
                      <div style="font-size:.82rem;color:rgba(255,255,255,.4);margin-top:2px">Apocalypt</div>
                    </div>
                  </div>
                  <div style="padding:14px 16px 20px;display:flex;flex-direction:column;gap:8px">
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;background:rgba(245,245,245,.92);color:#333;font-size:.82rem;font-weight:500;box-shadow:0 2px 8px rgba(0,0,0,.1)"><div style="width:3px;height:24px;border-radius:2px;background:#1DB954;opacity:.5"></div><div style="width:30px;height:30px;border-radius:10px;background:rgba(29,185,84,.08);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2"><path d="M7 14.5c3.5-2 9-2 13 0"/><path d="M5.5 10.5c4.5-2.5 12-2.5 17 0"/></svg></div><span style="flex:1">Spotify</span><span style="font-size:.65rem;color:#999;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;background:rgba(245,245,245,.92);color:#333;font-size:.82rem;font-weight:500;box-shadow:0 2px 8px rgba(0,0,0,.1)"><div style="width:3px;height:24px;border-radius:2px;background:#FA243C;opacity:.5"></div><div style="width:30px;height:30px;border-radius:10px;background:rgba(250,36,60,.08);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#FA243C"><path d="M17 3v13.5a3 3 0 1 1-2-2.83V6.5l-7 1.75v9.25a3 3 0 1 1-2-2.83V5l11-2z"/></g></svg></div><span style="flex:1">Apple Music</span><span style="font-size:.65rem;color:#999;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                    <a href="#" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;background:rgba(245,245,245,.92);color:#333;font-size:.82rem;font-weight:500;box-shadow:0 2px 8px rgba(0,0,0,.1)"><div style="width:3px;height:24px;border-radius:2px;background:#A238FF;opacity:.5"></div><div style="width:30px;height:30px;border-radius:10px;background:rgba(162,56,255,.08);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24"><g fill="#A238FF"><rect x="4" y="14" width="2.5" height="5" rx=".8"/><rect x="8" y="10" width="2.5" height="9" rx=".8"/><rect x="12" y="5" width="2.5" height="14" rx=".8"/></g></svg></div><span style="flex:1">Deezer</span><span style="font-size:.65rem;color:#999;text-transform:uppercase;letter-spacing:.05em">Écouter</span></a>
                  </div>
                  <div style="text-align:center;padding:8px 0 16px;display:flex;align-items:center;justify-content:center;gap:4px"><span style="font-size:.6rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.12)">Powered by</span><strong style="font-size:.65rem;color:rgba(255,255,255,.12)">band.stream</strong></div>
                </div>
              </div>
              <div class="tpl-label">Carbon <span style="color:var(--green);font-size:.65rem;vertical-align:super">NEW</span></div>
            </div>

          </div>
        </div>
        <!-- Navigation dots + arrows -->
        <div class="carousel-nav">
          <button class="carousel-arrow" id="carPrev" aria-label="Précédent">‹</button>
          <div class="carousel-dots" id="carDots"></div>
          <button class="carousel-arrow" id="carNext" aria-label="Suivant">›</button>
        </div>
      </div>
    </div>
  </section>

  <!-- OFFER  -  l'offre concrète -->
  <section id="pricing">
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">Tarifs</p>
<h2 class="s-title">0€, 5€ ou 25€. C'est tout.</h2>
<p class="s-sub">Pas d'engagement, pas de frais cachés. Annule quand tu veux.</p>
      </div>
      <div class="pricing-grid">
        <div class="p-card fade-in">
          <p class="p-label">Pour découvrir</p>
          <h3 class="p-name">Free</h3>
          <p class="p-desc">Teste la plateforme avec les fonctions de base.</p>
          <div class="p-price"><span class="amt">0</span><span class="per"> € / mois</span></div>
          <ul class="p-features">
            <li>Smartlink limité</li>
            <li>Tracking basique (visites &amp; clics)</li>
            <li>Pas de suivi de conversion</li>
            <li>Support standard</li>
          </ul>
          <a href="#access" class="btn btn-o" style="width:100%">Commencer gratuitement</a>
        </div>
        <div class="p-card ft fade-in">
          <div class="p-badge">Tout inclus</div>
          <p class="p-label">Pour les artistes sérieux</p>
          <h3 class="p-name">Pro</h3>
          <p class="p-desc">Smartlinks complets + tracking + toutes les features.</p>
          <div class="p-price"><span class="amt">5</span><span class="per"> € / mois</span></div>
          <ul class="p-features">
            <li>Smartlinks complets (8 plateformes)</li>
            <li>5 templates premium</li>
            <li>Sous-domaine artiste.band.stream</li>
            <li>Billetterie intégrée</li>
            <li>Google Tag Manager &amp; Meta Pixel</li>
            <li>Suivi de conversion</li>
            <li>Consent manager RGPD intégré</li>
            <li>Analytics détaillés</li>
            <li>Support prioritaire</li>
          </ul>
          <a href="#access" class="btn btn-g" style="width:100%">Activer mon tracking pro</a>
        </div>
        <div class="p-card fade-in">
          <p class="p-label">Pour les labels</p>
          <h3 class="p-name">Labels</h3>
          <p class="p-desc">Gestion centralisée pour ton roster d'artistes.</p>
          <div class="p-price"><span class="amt">25</span><span class="per"> € HT / mois</span></div>
          <ul class="p-features">
            <li>Tout le plan Pro inclus</li>
            <li>Jusqu'à 100 artistes</li>
            <li>Dashboard multi-artistes</li>
            <li>Gestion centralisée des campagnes</li>
            <li>Analytics consolidés</li>
            <li>Support dédié label</li>
          </ul>
          <a href="mailto:contact@band.stream?subject=Offre%20Labels" class="btn btn-o" style="width:100%">Nous contacter</a>
        </div>
      </div>

      <!-- CAMPAIGN SERVICE -->
      <div class="campaign-box fade-in">
        <div class="campaign-box-icon">
          <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <h4>On gère tes campagnes pub</h4>
          <p>Stratégie, ciblage, création et suivi de tes campagnes sur Meta, Google, YouTube et TikTok. Gérées par notre équipe avec 15 ans d'expertise marketing digital.</p>
          <button onclick="document.getElementById('rdv-modal').style.display='flex'" class="btn btn-o" style="margin-top:12px">Prendre rendez-vous</button>
        </div>
      </div>
    </div>
  </section>

  <!-- MARCHÉ  -  pourquoi maintenant -->
  <section style="background:var(--g9);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)">
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">Pourquoi maintenant</p>
        <h2 class="s-title">Le marché explose. <span style="color:var(--green)">Les outils n'ont pas suivi.</span></h2>
        <p class="s-sub">La musique numérique croît de 10% par an. Le marketing musical indépendant a besoin d'outils à la hauteur  -  pas de paywalls à 46&nbsp;€.</p>
      </div>
      <div class="feat-grid">
        <div class="feat fade-in" style="text-align:center">
          <div style="font-size:2.4rem;font-weight:800;color:var(--green);margin-bottom:8px">64,3 Mrd$</div>
          <h3>Marché musical numérique</h3>
          <p>Projection pour 2030, avec un taux de croissance annuel composé de 10%.</p>
        </div>
        <div class="feat fade-in" style="text-align:center">
          <div style="font-size:2.4rem;font-weight:800;color:var(--green);margin-bottom:8px">526 Mrd$</div>
          <h3>Publicité numérique mondiale</h3>
          <p>Prévision pour fin 2024, en croissance continue. Les artistes doivent s'outiller.</p>
        </div>
        <div class="feat fade-in" style="text-align:center">
          <div style="font-size:2.4rem;font-weight:800;color:var(--green);margin-bottom:8px">+9,4%</div>
          <h3>Croissance en France</h3>
          <p>Progression du marché de la musique enregistrée au S1 2023. La France est un marché clé.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ÉQUIPE  -  ceux qui ont construit la solution -->
  <section id="team">
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">Qui a construit ça</p>
        <h2 class="s-title">3 cofondateurs qui ont <span style="color:var(--green)">vécu le problème</span></h2>
        <p class="s-sub">Un ex-Google, un cofondateur de Ledger, un ex-GM Accor. 50 ans d'expérience cumulée. À parts égales.</p>
      </div>
      <div class="feat-grid">
        <div class="feat fade-in" style="text-align:center">
          <div class="feat-ic" style="margin:0 auto 16px;width:64px;height:64px;border-radius:50%;font-size:1.5rem;font-weight:700;color:var(--green);background:rgba(14,216,148,.08)"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <h3>Co-fondateur &amp; CMO</h3>
          <p>15 ans d'expérience dans la musique et le marketing digital. Ex-Google.</p>
        </div>
        <div class="feat fade-in" style="text-align:center">
          <div class="feat-ic" style="margin:0 auto 16px;width:64px;height:64px;border-radius:50%;font-size:1.5rem;font-weight:700;color:var(--green);background:rgba(14,216,148,.08)"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <h3>Co-fondateur &amp; CTO</h3>
          <p>MSc Computer Science. Cofondateur de Ledger, leader mondial des wallets crypto.</p>
        </div>
        <div class="feat fade-in" style="text-align:center">
          <div class="feat-ic" style="margin:0 auto 16px;width:64px;height:64px;border-radius:50%;font-size:1.5rem;font-weight:700;color:var(--green);background:rgba(14,216,148,.08)"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <h3>Co-fondateur &amp; CFO</h3>
          <p>20 ans d'expérience en informatique et finances. Ex-GM d'une filiale du groupe Accor.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- BASELINE -->
  <div class="baseline-divider fade-in"><span>Chaque jour sans tracking, c'est du budget pub gaspillé.</span></div>

  <!-- FAQ  -  derniers doutes avant de passer à l'action -->
  <section id="faq">
    <div class="mx">
      <div class="s-header s-center fade-in">
        <p class="s-label">Derniers doutes ?</p>
        <h2 class="s-title">Tout ce qui pourrait te retenir  -  <span style="color:var(--green)">et pourquoi ça ne devrait pas</span></h2>
      </div>
      <div class="faq-grid">
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>C'est quoi un smartlink exactement ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>Un smartlink est un lien unique qui regroupe tous tes liens de streaming (Spotify, Apple Music, Deezer, etc.) sur une seule page. Quand un fan clique, il choisit sa plateforme préférée. Fini les liens qui ne marchent que pour Spotify.</p></div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>Pourquoi le tracking est 5x moins cher que les concurrents ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>Les concurrents ont construit leur modèle économique sur le tracking en option : smartlinks basiques en vitrine, suivi de conversion verrouillé derrière un paywall à 25-46 €/mois. Chez band.stream, smartlinks complets + suivi de conversion + RGPD sont inclus dans un seul abonnement à 5 €/mois  -  c'est notre choix fondateur.</p></div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>C'est vraiment gratuit ? Où est le piège ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>Pas de piège. Le plan Free est limité : smartlink basique et tracking visites/clics, sans suivi de conversion. Le plan Pro (5 €/mois) débloque tout : smartlinks complets (8 plateformes), 5 templates, billetterie, GTM + Meta Pixel, suivi de conversion, consent manager RGPD et support prioritaire. Le plan Labels (25 € HT/mois) gère jusqu'à 100 artistes.</p></div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>Comment fonctionne le tracking ? C'est conforme RGPD ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>Le plan Pro (5 €/mois) intègre Google Tag Manager, le Meta Pixel et le suivi de conversion, avec un consent manager RGPD natif. Tu n'as rien à bricoler  -  la conformité est intégrée. Le plan Free propose uniquement un tracking basique (visites, clics) sans suivi de conversion.</p></div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>Qui est derrière band.stream ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>3 cofondateurs à parts égales : un CMO (ex-Google, 15 ans dans la musique et le marketing digital), un CTO (MSc Computer Science, cofondateur de Ledger) et un CFO (20 ans en informatique et finances, ex-GM d'une filiale du groupe Accor). Une équipe française, basée en France.</p></div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>Je peux migrer depuis Linkfire / Feature.fm / ToneDen ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>Oui. Crée ton compte, passe au Pro (5 €/mois), et redirige ton ancien lien vers ton nouveau artiste.band.stream. Tu récupères smartlinks complets + tracking + RGPD pour une fraction du prix. Économie dès le premier mois.</p></div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>J'ai un label, c'est adapté pour moi ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>Oui. Le plan Labels à 25 € HT/mois gère jusqu'à 100 artistes : dashboard centralisé, campagnes, analytics et smartlinks pour tout ton roster. Contacte-nous pour une démo personnalisée.</p></div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-q" onclick="this.parentElement.classList.toggle('open')"><span>C'est quoi le service de campagne pub ?</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="faq-a"><p>Pour 200 € HT/campagne, notre équipe gère entièrement tes publicités Meta, Google, YouTube et TikTok : stratégie, ciblage, création et suivi. 15 ans d'expertise marketing digital. Abonnement Pro offert pendant 1 an.</p></div>
        </div>
      </div>
    </div>
  </section>

  <!-- RESPONSE  -  passe à l'action -->
  <section id="access">
    <div class="mx">
      <div class="cta-box fade-in">
        <h2>Chaque jour sans tracking, c'est du budget pub gaspillé.</h2>
        <p>Tu connais le problème. Tu as vu la solution. Tu sais combien tu économises (240 à 492&nbsp;€/an). Il ne reste qu'une chose à faire. Alpha privée, places limitées.</p>
        <form class="email-form" onsubmit="event.preventDefault();this.innerHTML='<div style=\\'display:flex;align-items:center;gap:10px;justify-content:center;padding:12px 0\\'><span style=\\'color:#0ED894;font-weight:600;font-size:.88rem\\'>✓ Merci ! On te contacte dans les 24h.</span></div>'">
          <input type="email" placeholder="ton@email.com" required>
          <button type="submit" class="btn btn-g">Activer mon tracking pro</button>
        </form>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="mx">
      <div class="footer-top">
        <div class="footer-brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 283.5 121.9" style="height:30px"><path fill="#fff" d="M106.9,25.8c0-.8.5-1.2,1.2-1.2s1.2.5,1.2,1.2v14.2c2.1-3.7,6.1-6.3,10.7-6.3,7.3,0,13.2,5.9,13.2,13.2s-5.9,13.2-13.2,13.2-13.1-5.9-13.1-13.2v-21h0ZM109.4,46.8c0,5.9,4.8,10.8,10.7,10.8s10.8-4.8,10.8-10.8-4.8-10.8-10.8-10.8-10.7,4.8-10.7,10.8Z"/><path fill="#fff" d="M150.6,60c-7.2,0-13.2-5.9-13.2-13.2s5.9-13.2,13.2-13.2,13.2,5.9,13.2,13.2v11.9c0,.7-.5,1.3-1.2,1.3s-1.2-.6-1.2-1.3v-4.3c-2.4,3.3-6.3,5.5-10.8,5.5h0ZM161.3,46.8c0-6-4.7-10.8-10.7-10.8s-10.8,4.8-10.8,10.8,4.8,10.8,10.8,10.8,10.7-4.8,10.7-10.8Z"/><path fill="#fff" d="M180.8,33.7c6.2,0,11.3,5.1,11.3,11.3v13.9c0,.7-.6,1.2-1.3,1.2s-1.2-.6-1.2-1.2v-13.9c0-4.8-4-8.8-8.8-8.8s-8.8,4-8.8,8.8v13.9c0,.7-.6,1.2-1.2,1.2s-1.2-.6-1.2-1.2v-13.9c0-6.2,5.1-11.3,11.2-11.3h0Z"/><path fill="#fff" d="M197.1,46.8c0-7.3,5.9-13.2,13.1-13.2s8.7,2.6,10.8,6.3v-14.2c0-.8.5-1.2,1.2-1.2s1.3.5,1.3,1.2v21c0,7.3-5.9,13.2-13.2,13.2s-13.1-5.9-13.1-13.2ZM199.5,46.8c0,5.9,4.8,10.8,10.7,10.8s10.8-4.8,10.8-10.8-4.8-10.8-10.8-10.8-10.7,4.8-10.7,10.8Z"/><path fill="#0ed894" d="M120.3,71.1c1.5,0,2.8,1.4,2.8,3s-1.2,3-2.8,3h-9.9c-2.1,0-2.6,2.3-.5,3.1l9.2,3.1c4.6,1.5,6.1,5.4,5.4,8.6-.7,3-3.5,5.6-7.8,5.6h-10c-1.5,0-2.8-1.4-2.8-3s1.3-3.1,2.8-3.1h10.5c2.2,0,2.6-2.3.6-3.1l-9.2-3.1c-4.5-1.4-6.1-5.3-5.4-8.6.7-3.1,3.5-5.6,7.8-5.6h9.4,0Z"/><path fill="#0ed894" d="M134.8,62.1c1.7,0,3.1,1.4,3.1,3v6h3.8c1.7,0,3.1,1.4,3.1,3s-1.4,3.1-3.1,3.1h-3.8v17.4c0,1.6-1.4,3-3.1,3s-2.9-1.4-2.9-3v-17.4h-3.9c-1.6,0-3-1.4-3-3.1s1.4-3,3-3h3.9v-6c0-1.7,1.3-3,2.9-3Z"/><path fill="#0ed894" d="M158.5,71.1c1.6,0,3,1.4,3,3s-1.4,3-3,3c-3.3,0-5.9,2.7-5.9,5.9v11.6c0,1.7-1.3,3.1-3,3.1s-3-1.3-3-3.1v-11.6c0-6.5,5.4-11.9,11.9-11.9Z"/><path fill="#0ed894" d="M175.9,71.1c6.4,0,11.9,4.7,12.8,10.9.6,2.6-.2,4.4-3.4,4.4h-16.2c.9,2.9,3.6,5,6.8,5s3.7-.8,5-2.1c.6-.6,1.4-.9,2.2-.9s1.5.3,2.1.9c1.1,1.1,1.1,3.1,0,4.3-2.4,2.4-5.7,3.9-9.3,3.9-7.4,0-13.2-5.9-13.2-13.2s5.9-13.2,13.2-13.2ZM175.9,77.1c-3.2,0-5.9,2.2-6.8,5.1h13.5c-.8-2.9-3.5-5.1-6.7-5.1h0Z"/><path fill="#0ed894" d="M204.8,97.5c-7.3,0-13.2-5.9-13.2-13.2s5.9-13.1,13.2-13.1,13.1,5.9,13.1,13.1v10.2c0,1.6-1.4,3-3.1,3s-2.5-.9-2.8-2.1c-2.1,1.3-4.6,2.1-7.2,2.1h0ZM211.9,84.3c0-3.9-3.2-7.2-7.1-7.2s-7.2,3.3-7.2,7.2,3.3,7.2,7.2,7.2,7.1-3.2,7.1-7.2Z"/><path fill="#0ed894" d="M231.9,71.1c2.9,0,5.6,1.3,7.3,3.4,1.9-2.1,4.5-3.4,7.5-3.4,5.7,0,10.4,4.7,10.4,10.5v12.9c0,1.6-1.3,3-2.9,3s-3.1-1.4-3.1-3v-12.9c0-2.5-2-4.5-4.3-4.5s-4.4,2-4.4,4.5v12.9c0,1.6-1.3,3-3.1,3s-2.9-1.4-2.9-3v-12.9c0-2.5-2-4.5-4.4-4.5s-4.4,2-4.4,4.5v12.9c0,1.6-1.3,3-3,3s-3-1.4-3-3v-12.9c0-5.8,4.7-10.5,10.4-10.5h0Z"/><path fill="#0ed894" d="M56.2,24.2h-5c-11.9,0-19.5,8.1-19.5,19.4s2.9,11.5,7.4,13.9c-7,2.3-12.7,8.3-12.7,18.5s8.4,21.5,21.8,21.5h38.1v-43.1c0-16.7-13.5-30.2-30.2-30.2h0ZM70.8,65.8l-13.3,9.1c-1.8,1.2-4.2,0-4.2-2.2v-18.2c-.1-2.2,2.3-3.5,4.1-2.2l13.5,9.2c1.6,1.1,1.6,3.4,0,4.4h0Z"/><path fill="#fff" d="M229.3,54.7c1.4,0,2.5,1.2,2.5,2.6,0,1.4-1.1,2.6-2.5,2.6s-2.6-1.2-2.6-2.6,1.2-2.6,2.6-2.6Z"/></svg>
          <p style="font-style:italic;color:var(--green);font-weight:500;margin-top:8px">No fluff, just results.</p>
          <p>La plateforme de smartlinks pour les artistes et les groupes.</p>
        </div>
        <div class="footer-col"><h4>Produit</h4><ul><li><a href="#features">Fonctionnalités</a></li><li><a href="#pricing">Tarifs</a></li><li><a href="#team">Équipe</a></li><li><a href="#faq">FAQ</a></li></ul></div>
        <div class="footer-col"><h4>Entreprise</h4><ul><li><a href="#">Confidentialité</a></li><li><a href="#">CGU</a></li></ul></div>
        <div class="footer-col"><h4>Contact</h4><ul><li><a href="mailto:contact@band.stream">contact@band.stream</a></li></ul></div>
      </div>
      <div class="footer-bottom"><p>© 2026 band.stream</p><p>www.band.stream</p></div>
    </div>
  </footer>`;
const scriptContent = `// Nav scroll
    const n=document.getElementById('navbar');
    window.addEventListener('scroll',()=>n.classList.toggle('scrolled',window.scrollY>50));
    // Fade in
    const o=new IntersectionObserver(e=>e.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.fade-in').forEach(e=>o.observe(e));
    // Inject artwork as base64 (works with file:// protocol)
    const ARTWORK='/images/landing-pdb-hero.jpg';
    ['bg1','bg2','art1','art2','art-obsidian','art-obsidian-thumb','art-onyx','art-ivory','art-carbon'].forEach(id=>{const el=document.getElementById(id);if(el)el.src=ARTWORK;});

    // Carousel
    (function(){
      const track=document.getElementById('tplTrack');
      const dotsC=document.getElementById('carDots');
      const prev=document.getElementById('carPrev');
      const next=document.getElementById('carNext');
      if(!track)return;
      const slides=track.querySelectorAll('.carousel-slide');
      const total=slides.length;
      let cur=2; // start on Prism
      function buildDots(){dotsC.innerHTML='';for(let i=0;i<total;i++){const b=document.createElement('button');b.setAttribute('aria-label','Template '+(i+1));if(i===cur)b.classList.add('active');b.onclick=()=>goTo(i);dotsC.appendChild(b);}}
      function goTo(i){cur=Math.max(0,Math.min(i,total-1));track.style.transform='translateX(-'+cur*100+'%)';dotsC.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('active',j===cur));}
      buildDots();goTo(cur);
      prev.onclick=()=>goTo(cur-1);
      next.onclick=()=>goTo(cur+1);
      // Touch/swipe
      let sx=0,dx=0;
      track.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;dx=0;},{passive:true});
      track.addEventListener('touchmove',e=>{dx=e.touches[0].clientX-sx;},{passive:true});
      track.addEventListener('touchend',()=>{if(Math.abs(dx)>50){dx<0?goTo(cur+1):goTo(cur-1);}});
      // Auto-play
      let autoId=setInterval(()=>goTo(cur<total-1?cur+1:0),4000);
      track.closest('.carousel-wrap').addEventListener('mouseenter',()=>clearInterval(autoId));
      track.closest('.carousel-wrap').addEventListener('mouseleave',()=>{autoId=setInterval(()=>goTo(cur<total-1?cur+1:0),4000);});
    })();`;

export default function PdbPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      <Script id="landing-pdb" strategy="afterInteractive">
        {scriptContent}
      </Script>
    </>
  );
}
