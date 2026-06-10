'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import StepTitle from './StepTitle';
import type { DomainStatus } from './StepName';
import StepPlatforms, { extractCustomURL } from './StepPlatforms';
import StepDesign from './StepDesign';
import StepPublish from './StepPublish';
import PlanLimitCard from '@/components/bandstream/dashboard/smartlinks/PlanLimitCard';
import type { WizardPlatform } from './types';
import type { TemplateId } from '@/components/bandstream/landingpages/templates/shared';

const STEPS = ['title', 'platforms', 'design', 'publish'] as const;

interface SmartLinkWizardProps {
  bandId: number;
  /** '/api/dashboard' ou '/api/admin' */
  apiBase: string;
  /** Base du lien "continuer l'édition" : {editBasePath}/{bandId}/smartlinks/{id} */
  editBasePath: string;
}

export default function SmartLinkWizard({
  bandId,
  apiBase,
  editBasePath,
}: SmartLinkWizardProps) {
  const t = useTranslations('wizard');
  const tsl = useTranslations('smartlinks');
  const tTemplates = useTranslations('templates');

  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [planLimited, setPlanLimited] = useState(false);
  const [domainname, setDomainname] = useState('');

  // Step 1
  const [smartLinkId, setSmartLinkId] = useState<number | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<DomainStatus>('idle');
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Step 2
  const [platforms, setPlatforms] = useState<WizardPlatform[]>([]);
  const [platformUrls, setPlatformUrls] = useState<Record<number, string>>({});

  // Step 3
  const [template, setTemplate] = useState<TemplateId>('obsidian');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Step 4
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const step = STEPS[stepIndex];

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/bands/${bandId}`);
        if (res.ok) {
          const band = await res.json();
          setDomainname(band.domainname ?? '');
        }
      } catch (e) {
        console.error('Failed to load band:', e);
      }
    })();
  }, [apiBase, bandId]);

  const validPlatformEntries = Object.entries(platformUrls)
    .map(([id, url]) => {
      const platform = platforms.find((p) => p.id === Number(id));
      if (!platform) return null;
      const customURL = extractCustomURL(url, platform.URL);
      if (!customURL) return null;
      return { platformId: platform.id, customURL };
    })
    .filter((entry): entry is { platformId: number; customURL: string } =>
      Boolean(entry)
    );

  const hasInvalidPlatformUrl = Object.entries(platformUrls).some(([id, url]) => {
    if (url.trim() === '') return false;
    const platform = platforms.find((p) => p.id === Number(id));
    return !platform || extractCustomURL(url, platform.URL) === null;
  });

  function canGoNext(): boolean {
    if (busy) return false;
    switch (step) {
      case 'title':
        return title.trim().length > 0 && slug.length >= 2 && slugStatus === 'available';
      case 'platforms':
        return !hasInvalidPlatformUrl;
      case 'design':
        return true;
      default:
        return false;
    }
  }

  async function handleApiError(res: Response): Promise<never> {
    let message = t('error_generic');
    try {
      const data = await res.json();
      if (data.error === 'plan_limit') {
        setPlanLimited(true);
        message = '';
      }
      if (data.error === 'taken') message = t('taken');
      if (data.error === 'reserved') message = t('reserved');
      if (data.error === 'invalid') message = t('invalid_slug');
    } catch {
      /* generic */
    }
    throw new Error(message);
  }

  async function saveStep(): Promise<void> {
    switch (step) {
      case 'title': {
        if (smartLinkId === null) {
          const res = await fetch(`${apiBase}/bands/${bandId}/smartlinks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim(), slug }),
          });
          if (!res.ok) await handleApiError(res);
          const created = await res.json();
          setSmartLinkId(created.id);
          setCurrentSlug(created.slug);
        } else {
          const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim(), slug }),
          });
          if (!res.ok) await handleApiError(res);
          setCurrentSlug(slug);
        }
        return;
      }

      case 'platforms': {
        if (smartLinkId === null || validPlatformEntries.length === 0) return;
        const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}/platforms`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platforms: validPlatformEntries }),
        });
        if (!res.ok) await handleApiError(res);
        return;
      }

      case 'design': {
        if (smartLinkId === null) return;
        const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template }),
        });
        if (!res.ok) await handleApiError(res);

        if (coverFile) {
          const formData = new FormData();
          formData.append('image', coverFile);
          const uploadRes = await fetch(
            `${apiBase}/smartlinks/${smartLinkId}/upload`,
            { method: 'POST', body: formData }
          );
          if (!uploadRes.ok) await handleApiError(uploadRes);
        }
        return;
      }
    }
  }

  async function goNext() {
    setBusy(true);
    try {
      await saveStep();
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    } catch (e) {
      const message = e instanceof Error ? e.message : t('error_generic');
      if (message) {
        toast({ title: message, variant: 'destructive' });
      }
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (smartLinkId === null) return;
    setPublishing(true);
    try {
      const res = await fetch(`${apiBase}/smartlinks/${smartLinkId}/publish`, {
        method: 'POST',
      });
      if (!res.ok) await handleApiError(res);
      const data = await res.json();
      setPublishedUrl(data.url);
    } catch (e) {
      const message = e instanceof Error ? e.message : t('error_generic');
      if (message) toast({ title: message, variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  }

  /** Relance le wizard à zéro pour une nouvelle sortie. */
  function resetWizard() {
    setStepIndex(0);
    setSmartLinkId(null);
    setCurrentSlug(null);
    setTitle('');
    setSlug('');
    setSlugStatus('idle');
    setSuggestion(null);
    setPlatformUrls({});
    setTemplate('obsidian');
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setPublishedUrl(null);
  }

  if (planLimited) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <PlanLimitCard />
      </div>
    );
  }

  const stepTitles: Record<string, string> = {
    title: t('step_title'),
    platforms: t('step_platforms'),
    design: t('step_design'),
    publish: t('step_publish'),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 pt-6 sm:pt-10">
      <nav aria-label={t('title')} className="mb-8">
        <p className="text-xs text-muted-foreground mb-2">
          {t('progress', { current: stepIndex + 1, total: STEPS.length })}
        </p>
        <div className="flex items-center gap-2" role="presentation">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-green-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mt-4">{stepTitles[step]}</h1>
      </nav>

      {step === 'title' && (
        <StepTitle
          title={title}
          slug={slug}
          bandId={bandId}
          domainname={domainname}
          apiBase={apiBase}
          onTitleChange={setTitle}
          onSlugChange={setSlug}
          slugStatus={slugStatus}
          suggestion={suggestion}
          onSlugStatus={(status, sug) => {
            setSlugStatus(status);
            setSuggestion(sug);
          }}
          currentSlug={currentSlug}
        />
      )}

      {step === 'platforms' && (
        <StepPlatforms
          platformUrls={platformUrls}
          onChange={setPlatformUrls}
          platforms={platforms}
          onPlatformsLoaded={setPlatforms}
        />
      )}

      {step === 'design' && (
        <StepDesign
          template={template}
          onTemplateChange={setTemplate}
          coverPreview={coverPreview}
          onCoverChange={(file, preview) => {
            setCoverFile(file);
            setCoverPreview(preview);
          }}
        />
      )}

      {step === 'publish' && (
        <StepPublish
          name={title}
          urlLabel={`${domainname}.band.stream/${currentSlug ?? slug}`}
          platformCount={validPlatformEntries.length}
          templateName={tTemplates(`name_${template}`)}
          publishedUrl={publishedUrl}
          publishing={publishing}
          onPublish={publish}
          editHref={
            smartLinkId !== null
              ? `${editBasePath}/${bandId}/smartlinks/${smartLinkId}`
              : `${editBasePath}/${bandId}`
          }
          onCreateAnother={resetWizard}
          backHref={`${editBasePath}/${bandId}`}
          backLabel={tsl('back_to_artist')}
        />
      )}

      {!publishedUrl && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={stepIndex === 0 || busy}
              onClick={() => setStepIndex((i) => Math.max(i - 1, 0))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> {t('back')}
            </Button>

            {step !== 'publish' && (
              <div className="flex items-center gap-2">
                {step === 'platforms' && validPlatformEntries.length === 0 && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {t('skip_hint')}
                  </span>
                )}
                <Button type="button" disabled={!canGoNext()} onClick={goNext}>
                  {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {t('next')} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
