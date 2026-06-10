import "@/app/globals.css";
import { poppins } from "@/lib/fonts";
import GoogleTagManagerHead from "@/components/bandstream/trackers/head/GoogleTagManagerHead";
import GoogleTagManagerBody from "@/components/bandstream/trackers/body/GoogleTagManagerBody";

// Corporate GTM container — #66
const CORPORATE_GTM_ID = 'GTM-N9SS822J';

/**
 * Root layout for the SmartLink template preview routes
 * (/demo, /demo2, /demo3, /demo4, /demo5).
 */
export const metadata = {
  title: 'SmartLink Preview',
  description: 'Bandstream SmartLink template preview',
};

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <GoogleTagManagerHead GTM_ID={CORPORATE_GTM_ID} />
      </head>
      <body>
        <GoogleTagManagerBody GTM_ID={CORPORATE_GTM_ID} />
        {children}
      </body>
    </html>
  );
}
