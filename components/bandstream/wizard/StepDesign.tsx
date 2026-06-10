'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';
import TemplateGrid from '@/components/bandstream/admin/forms/TemplateGrid';
import type { TemplateId } from '@/components/bandstream/landingpages/templates/shared';

interface StepDesignProps {
  template: TemplateId;
  onTemplateChange: (template: TemplateId) => void;
  coverPreview: string | null;
  onCoverChange: (file: File | null, preview: string | null) => void;
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

export default function StepDesign({
  template,
  onTemplateChange,
  coverPreview,
  onCoverChange,
}: StepDesignProps) {
  const t = useTranslations('wizard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (!file) {
      onCoverChange(null, null);
      return;
    }
    onCoverChange(file, URL.createObjectURL(file));
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>{t('template_label')}</Label>
        <p className="text-sm text-muted-foreground">{t('template_hint')}</p>
        <TemplateGrid selected={template} onSelect={onTemplateChange} />
      </div>

      <div className="space-y-2">
        <Label>{t('cover_label')}</Label>
        <p className="text-sm text-muted-foreground">{t('cover_hint')}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {coverPreview ? (
          <div className="relative w-40 h-40">
            <Image
              src={coverPreview}
              alt={t('cover_preview_alt')}
              fill
              unoptimized
              className="object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              aria-label={t('cover_remove')}
              onClick={() => {
                handleFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {t('cover_upload')}
          </Button>
        )}
      </div>
    </div>
  );
}
