'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Loader2,
  Music,
  Rocket,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import TemplateGrid from '@/components/bandstream/admin/forms/TemplateGrid';
import AddPlatformDialog from '@/components/bandstream/shared/AddPlatformDialog';
import {
  TEMPLATE_IDS,
  type TemplateId,
} from '@/components/bandstream/landingpages/templates/shared';

interface SmartLinkPlatformRow {
  id: number;
  platformId: number;
  customURL: string;
  platform: { id: number; name: string; shortname: string; URL: string };
}

interface SmartLinkDetail {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  musicSample: string | null;
  template: string;
  publishedAt: string | null;
  unpublishedAt: string | null;
  platforms: SmartLinkPlatformRow[];
  band: { id: number; name: string; domainname: string };
}

interface SmartLinkEditFormProps {
  smartLinkId: number;
  /** '/api/dashboard' (défaut) ou '/api/admin' */
  apiBase?: string;
  /** Base du lien retour artiste : '/dashboard/bands' ou '/admin/bands/edit' */
  backBasePath?: string;
}

export default function SmartLinkEditForm({
  smartLinkId,
  apiBase = '/api/dashboard',
  backBasePath = '/dashboard/bands',
}: SmartLinkEditFormProps) {
  const t = useTranslations('smartlinks');
  const td = useTranslations('dashboard');
  const tw = useTranslations('wizard');

  const [smartLink, setSmartLink] = useState<SmartLinkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPlatform, setDeletingPlatform] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSmartLink = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}`);
      if (res.ok) setSmartLink(await res.json());
    } catch (error) {
      console.error('Error fetching smartlink:', error);
    } finally {
      setLoading(false);
    }
  }, [smartLinkId, apiBase]);

  useEffect(() => {
    fetchSmartLink();
  }, [fetchSmartLink]);

  const persist = useCallback(
    async (payload: Record<string, unknown>, fieldKey: string) => {
      try {
        const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'update failed');
        }
        setSavedFields((prev) => ({ ...prev, [fieldKey]: true }));
        setTimeout(
          () => setSavedFields((prev) => ({ ...prev, [fieldKey]: false })),
          1000
        );
        toast({ title: td('saved'), description: td('field_updated'), duration: 2000 });
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        toast({
          title: td('error'),
          description:
            message === 'taken'
              ? t('slug_taken')
              : td('field_update_failed'),
          variant: 'destructive',
        });
      }
    },
    [smartLinkId, apiBase, td, t]
  );

  const debouncedPersist = useMemo(() => debounce(persist, 2000), [persist]);
  useEffect(() => () => debouncedPersist.cancel(), [debouncedPersist]);

  const updateField = (field: 'title' | 'slug', value: string) => {
    setSmartLink((prev) => (prev ? { ...prev, [field]: value } : prev));
    debouncedPersist({ [field]: value }, field);
  };

  async function pickTemplate(templateId: TemplateId) {
    if (!smartLink || templateId === smartLink.template) return;
    setSmartLink((prev) => (prev ? { ...prev, template: templateId } : prev));
    await persist({ template: templateId }, 'template');
  }

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('upload failed');
      const updated = await res.json();
      setSmartLink((prev) =>
        prev ? { ...prev, coverImage: updated.coverImage } : prev
      );
      toast({ title: td('saved'), duration: 2000 });
    } catch (error) {
      console.error('Cover upload failed:', error);
      toast({ title: td('error'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  async function togglePublish() {
    if (!smartLink) return;
    setPublishing(true);
    try {
      if (isLive) {
        const unpub = await fetch(`${apiBase}/smartlinks/${smartLinkId}/unpublish`, {
          method: 'POST',
        });
        if (!unpub.ok) throw new Error('unpublish failed');
        setSmartLink((prev) =>
          prev ? { ...prev, unpublishedAt: new Date().toISOString() } : prev
        );
      } else {
        const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}/publish`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('publish failed');
        setSmartLink((prev) =>
          prev
            ? { ...prev, publishedAt: new Date().toISOString(), unpublishedAt: null }
            : prev
        );
      }
      toast({ title: td('saved'), duration: 2000 });
    } catch (error) {
      console.error('Publish toggle failed:', error);
      toast({ title: td('error'), variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  }

  const deletePlatform = async (platformId: number) => {
    try {
      const res = await fetch(
        `${apiBase}/smartlinks/${smartLinkId}/platforms/${platformId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('delete failed');
      setSmartLink((prev) =>
        prev
          ? {
              ...prev,
              platforms: prev.platforms.filter((p) => p.platformId !== platformId),
            }
          : prev
      );
      toast({ title: td('saved'), description: td('platform_deleted'), duration: 2000 });
    } catch {
      toast({ title: td('error'), variant: 'destructive' });
    } finally {
      setDeletingPlatform(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">...</div>;
  }

  if (!smartLink) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {td('band_not_found')}
      </div>
    );
  }

  const isLive = Boolean(smartLink.publishedAt) && !smartLink.unpublishedAt;
  const liveUrl = `https://${smartLink.band.domainname}.band.stream/${smartLink.slug}`;
  const selectedTemplate: TemplateId = (TEMPLATE_IDS as readonly string[]).includes(
    smartLink.template
  )
    ? (smartLink.template as TemplateId)
    : 'obsidian';

  const savedClass = (field: string) =>
    savedFields[field] ? 'bg-green-100 dark:bg-green-900 transition-colors' : '';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`${backBasePath}/${smartLink.band.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back_to_artist')}
          </Button>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {isLive && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('view_live')}
              </Button>
            </a>
          )}
          <Button size="sm" disabled={publishing} onClick={togglePublish}>
            {publishing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 mr-2" />
            )}
            {isLive ? t('unpublish') : t('publish')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{smartLink.title}</CardTitle>
            <Badge variant={isLive ? 'default' : 'secondary'}>
              {isLive ? t('published_badge') : t('draft')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-normal">
            {tw('autosave_hint')}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full h-auto grid-cols-3">
              <TabsTrigger value="info">{t('title_label')}</TabsTrigger>
              <TabsTrigger value="platforms">{td('platforms')}</TabsTrigger>
              <TabsTrigger value="design">{tw('step_design')}</TabsTrigger>
            </TabsList>

            {/* Infos */}
            <TabsContent value="info" className="space-y-4 max-w-md">
              <div className="space-y-1">
                <Label htmlFor="sl-title">{t('title_label')}</Label>
                <Input
                  id="sl-title"
                  value={smartLink.title}
                  className={savedClass('title')}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sl-slug">{t('slug_label')}</Label>
                <div className="flex items-center">
                  <span className="h-9 inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-xs text-muted-foreground whitespace-nowrap">
                    {smartLink.band.domainname}.band.stream/
                  </span>
                  <Input
                    id="sl-slug"
                    value={smartLink.slug}
                    className={`rounded-l-none font-mono text-sm ${savedClass('slug')}`}
                    onChange={(e) =>
                      updateField(
                        'slug',
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      )
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t('slug_hint')}</p>
                {isLive && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 flex items-start gap-1.5">
                    <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {t('slug_warning_published')}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Plateformes */}
            <TabsContent value="platforms" className="space-y-4">
              <div className="flex justify-end">
                <AddPlatformDialog
                  apiPath={`${apiBase}/smartlinks/${smartLinkId}/platforms`}
                  existingPlatformIds={smartLink.platforms.map((p) => p.platformId)}
                  onAdded={(updated) =>
                    setSmartLink((prev) =>
                      prev
                        ? { ...prev, platforms: (updated as SmartLinkDetail).platforms }
                        : prev
                    )
                  }
                />
              </div>
              {smartLink.platforms.length === 0 ? (
                <p className="text-muted-foreground">{td('no_platforms')}</p>
              ) : (
                <div className="space-y-3">
                  {smartLink.platforms.map((sp) => (
                    <div
                      key={sp.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="font-medium min-w-[120px]">
                        {sp.platform.name}
                      </div>
                      <span className="text-sm text-muted-foreground truncate flex-1">
                        {sp.platform.URL}/{sp.customURL}
                      </span>
                      {deletingPlatform === sp.platformId ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePlatform(sp.platformId)}
                          >
                            OK
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingPlatform(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPlatform(sp.platformId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Design */}
            <TabsContent value="design" className="space-y-6">
              <div className="space-y-2">
                <Label>{tw('cover_label')}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCover(file);
                  }}
                />
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    {smartLink.coverImage ? (
                      <Image
                        src={smartLink.coverImage}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-7 h-7 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4 mr-2" />
                    )}
                    {tw('cover_upload')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{tw('template_label')}</Label>
                <TemplateGrid
                  selected={selectedTemplate}
                  onSelect={pickTemplate}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
