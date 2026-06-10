'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import { TEMPLATE_IDS, type TemplateId } from '@/components/bandstream/landingpages/templates/shared';
import TemplateGrid from './TemplateGrid';

interface TemplatePickerProps {
  bandId: number;
  initialTemplate: string;
}

export default function TemplatePicker({ bandId, initialTemplate }: TemplatePickerProps) {
  const t = useTranslations('templates');
  const [selected, setSelected] = useState<TemplateId>(
    (TEMPLATE_IDS as readonly string[]).includes(initialTemplate)
      ? (initialTemplate as TemplateId)
      : 'obsidian'
  );
  const [saving, setSaving] = useState<TemplateId | null>(null);

  async function pickTemplate(templateId: TemplateId) {
    if (templateId === selected) return;
    setSaving(templateId);
    try {
      const res = await fetch(`/api/admin/bands/${bandId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSelected(templateId);
      toast({ title: t('saved'), description: t(`name_${templateId}`) });
    } catch (e) {
      console.error('template save failed', e);
      toast({ title: t('error'), variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{t('hint')}</p>
      <TemplateGrid selected={selected} saving={saving} onSelect={pickTemplate} />
    </div>
  );
}
