'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logout } from '@/components/auth/auth';

export default function ProfileLogoutButton() {
  const t = useTranslations('profile');
  return (
    <Button variant="outline" onClick={() => logout()}>
      <LogOut className="mr-2 h-4 w-4" />
      {t('logout')}
    </Button>
  );
}
