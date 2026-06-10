'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import styles from '../home.module.css';
import {
  TEMPLATES,
  type TemplateDef,
  type TemplateId,
  type TemplateLink,
  TEMPLATE_ARTWORK,
  TEMPLATE_TITLE,
  TEMPLATE_ARTIST,
} from '../content/templates';
import { PLATFORMS, type PlatformKey } from '../content/platforms';
import PlatformIcon from './PlatformIcon';

interface TemplatePhoneProps {
  activeId: TemplateId;
  ariaLabel: string;
}

function linkColor(templateId: TemplateId, platform: PlatformKey, style?: TemplateLink['style']): string {
  const p = PLATFORMS[platform];
  if (templateId === 'ivory') return p.color;
  if (style === 'primary') return templateId === 'obsidian' ? '#000' : '#fff';
  if (templateId === 'obsidian') return p.color;
  return '#fff';
}

function LinkRow({ templateId, link }: { templateId: TemplateId; link: TemplateLink }) {
  const p = PLATFORMS[link.platform];
  const className = link.style === 'primary' ? `${styles.tplLink} ${styles.primary}` : styles.tplLink;
  return (
    <a href="#" className={className}>
      <span className={styles.pf} style={{ color: linkColor(templateId, link.platform, link.style) }}>
        <PlatformIcon platform={link.platform} />
      </span>
      <span className={styles.pfName}>{p.name}</span>
      <span className={styles.pfAction}>{link.action}</span>
    </a>
  );
}

function LinkFilledRow({ link }: { link: TemplateLink }) {
  const p = PLATFORMS[link.platform];
  const bgStyle: CSSProperties = { background: p.color, color: '#fff' };
  return (
    <a href="#" className={styles.tplLink} style={bgStyle}>
      <span className={styles.pf} style={{ color: '#fff' }}>
        <PlatformIcon platform={link.platform} />
      </span>
      <span className={styles.pfName} style={{ color: '#fff' }}>{p.name}</span>
      <span className={styles.pfAction} style={{ color: 'rgba(255,255,255,.7)' }}>{link.action}</span>
    </a>
  );
}

function TemplateCard({ template, isActive }: { template: TemplateDef; isActive: boolean }) {
  const { id, links } = template;
  const rootClass = isActive ? `${styles.tpl} ${styles.active}` : styles.tpl;

  if (id === 'obsidian') {
    return (
      <div className={`${rootClass} ${styles.tplObsidian}`} data-tpl={id}>
        <div className={styles.tplBody}>
          <div className={styles.tplArt}>
            <Image src={TEMPLATE_ARTWORK} alt="" width={340} height={340} unoptimized />
          </div>
          <div className={styles.tplTitle}>{TEMPLATE_TITLE}</div>
          <div className={styles.tplArtist} style={{ textAlign: 'center' }}>{TEMPLATE_ARTIST}</div>
          <div className={styles.tplLinks} style={{ marginTop: 10 }}>
            {links.map((link) => (
              <LinkRow key={link.platform} templateId={id} link={link} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === 'onyx') {
    return (
      <div className={`${rootClass} ${styles.tplOnyx}`} data-tpl={id}>
        <div className={styles.tplBody}>
          <div className={styles.tplArt}>
            <Image src={TEMPLATE_ARTWORK} alt="" width={340} height={340} unoptimized />
          </div>
          <div className={styles.tplTitle} style={{ marginTop: 10 }}>{TEMPLATE_TITLE}</div>
          <div className={styles.tplArtist}>{TEMPLATE_ARTIST}</div>
          <div className={styles.tplLinks} style={{ marginTop: 10 }}>
            {links.map((link) => (
              <LinkFilledRow key={link.platform} link={link} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === 'prism') {
    return (
      <div className={`${rootClass} ${styles.tplPrism}`} data-tpl={id}>
        <div className={styles.tplBg}>
          <Image src={TEMPLATE_ARTWORK} alt="" fill sizes="380px" unoptimized />
        </div>
        <div className={styles.tplBody}>
          <div className={styles.tplArt}>
            <Image src={TEMPLATE_ARTWORK} alt="" width={340} height={340} unoptimized />
          </div>
          <div className={styles.tplTitle}>{TEMPLATE_TITLE}</div>
          <div className={styles.tplArtist}>{TEMPLATE_ARTIST}</div>
          <div className={styles.tplLinks}>
            {links.map((link) => (
              <LinkRow key={link.platform} templateId={id} link={link} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === 'ivory') {
    return (
      <div className={`${rootClass} ${styles.tplIvory}`} data-tpl={id}>
        <div className={styles.tplBody}>
          <div className={styles.tplArt}>
            <Image src={TEMPLATE_ARTWORK} alt="" width={340} height={340} unoptimized />
          </div>
          <div className={styles.tplTitle}>{TEMPLATE_TITLE}</div>
          <div className={styles.tplArtist} style={{ color: '#666' }}>{TEMPLATE_ARTIST}</div>
          <div className={styles.tplLinks}>
            {links.map((link) => (
              <LinkRow key={link.platform} templateId={id} link={link} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === 'carbon') {
    return (
      <div className={`${rootClass} ${styles.tplCarbon}`} data-tpl={id}>
        <div className={styles.tplBg}>
          <Image src={TEMPLATE_ARTWORK} alt="" fill sizes="380px" unoptimized />
        </div>
        <div className={styles.tplBody}>
          <div className={styles.tplArt}>
            <Image src={TEMPLATE_ARTWORK} alt="" width={340} height={340} unoptimized />
          </div>
          <div className={styles.tplTitle}>{TEMPLATE_TITLE}</div>
          <div className={styles.tplArtist}>{TEMPLATE_ARTIST}</div>
          <div className={styles.tplLinks}>
            {links.map((link) => (
              <LinkRow key={link.platform} templateId={id} link={link} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // overture
  return (
    <div className={`${rootClass} ${styles.tplOverture}`} data-tpl={id}>
      <div className={styles.tplAurora} aria-hidden="true">
        <div className={styles.a1} />
        <div className={styles.a2} />
      </div>
      <div className={styles.tplBody}>
        <div className={styles.tplArtWrap}>
          <div className={styles.vinyl} aria-hidden="true" />
          <div className={styles.tplArt}>
            <Image src={TEMPLATE_ARTWORK} alt="" width={260} height={260} unoptimized />
          </div>
        </div>
        <div className={styles.tplTitle}>
          Les Failles <em>du</em> Monde
        </div>
        <div className={styles.tplArtist} style={{ marginTop: 2 }}>{TEMPLATE_ARTIST}</div>
        <div className={styles.tplCta}>
          <span>Écouter sur Spotify</span>
        </div>
        <div className={styles.tplLinks}>
          {links.map((link) => (
            <LinkRow key={link.platform} templateId={id} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplatePhone({ activeId, ariaLabel }: TemplatePhoneProps) {
  return (
    <div className={styles.phone} aria-label={ariaLabel}>
      <div className={styles.phoneScreen}>
        <div className={styles.tplStage}>
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} isActive={t.id === activeId} />
          ))}
        </div>
      </div>
    </div>
  );
}
