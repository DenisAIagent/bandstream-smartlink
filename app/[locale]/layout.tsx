import "@/app/globals.css";
import type { Metadata } from "next";

import { SessionProvider } from "next-auth/react";
import {notFound} from 'next/navigation';

import { auth } from "@/auth"
import { Toaster } from "@/components/ui/toaster"
import ConsentGatedTrackers from "@/components/bandstream/trackers/ConsentGatedTrackers";
import ConsentManager from "@/components/bandstream/trackers/consentmanager/ConsentManager";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import {routing} from '@/i18n/routing';
import { poppins } from "@/lib/fonts";

// Corporate GTM container — #66
const CORPORATE_GTM_ID = 'GTM-N9SS822J';

// Define the supported locales type
type Locale = typeof routing.locales[number];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "band.stream",
  description: "Your smartlinks platform",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>
}>) {
  const session = await auth()
  const {locale} = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale })

  return (
    <SessionProvider session={session}>
      <html lang={locale} className={poppins.variable}>
        <head>
          <meta name="facebook-domain-verification" content="4vmoy8vx2645tlm3d96lzdgsy7kctb" />
        </head>
        <body>
          {/* RGPD/ePrivacy (art. 82 LIL, lignes directrices CEPD) : le conteneur
              GTM corporate n'est chargé qu'APRÈS consentement analytics — son
              simple chargement transmettrait l'IP du visiteur à Google. */}
          <ConsentGatedTrackers corporateGtmId={CORPORATE_GTM_ID} />
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
            <ConsentManager />
          </NextIntlClientProvider>
        </body>
      </html>
    </SessionProvider>
  );
}