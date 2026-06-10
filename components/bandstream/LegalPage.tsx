import Link from 'next/link';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

type Props = {
  locale: string;
  mdFileFr: string;
  mdFileEn: string;
  title: string;
  otherLinks: Array<{ href: string; label: string }>;
};

export async function LegalPage({ locale, mdFileFr, mdFileEn, title, otherLinks }: Props) {
  const mdFile = locale === 'fr' ? mdFileFr : mdFileEn;
  const md = fs.readFileSync(path.join(process.cwd(), 'content/legal', mdFile), 'utf-8');
  const html = await marked(md);

  const styles = `
    .legal-nav{position:sticky;top:0;z-index:50;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}
    .legal-nav-inner{max-width:780px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}
    .legal-brand{color:#fff;font-weight:600;font-size:1rem;letter-spacing:-.01em;text-decoration:none}
    .legal-brand:hover{color:#0ED894}
    .legal-nav-label{color:#888;font-size:.85rem;font-weight:500;letter-spacing:.02em;text-transform:uppercase}
    .legal-hero{max-width:780px;margin:0 auto;padding:80px 32px 48px;text-align:center}
    .legal-hero h1{font-size:clamp(2.25rem,5vw,3.5rem);font-weight:700;color:#fff;letter-spacing:-.02em;line-height:1.1;margin:0 0 16px}
    .legal-hero-sub{color:#888;font-size:1rem;font-weight:400;letter-spacing:.01em}
    .legal-divider{max-width:120px;margin:40px auto;height:1px;background:linear-gradient(90deg,transparent,#0ED894,transparent)}
    .legal-content{max-width:780px;margin:0 auto;padding:0 32px 80px;color:#c4c4c4;font-size:1rem;line-height:1.8;font-family:var(--font-poppins,'Poppins'),system-ui,sans-serif}
    .legal-content p{margin:0 0 1.5em;font-weight:400}
    .legal-content p:has(> strong:only-child){margin:2.5em 0 1em;font-size:1.2rem;color:#fff;font-weight:600;letter-spacing:-.01em;padding-top:2em;border-top:1px solid rgba(255,255,255,.06)}
    .legal-content p:first-of-type:has(> strong:only-child){padding-top:0;border-top:none;margin-top:0}
    .legal-content strong{color:#fff;font-weight:600}
    .legal-content em{color:#888;font-style:italic}
    .legal-content a{color:#0ED894;text-decoration:none;border-bottom:1px solid rgba(14,216,148,.3);transition:border-color .2s}
    .legal-content a:hover{border-bottom-color:#0ED894}
    .legal-content h1,.legal-content h2,.legal-content h3,.legal-content h4{color:#fff;font-weight:600;letter-spacing:-.01em;margin:2.5em 0 1em;line-height:1.3}
    .legal-content h1{font-size:1.8rem}
    .legal-content h2{font-size:1.5rem}
    .legal-content h3{font-size:1.25rem}
    .legal-content h4{font-size:1.1rem}
    .legal-content ul,.legal-content ol{margin:0 0 1.5em;padding-left:1.5em}
    .legal-content li{margin:.5em 0;line-height:1.8}
    .legal-content hr{border:none;height:1px;background:rgba(255,255,255,.08);margin:3em 0}
    .legal-content table{width:100%;border-collapse:collapse;margin:2em 0;font-size:.95rem}
    .legal-content th,.legal-content td{padding:12px 16px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08)}
    .legal-content th{color:#fff;font-weight:600;background:rgba(255,255,255,.02)}
    .legal-content code{background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-size:.9em;color:#0ED894}
    .legal-footer{border-top:1px solid rgba(255,255,255,.06);padding:48px 32px;text-align:center}
    .legal-footer-links{display:flex;justify-content:center;gap:32px;margin-bottom:24px;flex-wrap:wrap}
    .legal-footer-links a{color:#888;font-size:.9rem;text-decoration:none;transition:color .2s}
    .legal-footer-links a:hover{color:#fff}
    .legal-footer-copy{color:#555;font-size:.85rem}
    @media(max-width:640px){
      .legal-nav-inner,.legal-hero,.legal-content{padding-left:20px;padding-right:20px}
      .legal-content{font-size:.95rem;line-height:1.7}
    }
  `;

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <nav className="legal-nav">
        <div className="legal-nav-inner">
          <Link href="/" className="legal-brand">band.stream</Link>
          <span className="legal-nav-label">{title}</span>
        </div>
      </nav>

      <section className="legal-hero">
        <h1>{title}</h1>
        <p className="legal-hero-sub">band.stream</p>
        <div className="legal-divider" />
      </section>

      <main className="legal-content" dangerouslySetInnerHTML={{ __html: html }} />

      <footer className="legal-footer">
        <div className="legal-footer-links">
          {otherLinks.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </div>
        <p className="legal-footer-copy">&copy; 2026 band.stream</p>
      </footer>
    </div>
  );
}
