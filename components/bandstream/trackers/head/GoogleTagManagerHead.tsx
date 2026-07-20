'use client';
import Script from 'next/script'

/**
 * L'ID vient de la config artiste (base de données). Même si la validation
 * serveur impose un format strict (audit APP-01), on sérialise en JSON avec
 * échappement de `<` : défense en profondeur contre toute injection dans le
 * script inline ou l'URL (jamais d'interpolation brute dans un template JS).
 */
function jsString(value: string): string {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default function GoogleTagManagerHead({GTM_ID} : {GTM_ID : string}){
    return (
        <>
            {/* Load GTM script */}
            <Script
                id="gtm-script"
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GTM_ID)}`}
            />
            {/* Initialize GTM */}
            <Script
                id="gtm-init"
                strategy="afterInteractive"
            >
                {`
                    window.dataLayer = window.dataLayer || [];
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer',${jsString(GTM_ID)});
                `}
            </Script>
        </>
    )
}
