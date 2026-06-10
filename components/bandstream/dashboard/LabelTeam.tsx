'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trash2, UserPlus, Users } from 'lucide-react';

interface Member {
  id: number;
  email: string;
  userId: string | null;
  user: { name: string | null; image: string | null } | null;
}

/**
 * Gestion de l'équipe d'un compte Label (5 sièges, gérant inclus).
 * Affichée dans les Paramètres uniquement pour le gérant.
 */
export default function LabelTeam() {
  const t = useTranslations('labelTeam');

  const [members, setMembers] = useState<Member[]>([]);
  const [seats, setSeats] = useState(5);
  const [used, setUsed] = useState(1);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/label/members');
      if (res.status === 403) {
        setVisible(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
        setSeats(data.seats);
        setUsed(data.used);
        setVisible(true);
      }
    } catch (error) {
      console.error('Error fetching label members:', error);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (!visible) return null;

  async function invite() {
    setBusy(true);
    try {
      const res = await fetch('/api/dashboard/label/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        const key =
          data.error === 'seats_limit'
            ? 'error_seats'
            : data.error === 'already_member'
              ? 'error_already'
              : data.error === 'is_owner'
                ? 'error_owner'
                : 'error_email';
        toast({ title: t(key), variant: 'destructive' });
        return;
      }
      setEmail('');
      toast({ title: t('invited', { email: data.email }) });
      await fetchMembers();
    } catch {
      toast({ title: t('error_generic'), variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(memberId: number) {
    try {
      const res = await fetch(`/api/dashboard/label/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('remove failed');
      toast({ title: t('removed') });
      await fetchMembers();
    } catch {
      toast({ title: t('error_generic'), variant: 'destructive' });
    }
  }

  const atCapacity = used >= seats;

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-1">
        <Users className="h-5 w-5" />
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <span className="text-sm text-muted-foreground ml-1">
          {used}/{seats}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t('hint')}</p>

      <div className="space-y-2 mb-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2.5 border rounded-lg"
          >
            <Avatar className="h-8 w-8">
              {member.user?.image && <AvatarImage src={member.user.image} alt="" />}
              <AvatarFallback className="text-xs">
                {(member.user?.name || member.email)
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {member.user?.name || member.email}
              </p>
              {member.user?.name && (
                <p className="text-xs text-muted-foreground truncate">
                  {member.email}
                </p>
              )}
            </div>
            {!member.userId && (
              <Badge variant="secondary">{t('pending')}</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              aria-label={t('remove')}
              onClick={() => remove(member.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">{t('empty')}</p>
        )}
      </div>

      {atCapacity ? (
        <p className="text-xs text-muted-foreground">{t('seats_full')}</p>
      ) : (
        <div className="flex gap-2">
          <Input
            type="email"
            inputMode="email"
            value={email}
            placeholder={t('email_placeholder')}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email.includes('@')) invite();
            }}
          />
          <Button onClick={invite} disabled={busy || !email.includes('@')}>
            {busy ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {t('invite')}
          </Button>
        </div>
      )}
    </div>
  );
}
