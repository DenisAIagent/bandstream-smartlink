import { auth } from '@/auth'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getUserBandsCount } from '@/lib/queries/bands'
import { ArrowRight, BarChart3, LifeBuoy, Music, Plus } from 'lucide-react'

const AdminPage = async () => {
  const session = await auth()
  const t = await getTranslations('common')
  const ta = await getTranslations('admin')
  const locale = await getLocale()
  const lp = (path: string) => `/${locale}${path}`

  // Fallback défensif : l'accueil ne doit jamais planter sur le comptage
  const bandsCount = await getUserBandsCount().catch(() => 0)
  const hasBands = bandsCount > 0

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">
        {t('welcome')}, {session?.user?.name || session?.user?.email || ta('not-signed-in')}
      </h1>
      <p className="text-muted-foreground mt-1 mb-8">{ta('home_subtitle')}</p>

      <div className="space-y-4">
        {/* Primary next step */}
        <Card className={hasBands ? '' : 'border-primary/40'}>
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {hasBands ? ta('home_create_more_title') : ta('home_create_title')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {ta('home_create_hint')}
              </p>
            </div>
            <Link href={lp('/admin/bands/create')}>
              <Button>
                {ta('home_create_cta')} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href={lp('/admin/bands')}>
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <Music className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="font-medium text-sm">{ta('home_bands_title')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ta('home_bands_hint', { count: bandsCount })}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={lp('/dashboard')}>
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <BarChart3 className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="font-medium text-sm">{ta('home_stats_title')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ta('home_stats_hint')}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={lp('/admin/support')}>
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <LifeBuoy className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="font-medium text-sm">{ta('home_support_title')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ta('home_support_hint')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminPage