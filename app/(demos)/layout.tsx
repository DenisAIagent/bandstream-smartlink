import "@/app/globals.css";
import { poppins } from "@/lib/fonts";
import ConsentGatedTrackers from "@/components/bandstream/trackers/ConsentGatedTrackers";

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
      <head />
      <body>
        {/* RGPD/ePrivacy : routes de prévisualisation interne. Le GTM corporate
            reste gaté — chargé uniquement si un consentement analytics existe
            déjà sur le domaine. Aucun appel Google avant consentement. */}
        <ConsentGatedTrackers corporateGtmId={CORPORATE_GTM_ID} />
        {children}
      </body>
    </html>
  );
}
