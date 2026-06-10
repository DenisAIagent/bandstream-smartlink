'use client';

import { useTranslations } from 'next-intl';
import { Check, Loader2, ExternalLink } from 'lucide-react';
import { TEMPLATE_IDS, type TemplateId } from '@/components/bandstream/landingpages/templates/shared';

export const TEMPLATE_META: Record<TemplateId, { previewPath: string; thumbBg: string }> = {
  obsidian: { previewPath: '/demo', thumbBg: 'from-neutral-900 to-neutral-950' },
  onyx: { previewPath: '/demo2', thumbBg: 'from-neutral-800 to-neutral-900' },
  prism: { previewPath: '/demo3', thumbBg: 'from-purple-900 via-neutral-900 to-black' },
  ivory: { previewPath: '/demo4', thumbBg: 'from-neutral-50 to-neutral-100' },
  carbon: { previewPath: '/demo5', thumbBg: 'from-black via-neutral-900 to-black' },
};

interface TemplateGridProps {
  selected: TemplateId;
  /** Template currently being persisted (shows a spinner) */
  saving?: TemplateId | null;
  onSelect: (templateId: TemplateId) => void;
}

/**
 * Presentational template chooser shared by the admin TemplatePicker
 * (auto-save) and the artist creation wizard (local state).
 */
export default function TemplateGrid({ selected, saving = null, onSelect }: TemplateGridProps) {
  const t = useTranslations('templates');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TEMPLATE_IDS.map((id) => {
        const meta = TEMPLATE_META[id];
        const isSelected = selected === id;
        const isSaving = saving === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            disabled={saving !== null}
            className={`relative text-left rounded-lg border-2 transition-all overflow-hidden hover:shadow-lg disabled:opacity-50 ${
              isSelected ? 'border-green-accent ring-2 ring-green-accent/30' : 'border-border'
            }`}
          >
            <div className={`aspect-video bg-gradient-to-br ${meta.thumbBg} relative`}>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-green-accent text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              {isSaving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="p-3 bg-background">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-sm">{t(`name_${id}`)}</span>
                <a
                  href={meta.previewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  {t('preview')} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{t(`desc_${id}`)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
