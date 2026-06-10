'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { extractCustomURL } from '@/components/bandstream/wizard/StepPlatforms';
import type { WizardPlatform } from '@/components/bandstream/wizard/types';

interface AddPlatformDialogProps {
  /** Endpoint PUT complet recevant { platforms: [{platformId, customURL}] }
      ex. /api/dashboard/bands/3/platforms ou /api/dashboard/smartlinks/7/platforms */
  apiPath: string;
  /** Platform ids already linked (hidden from the picker) */
  existingPlatformIds: number[];
  /** Called with the refreshed entity returned by the API */
  onAdded: (entity: unknown) => void;
}

export default function AddPlatformDialog({
  apiPath,
  existingPlatformIds,
  onAdded,
}: AddPlatformDialogProps) {
  const t = useTranslations('wizard');
  const tb = useTranslations('bands');

  const [open, setOpen] = useState(false);
  const [platforms, setPlatforms] = useState<WizardPlatform[]>([]);
  const [platformId, setPlatformId] = useState<string>('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || platforms.length > 0) return;
    (async () => {
      try {
        const res = await fetch('/api/dashboard/platforms');
        if (res.ok) setPlatforms(await res.json());
      } catch (e) {
        console.error('Failed to load platforms:', e);
      }
    })();
  }, [open, platforms.length]);

  const available = platforms.filter(
    (p) => !existingPlatformIds.includes(p.id)
  );
  const selected = platforms.find((p) => String(p.id) === platformId) ?? null;
  const customURL =
    selected && url.trim() !== '' ? extractCustomURL(url, selected.URL) : null;
  const urlInvalid = url.trim() !== '' && selected !== null && customURL === null;

  async function submit() {
    if (!selected || !customURL) return;
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: [{ platformId: selected.id, customURL }],
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const band = await res.json();
      onAdded(band);
      toast({ title: t('platform_added', { platform: selected.name }) });
      setOpen(false);
      setPlatformId('');
      setUrl('');
    } catch (e) {
      console.error('Failed to add platform:', e);
      toast({ title: t('error_generic'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('add_platform')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('add_platform')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{tb('platforms')}</Label>
            <Select value={platformId} onValueChange={setPlatformId}>
              <SelectTrigger>
                <SelectValue placeholder={t('pick_platform')} />
              </SelectTrigger>
              <SelectContent>
                {available.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {available.length === 0 && platforms.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {t('all_platforms_linked')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-platform-url">{t('paste_url')}</Label>
            <Input
              id="add-platform-url"
              type="url"
              inputMode="url"
              value={url}
              placeholder={selected ? `${selected.URL}/...` : 'https://'}
              className={urlInvalid ? 'border-destructive' : ''}
              onChange={(e) => setUrl(e.target.value)}
            />
            {urlInvalid && selected && (
              <p className="text-xs text-destructive">
                {t('url_invalid_for_platform', { platform: selected.name })}
              </p>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={!selected || !customURL || saving}
            onClick={submit}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('add_platform_confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
