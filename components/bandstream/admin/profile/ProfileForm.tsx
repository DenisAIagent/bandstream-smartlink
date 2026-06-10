'use client';

import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { updateProfileAction, type UpdateProfileState } from '@/lib/actions/profile-actions';

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  email: string;
}

const initialState: UpdateProfileState = {};

export default function ProfileForm({ initialName, initialPhone, email }: ProfileFormProps) {
  const t = useTranslations('profile');
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast({ title: t('saved') });
    } else if (state.error) {
      toast({
        title: t('error'),
        description: t(`error_${state.error}`),
        variant: 'destructive',
      });
    }
  }, [state, t]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialName}
          required
          autoComplete="name"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">
          {t('phone')} <span className="text-muted-foreground text-xs">({t('phone_hint')})</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialPhone}
          autoComplete="tel"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          value={email}
          disabled
          readOnly
          aria-describedby="email-hint"
        />
        <p id="email-hint" className="text-xs text-muted-foreground">
          {t('email_readonly')}
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? t('saving') : t('save')}
      </Button>
    </form>
  );
}
