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

export default function GoogleAnalyticsHead({GA_MEASUREMENT_ID} : {GA_MEASUREMENT_ID : string}){
    return (
        <>
            <Script
                id="google-analytics-script"
                src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
                strategy="afterInteractive"
            />
            <Script id='google-analytics-head' strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    // Set default consent settings
                    gtag('consent', 'default', {
                        'ad_storage': 'denied',
                        'analytics_storage': 'denied'
                    });
                    gtag('js', new Date());
                    gtag('config', ${jsString(GA_MEASUREMENT_ID)});
                `}
            </Script>
        </>
    )
}
