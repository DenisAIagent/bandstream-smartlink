import "@/app/globals.css";
import type { Metadata } from "next";

import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth"
import { getBandDataFromDomainName } from "@/lib/queries/bands";
import GoogleAnalyticsHead from "@/components/bandstream/trackers/head/GoogleAnalyticsHead";
import GoogleTagManagerHead from "@/components/bandstream/trackers/head/GoogleTagManagerHead";
import GoogleTagManagerBody from "@/components/bandstream/trackers/body/GoogleTagManagerBody";
import ConsentManager from "@/components/bandstream/trackers/consentmanager/ConsentManager";
import UmamiTracker from "@/components/bandstream/trackers/UmamiTracker";
import { Toaster } from "@/components/ui/toaster";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from "next-intl/server";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShieldCheck } from "lucide-react"
import ConsentManagerSettings from "@/components/bandstream/trackers/consentmanager/ConsentManagerSettings";
import {routing} from '@/i18n/routing';
import { poppins } from "@/lib/fonts";

// Corporate GTM container — #66
const CORPORATE_GTM_ID = 'GTM-N9SS822J';

export async function generateMetadata({ params }: { params: Promise<{ customer: string }> }): Promise<Metadata> {
  const { customer } = await params;
  const requestedBand = await getBandDataFromDomainName(customer);

  return {
    title: requestedBand ? requestedBand.name : 'band.stream',
    description: requestedBand
      ? `${requestedBand.name} on band.stream`
      : 'Your smartlinks platform',
  };
}

type Locale = typeof routing.locales[number];

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ customer: string, locale: Locale }>;
}) {
  const session = await auth()
  const { customer } = await params;
  const requestedBand = await getBandDataFromDomainName(customer);
  const {locale} = await params
  const messages = await getMessages({ locale });
  return (
    <SessionProvider session={session}>
      <html lang="en" className={poppins.variable}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {/* Corporate GTM — always present */}
          <GoogleTagManagerHead GTM_ID={CORPORATE_GTM_ID} />
          {/* Per-artist tracking — conditional */}
          {requestedBand?.trackingGTAG && <GoogleAnalyticsHead GA_MEASUREMENT_ID={requestedBand?.trackingGTAG}/>}
          {requestedBand?.trackingGTM && <GoogleTagManagerHead GTM_ID={requestedBand?.trackingGTM}/>}
        </head>
        <body>
          <GoogleTagManagerBody GTM_ID={CORPORATE_GTM_ID} />
          {requestedBand?.trackingGTM && <GoogleTagManagerBody GTM_ID={requestedBand?.trackingGTM}/>}
          <div>
            <NextIntlClientProvider locale="en" messages={messages}>
              {children}
              <Toaster />
              <ConsentManager />
              {requestedBand?.umamiWebsiteId && (
                <UmamiTracker
                  websiteId={requestedBand.umamiWebsiteId}
                  domainname={requestedBand.domainname}
                />
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <button className="fixed bottom-4 left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors">
                    <ShieldCheck size={20} className="text-white" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Privacy Settings</h3>
                    <div className="space-y-4">
                      <ConsentManagerSettings />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </NextIntlClientProvider>
          </div>
        </body>
      </html>
    </SessionProvider>
  );
}