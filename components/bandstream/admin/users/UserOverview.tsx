'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, LifeBuoy, Music, Users } from 'lucide-react';

type Plan = 'FREE' | 'PRO' | 'LABEL';
type Role = 'CUSTOMER' | 'ADMIN' | 'OWNER' | 'READER';

interface Overview {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: Role;
  createdAt: string;
  stripeCustomerId: string | null;
  plan: Plan;
  artists: {
    id: number;
    name: string;
    domainname: string;
    publishedAt: string | null;
    memberRole: string;
    smartLinkCount: number;
    publishedSmartLinks: number;
  }[];
  labelTeam: { id: number; email: string; userId: string | null }[];
  tickets: { id: number; subject: string; status: string; updatedAt: string }[];
}

export default function UserOverview({ userId }: { userId: string }) {
  const ta = useTranslations('admin');
  const locale = useLocale();
  const { data: session } = useSession();

  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/overview`);
      if (res.ok) setData(await res.json());
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  async function changePlan(plan: Plan) {
    if (!data) return;
    const previous = data;
    setData({ ...data, plan });
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error('plan failed');
      toast({ title: `Plan ${plan} activé`, duration: 2000 });
    } catch {
      setData(previous);
      toast({ title: ta('error'), variant: 'destructive' });
    }
  }

  async function changeRole(role: Role) {
    if (!data) return;
    const previous = data;
    setData({ ...data, role });
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('role failed');
      toast({ title: ta('user_role_updated'), duration: 2000 });
    } catch {
      setData(previous);
      toast({ title: ta('error'), variant: 'destructive' });
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">...</div>;
  }
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {ta('user_not_found')}
      </div>
    );
  }

  const callerIsOwner = (session?.user as { role?: string })?.role === 'OWNER';
  const isSelf = session?.user?.id === data.id;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4">
      <Link href="/admin/users">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {ta('back_to_users')}
        </Button>
      </Link>

      {/* Identité */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-14 w-14">
            {data.image && <AvatarImage src={data.image} alt="" />}
            <AvatarFallback>
              {(data.name || data.email || '?')
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{data.name || data.email}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {data.email}
              {data.phone ? ` · ${data.phone}` : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ta('user_since', {
                date: new Date(data.createdAt).toLocaleDateString(locale, {
                  dateStyle: 'long',
                }),
              })}
              {data.stripeCustomerId ? ' · Stripe ✓' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Plan</p>
              <Select value={data.plan} onValueChange={(v) => changePlan(v as Plan)}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="LABEL">Label</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{ta('user_role')}</p>
              <Select
                value={data.role}
                onValueChange={(v) => changeRole(v as Role)}
                disabled={!callerIsOwner || isSelf}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="ADMIN">Admin band.stream</SelectItem>
                  <SelectItem value="OWNER">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artistes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="h-4 w-4" />
            {ta('user_artists')} ({data.artists.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.artists.length === 0 && (
            <p className="text-sm text-muted-foreground">{ta('user_no_artists')}</p>
          )}
          {data.artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/admin/bands/edit/${artist.id}`}
              className="flex items-center gap-3 p-2.5 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{artist.name}</p>
                  {!artist.publishedAt && (
                    <Badge variant="secondary">{ta('user_draft')}</Badge>
                  )}
                  {artist.memberRole !== 'OWNER' && (
                    <Badge variant="outline">{artist.memberRole}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {artist.domainname}.band.stream
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {artist.publishedSmartLinks}/{artist.smartLinkCount} smartlinks
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Équipe label */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {ta('user_label_team')} ({data.labelTeam.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {data.labelTeam.length === 0 && (
              <p className="text-sm text-muted-foreground">{ta('user_no_team')}</p>
            )}
            {data.labelTeam.map((member) => (
              <div key={member.id} className="flex items-center gap-2 text-sm">
                <span className="truncate">{member.email}</span>
                {!member.userId && (
                  <Badge variant="secondary" className="text-[10px]">
                    {ta('user_invite_pending')}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tickets support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" />
              {ta('user_tickets')} ({data.tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {data.tickets.length === 0 && (
              <p className="text-sm text-muted-foreground">{ta('user_no_tickets')}</p>
            )}
            {data.tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/support/${ticket.id}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Badge
                  variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}
                  className="text-[10px] shrink-0"
                >
                  {ticket.status}
                </Badge>
                <span className="truncate">{ticket.subject}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
