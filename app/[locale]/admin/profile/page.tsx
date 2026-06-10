import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getTranslations, getLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, CreditCard, LogOut } from 'lucide-react';
import ProfileForm from '@/components/bandstream/admin/profile/ProfileForm';
import ProfileSubscription from '@/components/bandstream/admin/profile/ProfileSubscription';
import ProfileLogoutButton from '@/components/bandstream/admin/profile/ProfileLogoutButton';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const t = await getTranslations('profile');
  const locale = await getLocale();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>

      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Profile info */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <UserCircle className="h-5 w-5" />
              {t('section_info')}
            </h2>
            <ProfileForm
              initialName={user.name ?? ''}
              initialPhone={user.phone ?? ''}
              email={user.email ?? ''}
            />
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-sm">
              <div>
                <p className="text-muted-foreground">{t('member_since')}</p>
                <p className="font-medium">{dateFormatter.format(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('role')}</p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          </section>

          {/* Subscription */}
          <section className="pt-2 border-t">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 mt-4">
              <CreditCard className="h-5 w-5" />
              {t('section_subscription')}
            </h2>
            <ProfileSubscription hasStripeCustomer={Boolean(user.stripeCustomerId)} />
          </section>

          {/* Session */}
          <section className="pt-2 border-t">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-2 mt-4">
              <LogOut className="h-5 w-5" />
              {t('section_session')}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">{t('logout_hint')}</p>
            <ProfileLogoutButton />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
