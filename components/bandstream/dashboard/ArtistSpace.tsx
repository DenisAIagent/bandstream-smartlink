'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart3, ExternalLink, Plus } from 'lucide-react';
import debounce from 'lodash/debounce';
import SmartLinkCard, {
  type SmartLinkListItem,
} from './smartlinks/SmartLinkCard';
import {
  SOCIAL_KEYS,
  SOCIAL_LABELS,
  type SocialKey,
} from '@/components/bandstream/landingpages/hub/SocialIcons';

interface ArtistData {
  id: number;
  name: string;
  domainname: string;
  bio: string | null;
  socials: Partial<Record<SocialKey, string>> | null;
  trackingGTM: string | null;
  trackingGTAG: string | null;
  trackingMeta: string | null;
}

interface ArtistSpaceProps {
  bandId: number;
}

/**
 * Espace artiste du dashboard : ses smartlinks, son profil public
 * (bio + réseaux du hub) et son tracking. Auto-save débouncé, même
 * pattern que l'ancien BandEditForm.
 */
export default function ArtistSpace({ bandId }: ArtistSpaceProps) {
  const t = useTranslations('smartlinks');
  const td = useTranslations('dashboard');
  const tb = useTranslations('bands');
  const tw = useTranslations('wizard');
  const ts = useTranslations('stats');

  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [smartLinks, setSmartLinks] = useState<SmartLinkListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});

  const fetchAll = useCallback(async () => {
    try {
      const [bandRes, listRes] = await Promise.all([
        fetch(`/api/dashboard/bands/${bandId}`),
        fetch(`/api/dashboard/bands/${bandId}/smartlinks`),
      ]);
      if (bandRes.ok) setArtist(await bandRes.json());
      if (listRes.ok) setSmartLinks(await listRes.json());
    } catch (error) {
      console.error('Error fetching artist space:', error);
    } finally {
      setLoading(false);
    }
  }, [bandId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const persist = useCallback(
    async (payload: Record<string, unknown>, fieldKey: string) => {
      try {
        const res = await fetch(`/api/dashboard/bands/${bandId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('update failed');
        setSavedFields((prev) => ({ ...prev, [fieldKey]: true }));
        setTimeout(
          () => setSavedFields((prev) => ({ ...prev, [fieldKey]: false })),
          1000
        );
        toast({ title: td('saved'), description: td('field_updated'), duration: 2000 });
      } catch (error) {
        console.error('Error updating artist:', error);
        toast({
          title: td('error'),
          description: td('field_update_failed'),
          variant: 'destructive',
        });
      }
    },
    [bandId, td]
  );

  const debouncedPersist = useMemo(
    () => debounce(persist, 2000),
    [persist]
  );

  useEffect(() => () => debouncedPersist.cancel(), [debouncedPersist]);

  const updateField = (field: keyof ArtistData, value: string) => {
    setArtist((prev) => (prev ? { ...prev, [field]: value } : prev));
    debouncedPersist({ [field]: value }, field);
  };

  const updateSocial = (key: SocialKey, value: string) => {
    setArtist((prev) => {
      if (!prev) return prev;
      const socials = { ...(prev.socials ?? {}), [key]: value };
      debouncedPersist({ socials }, `social_${key}`);
      return { ...prev, socials };
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">...</div>;
  }

  if (!artist) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {td('band_not_found')}
      </div>
    );
  }

  const savedClass = (field: string) =>
    savedFields[field] ? 'bg-green-100 dark:bg-green-900 transition-colors' : '';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {td('back_to_artists')}
          </Button>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href={`/dashboard/bands/${bandId}/stats`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              {ts('nav_label')}
            </Button>
          </Link>
          <a
            href={`https://${artist.domainname}.band.stream`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              {td('preview')}
            </Button>
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{artist.name}</CardTitle>
          <p className="text-xs text-muted-foreground font-normal">
            {tw('autosave_hint')}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="smartlinks" className="w-full">
            <TabsList className="grid w-full h-auto grid-cols-3">
              <TabsTrigger value="smartlinks">{t('tab_smartlinks')}</TabsTrigger>
              <TabsTrigger value="profile">{t('tab_profile')}</TabsTrigger>
              <TabsTrigger value="tracking">{t('tab_tracking')}</TabsTrigger>
            </TabsList>

            {/* Smartlinks */}
            <TabsContent value="smartlinks" className="space-y-4">
              <div className="flex justify-end">
                <Link href={`/dashboard/bands/${bandId}/smartlinks/new`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('create')}
                  </Button>
                </Link>
              </div>

              {smartLinks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{t('empty')}</p>
                  <p className="text-sm mt-1">{t('empty_hint')}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {smartLinks.map((sl) => (
                    <SmartLinkCard
                      key={sl.id}
                      bandId={bandId}
                      domainname={artist.domainname}
                      smartLink={sl}
                      editBasePath="/dashboard/bands"
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Profil artiste (hub public) */}
            <TabsContent value="profile" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('artist_hub_hint')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="artist-name">{tb('bandname')}</Label>
                    <Input
                      id="artist-name"
                      value={artist.name ?? ''}
                      className={savedClass('name')}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="artist-bio">{t('bio_label')}</Label>
                    <textarea
                      id="artist-bio"
                      value={artist.bio ?? ''}
                      placeholder={t('bio_placeholder')}
                      rows={5}
                      className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${savedClass('bio')}`}
                      onChange={(e) => updateField('bio', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>{t('socials_label')}</Label>
                  {SOCIAL_KEYS.map((key) => (
                    <div key={key} className="space-y-1">
                      <Label
                        htmlFor={`social-${key}`}
                        className="text-xs text-muted-foreground"
                      >
                        {SOCIAL_LABELS[key]}
                      </Label>
                      <Input
                        id={`social-${key}`}
                        type="url"
                        inputMode="url"
                        placeholder={`https://…`}
                        value={artist.socials?.[key] ?? ''}
                        className={savedClass(`social_${key}`)}
                        onChange={(e) => updateSocial(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tracking */}
            <TabsContent value="tracking" className="space-y-4">
              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <Label htmlFor="trackingGTAG">Google Analytics (GTAG)</Label>
                  <Input
                    id="trackingGTAG"
                    value={artist.trackingGTAG ?? ''}
                    placeholder="G-XXXXXXXXXX"
                    className={savedClass('trackingGTAG')}
                    onChange={(e) => updateField('trackingGTAG', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="trackingGTM">Google Tag Manager</Label>
                  <Input
                    id="trackingGTM"
                    value={artist.trackingGTM ?? ''}
                    placeholder="GTM-XXXXXXX"
                    className={savedClass('trackingGTM')}
                    onChange={(e) => updateField('trackingGTM', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="trackingMeta">Meta Pixel</Label>
                  <Input
                    id="trackingMeta"
                    value={artist.trackingMeta ?? ''}
                    placeholder="1234567890"
                    className={savedClass('trackingMeta')}
                    onChange={(e) => updateField('trackingMeta', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
