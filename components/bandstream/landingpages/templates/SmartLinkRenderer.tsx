'use client';

/**
 * SmartLinkRenderer — picks the right SmartLink template based on
 * `band.template` and renders it with adapted props.
 *
 * If the template id is unknown or null, falls back to "obsidian"
 * (the new default chosen for #42).
 */
import type { Band } from '@/types/bandstream';
import {
  buildSmartLinkProps,
  buildSmartLinkPropsFromSmartLink,
  type SmartLinkRenderData,
} from './adapter';
import { isValidTemplateId, type TemplateId } from './shared';
import { SmartLinkObsidian } from './obsidian/SmartLinkObsidian';
import { SmartLinkOnyx } from './onyx/SmartLinkOnyx';
import { SmartLinkPrism } from './prism/SmartLinkPrism';
import { SmartLinkIvory } from './ivory/SmartLinkIvory';
import { SmartLinkCarbon } from './carbon/SmartLinkCarbon';

interface SmartLinkRendererProps {
  band: (Band & { template?: string | null }) | { name: string; template?: string | null };
  /** Quand fourni, on rend cette sortie ; sinon, fallback legacy sur les champs du Band */
  smartLink?: SmartLinkRenderData;
  accentRgb?: [number, number, number];
}

export default function SmartLinkRenderer({ band, smartLink, accentRgb }: SmartLinkRendererProps) {
  const props = smartLink
    ? buildSmartLinkPropsFromSmartLink(band, smartLink, accentRgb)
    : buildSmartLinkProps(band as Band, accentRgb);
  const templateSource = smartLink ? smartLink.template : band.template;
  const templateId: TemplateId = isValidTemplateId(templateSource) ? templateSource : 'obsidian';

  switch (templateId) {
    case 'onyx':
      return <SmartLinkOnyx {...props} />;
    case 'prism':
      return <SmartLinkPrism {...props} />;
    case 'ivory':
      return <SmartLinkIvory {...props} />;
    case 'carbon':
      return <SmartLinkCarbon {...props} />;
    case 'obsidian':
    default:
      return <SmartLinkObsidian {...props} />;
  }
}
